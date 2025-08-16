import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Search,
  Filter,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  TrendingUp,
  Home,
  DollarSign,
} from "lucide-react";
import PropertyMapboxAdvanced from "./PropertyMapboxAdvanced";
import { useSearchContext } from "@/contexts/SearchContext";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  images: string[];
  type: string;
  description: string;
  coordinates: { lat: number; lng: number };
  agent: {
    name: string;
    phone: string;
    email: string;
    image: string;
  };
  daysOnMarket: number;
  pricePerSqft: string;
  city?: string; // Added for popular areas calculation
  address?: string; // Added for popular areas calculation
}

interface MapSearchIntegrationProps {
  properties: Property[];
  onPropertySelect?: (propertyId: number) => void;
  onBoundsChange?: (bounds: any, properties: Property[]) => void;
  className?: string;
  height?: string;
  showSidebar?: boolean;
}

const MapSearchIntegration: React.FC<MapSearchIntegrationProps> = ({
  properties,
  onPropertySelect,
  onBoundsChange,
  className = "",
  height = "600px",
  showSidebar = true,
}) => {
  const { searchQuery, filters } = useSearchContext();
  
  // Debug logging
  console.log('MapSearchIntegration received properties:', {
    count: properties.length,
    firstProperty: properties[0],
    firstPropertyCoordinates: properties[0]?.coordinates,
    allProperties: properties
  });
  
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapSettings, setMapSettings] = useState({
    showHeatmap: false,
    showClustering: true,
    show3D: false,
    radiusFilter: 5, // km
    priceRange: [0, 1000000000], // naira
  });
  const [mapStats, setMapStats] = useState({
    averagePrice: 0,
    totalProperties: 0,
    priceRange: { min: 0, max: 0 },
    popularAreas: [] as string[],
  });

  // Calculate map statistics
  const calculateMapStats = useCallback((props: Property[]) => {
    if (props.length === 0) {
      setMapStats({
        averagePrice: 0,
        totalProperties: 0,
        priceRange: { min: 0, max: 0 },
        popularAreas: [],
      });
      return;
    }

    // Convert prices to numbers
    const prices = props.map(p => {
      const str = typeof p.price === 'number' ? String(p.price) : String(p.price || '0');
      const numStr = str.replace(/[₦,]/g, "");
      if (numStr.includes("million")) {
        return parseFloat(numStr.replace("million", "")) * 1000000;
      }
      if (numStr.includes("billion")) {
        return parseFloat(numStr.replace("billion", "")) * 1000000000;
      }
      return parseFloat(numStr) || 0;
    });

    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Calculate popular areas
    const areaCount = props.reduce((acc, prop) => {
      // Use city if available, fallback to address, or skip if neither exists
      const area = prop.city || prop.address?.split(",")[0] || 'Unknown';
      if (area && area !== 'Unknown') {
        acc[area] = (acc[area] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const popularAreas = Object.entries(areaCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area);

    setMapStats({
      averagePrice,
      totalProperties: props.length,
      priceRange: { min: minPrice, max: maxPrice },
      popularAreas,
    });
  }, []);

  // Filter properties based on map bounds and other filters
  const filterPropertiesByBounds = useCallback((bounds: any, allProps: Property[]) => {
    if (!bounds) return allProps;

    const filtered = allProps.filter(property => {
      const position = property.coordinates || { lat: 6.5244, lng: 3.3792 };
      
      // Check if property is within map bounds
      const withinBounds = 
        position.lat >= bounds.getSouth() &&
        position.lat <= bounds.getNorth() &&
        position.lng >= bounds.getWest() &&
        position.lng <= bounds.getEast();

      // Apply price filter
      const priceNumber = (() => {
        const str = typeof property.price === 'number' ? String(property.price) : String(property.price || '0');
        return parseFloat(str.replace(/[₦,]/g, "")) || 0;
      })();
      const withinPriceRange = 
        priceNumber >= mapSettings.priceRange[0] &&
        priceNumber <= mapSettings.priceRange[1];

      return withinBounds && withinPriceRange;
    });

    return filtered;
  }, [mapSettings.priceRange]);

  // Handle map bounds change
  const handleBoundsChange = useCallback((bounds: any) => {
    setMapBounds(bounds);
    const boundsFiltered = filterPropertiesByBounds(bounds, properties);
    setFilteredProperties(boundsFiltered);
    onBoundsChange?.(bounds, boundsFiltered);
    calculateMapStats(boundsFiltered);
  }, [properties, filterPropertiesByBounds, onBoundsChange, calculateMapStats]);

  // Handle property selection
  const handlePropertySelect = useCallback((propertyId: number) => {
    setSelectedProperty(propertyId);
    onPropertySelect?.(propertyId);
  }, [onPropertySelect]);

  // Reset map filters
  const resetMapFilters = () => {
    setMapSettings({
      showHeatmap: false,
      showClustering: true,
      show3D: false,
      radiusFilter: 5,
      priceRange: [0, 1000000000],
    });
    setFilteredProperties(properties);
    calculateMapStats(properties);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    if (price >= 1000000000) {
      return `₦${(price / 1000000000).toFixed(1)}B`;
    }
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `₦${(price / 1000).toFixed(1)}K`;
    }
    return `₦${price.toFixed(0)}`;
  };

  // Update filtered properties when properties or settings change
  useEffect(() => {
    const filtered = filterPropertiesByBounds(mapBounds, properties);
    setFilteredProperties(filtered);
    calculateMapStats(filtered);
  }, [properties, mapBounds, filterPropertiesByBounds, calculateMapStats]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'} ${className}`}>
      <div className={`flex ${isFullscreen ? 'h-screen' : ''}`}>
        {/* Map Container */}
        <div className={`${showSidebar && !isFullscreen ? 'flex-1' : 'w-full'} relative`}>
          <PropertyMapboxAdvanced
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            onBoundsChange={handleBoundsChange}
            searchQuery={searchQuery}
            showHeatmap={mapSettings.showHeatmap}
            enableClustering={mapSettings.showClustering}
            height={isFullscreen ? "100vh" : height}
            className="w-full"
          />

          {/* Fullscreen Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white shadow-lg"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Map Statistics Overlay */}
          <div className="absolute bottom-4 left-4 z-10">
            <Card className="shadow-lg">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{mapStats.totalProperties}</div>
                    <div className="text-gray-600 text-xs">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{formatPrice(mapStats.averagePrice)}</div>
                    <div className="text-gray-600 text-xs">Avg Price</div>
                  </div>
                </div>
                {mapStats.popularAreas.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs text-gray-600 mb-1">Popular Areas:</div>
                    <div className="flex flex-wrap gap-1">
                      {mapStats.popularAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && !isFullscreen && (
          <div className="w-80 bg-gray-50 border-l overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Map Settings</h3>
                <Button variant="outline" size="sm" onClick={resetMapFilters}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Search Context */}
              {searchQuery && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Search className="h-4 w-4 mr-2" />
                      Active Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-blue-100 text-blue-800">
                      {searchQuery}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Map View Options */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Layers className="h-4 w-4 mr-2" />
                    View Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="heatmap" className="text-sm">Price Heatmap</Label>
                    <Switch
                      id="heatmap"
                      checked={mapSettings.showHeatmap}
                      onCheckedChange={(checked) =>
                        setMapSettings(prev => ({ ...prev, showHeatmap: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="clustering" className="text-sm">Property Clustering</Label>
                    <Switch
                      id="clustering"
                      checked={mapSettings.showClustering}
                      onCheckedChange={(checked) =>
                        setMapSettings(prev => ({ ...prev, showClustering: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Price Range Filter */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Price Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Min: {formatPrice(mapSettings.priceRange[0])}</span>
                      <span>Max: {formatPrice(mapSettings.priceRange[1])}</span>
                    </div>
                    <Slider
                      value={mapSettings.priceRange}
                      onValueChange={(value) =>
                        setMapSettings(prev => ({ ...prev, priceRange: value }))
                      }
                      min={0}
                      max={1000000000}
                      step={1000000}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Properties Shown:</span>
                    <span className="font-semibold">{filteredProperties.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price Range:</span>
                    <span className="font-semibold">
                      {formatPrice(mapStats.priceRange.min)} - {formatPrice(mapStats.priceRange.max)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Price:</span>
                    <span className="font-semibold">{formatPrice(mapStats.averagePrice)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Properties List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Visible Properties ({filteredProperties.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredProperties.slice(0, 10).map((property) => (
                      <div
                        key={property.id}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedProperty === property.id
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                        onClick={() => handlePropertySelect(property.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {property.price}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {property.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredProperties.length > 10 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        +{filteredProperties.length - 10} more properties
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearchIntegration;
