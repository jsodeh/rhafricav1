import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Heart,
  Bed,
  Bath,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Layers,
  Navigation,
  Crosshair,
  Search,
  Home,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";

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
}

interface PropertyMapAdvancedProps {
  properties: Property[];
  selectedProperty?: number | null;
  onPropertySelect?: (propertyId: number) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
  showHeatmap?: boolean;
  enableClustering?: boolean;
  onBoundsChange?: (bounds: any) => void;
  searchQuery?: string;
}

const PropertyMapboxAdvanced: React.FC<PropertyMapAdvancedProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  className = "",
  height = "600px",
  showControls = true,
  showHeatmap = false,
  enableClustering = true,
  onBoundsChange,
  searchQuery,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clustersRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState("streets-v12");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [showHeatmapLayer, setShowHeatmapLayer] = useState(showHeatmap);
  const [showClustering, setShowClustering] = useState(enableClustering);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get Mapbox access token from environment
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Map style options
  const mapStyles = [
    { value: "streets-v12", label: "Streets", description: "Detailed street view" },
    { value: "satellite-v9", label: "Satellite", description: "Aerial imagery" },
    { value: "satellite-streets-v12", label: "Hybrid", description: "Satellite with labels" },
    { value: "light-v11", label: "Light", description: "Minimal design" },
    { value: "dark-v11", label: "Dark", description: "Dark theme" },
    { value: "outdoors-v12", label: "Outdoors", description: "Terrain and parks" },
  ];

  // Generate realistic positions for properties if coordinates are not provided
  const getPropertyPosition = (property: Property, index: number) => {
    if (property.coordinates) {
      return property.coordinates;
    }

    // Lagos area coordinates with more variety
    const lagosPositions = [
      { lat: 6.4281, lng: 3.4219 }, // Victoria Island
      { lat: 6.4698, lng: 3.5852 }, // Lekki
      { lat: 6.5875, lng: 3.3619 }, // Ikeja
      { lat: 6.4541, lng: 3.4316 }, // Ikoyi
      { lat: 6.4986, lng: 3.3897 }, // Surulere
      { lat: 6.5244, lng: 3.3792 }, // Lagos Island
      { lat: 6.6018, lng: 3.3515 }, // Agege
      { lat: 6.4626, lng: 3.2447 }, // Magodo
      { lat: 6.5434, lng: 3.3486 }, // Yaba
      { lat: 6.5027, lng: 3.6218 }, // Ajah
    ];

    return lagosPositions[index % lagosPositions.length];
  };

  // Get property price as number for heatmap
  const getPropertyPriceNumber = (price: string): number => {
    const numStr = price.replace(/[₦,]/g, "");
    if (numStr.includes("million")) {
      return parseFloat(numStr.replace("million", "")) * 1000000;
    }
    if (numStr.includes("billion")) {
      return parseFloat(numStr.replace("billion", "")) * 1000000000;
    }
    return parseFloat(numStr) || 0;
  };

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 2000
            });
          }
        },
        (error) => {
          console.warn("Could not get user location:", error);
        }
      );
    }
  }, []);

  // Initialize map (once)
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox access token not found. Please add VITE_MAPBOX_ACCESS_TOKEN to your environment variables.');
      return;
    }

    if (!mapRef.current || mapInstanceRef.current) return;

    const loadMapbox = async () => {
      try {
        // Lazy-load mapbox-gl safely
        // @ts-ignore
        if (typeof window !== 'undefined' && !window.mapboxgl) {
          const mod = await import('mapbox-gl');
          // @ts-ignore
          window.mapboxgl = mod.default || mod;
        }

        // @ts-ignore
        const mapboxgl = window.mapboxgl;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: `mapbox://styles/mapbox/${mapStyle}`,
          center: [3.3792, 6.5244], // Lagos center
          zoom: 11,
          pitch: viewMode === "3d" ? 45 : 0,
          bearing: 0,
          antialias: true
        });

        // Add enhanced controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
        map.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }), 'top-right');

        map.on('load', () => {
          setMapLoaded(true);
          addPropertyData(map);
          // When there are no properties, try to center on user location gracefully
          if (!properties || properties.length === 0) {
            getUserLocation();
          }
          setupMapInteractions(map);
        });

        map.on('moveend', () => {
          if (onBoundsChange) {
            onBoundsChange(map.getBounds());
          }
        });

        mapInstanceRef.current = map;

        return () => {
          try {
            map.remove();
          } catch (e) {
            // Ignore remove errors
          }
        };
      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };

    loadMapbox();
    // Do not include dependencies that cause re-creation; we update layers separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MAPBOX_TOKEN]);

  // Add property data to map
  const addPropertyData = useCallback((map: any) => {
    if (!map || !mapLoaded) return;

    // Prepare GeoJSON data
    const geojsonData = {
      type: 'FeatureCollection',
      features: properties.map((property, index) => {
        const position = getPropertyPosition(property, index);
        return {
          type: 'Feature',
          properties: {
            id: property.id,
            title: property.title,
            price: property.price,
            priceNumber: getPropertyPriceNumber(property.price),
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            location: property.location,
            type: property.type,
            image: property.image,
            isSelected: selectedProperty === property.id
          },
          geometry: {
            type: 'Point',
            coordinates: [position.lng, position.lat]
          }
        };
      })
    };

    // Add property source
    if (map.getSource('properties')) {
      map.getSource('properties').setData(geojsonData);
    } else {
      map.addSource('properties', {
        type: 'geojson',
        data: geojsonData,
        cluster: showClustering,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
    }

    // Add clusters layer
    if (showClustering) {
      if (!map.getLayer('clusters')) {
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'properties',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              10,
              '#f1f075',
              20,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              20,
              40
            ]
          }
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'properties',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });
      }
    } else {
      if (map.getLayer('clusters')) map.removeLayer('clusters');
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
    }

    // Add heatmap layer
    if (showHeatmapLayer) {
      if (!map.getLayer('property-heatmap')) {
        map.addLayer({
          id: 'property-heatmap',
          type: 'heatmap',
          source: 'properties',
          maxzoom: 15,
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'priceNumber'],
              0,
              0,
              100000000,
              1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              1,
              15,
              3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(33,102,172,0)',
              0.2,
              'rgb(103,169,207)',
              0.4,
              'rgb(209,229,240)',
              0.6,
              'rgb(253,219,199)',
              0.8,
              'rgb(239,138,98)',
              1,
              'rgb(178,24,43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              2,
              15,
              20
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7,
              1,
              15,
              0
            ]
          }
        }, 'waterway-label');
      }
    } else {
      if (map.getLayer('property-heatmap')) map.removeLayer('property-heatmap');
    }

    // Add unclustered points
    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['get', 'isSelected'],
            '#2563eb',
            '#ef4444'
          ],
          'circle-radius': [
            'case',
            ['get', 'isSelected'],
            12,
            8
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.addLayer({
        id: 'property-labels',
        type: 'symbol',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': [
            'format',
            ['get', 'price'],
            { 'font-scale': 0.8 }
          ],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#1a1a1a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      });
    }
  }, [properties, selectedProperty, showClustering, showHeatmapLayer, mapLoaded]);

  // Setup map interactions
  const setupMapInteractions = useCallback((map: any) => {
    // Click on clusters
    map.on('click', 'clusters', (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('properties').getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    // Click on unclustered points
    map.on('click', 'unclustered-point', (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      map.flyTo({
        center: coordinates,
        zoom: 15
      });
      
      setSelectedPopup(properties.id);
      onPropertySelect?.(properties.id);
    });

    // Change cursor on hover
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });
  }, [onPropertySelect]);

  // Update map style
  const changeMapStyle = (newStyle: string) => {
    if (mapInstanceRef.current) {
      setMapStyle(newStyle);
      mapInstanceRef.current.setStyle(`mapbox://styles/mapbox/${newStyle}`);
      
      mapInstanceRef.current.once('style.load', () => {
        addPropertyData(mapInstanceRef.current);
        setupMapInteractions(mapInstanceRef.current);
      });
    }
  };

  // Toggle 3D view
  const toggle3D = () => {
    if (mapInstanceRef.current) {
      const newViewMode = viewMode === "2d" ? "3d" : "2d";
      setViewMode(newViewMode);
      
      mapInstanceRef.current.easeTo({
        pitch: newViewMode === "3d" ? 45 : 0,
        bearing: newViewMode === "3d" ? -17.6 : 0,
        duration: 1000
      });
    }
  };

  // Reset map view
  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [3.3792, 6.5244],
        zoom: 11,
        pitch: 0,
        bearing: 0,
        duration: 2000
      });
    }
  };

  // Fit to properties bounds
  const fitToBounds = () => {
    if (mapInstanceRef.current && properties.length > 0) {
      const coordinates = properties.map((property, index) => {
        const position = getPropertyPosition(property, index);
        return [position.lng, position.lat];
      });
      
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new (window as any).mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      
      mapInstanceRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  };

  // Update data and layers when inputs change
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      addPropertyData(mapInstanceRef.current);
      setupMapInteractions(mapInstanceRef.current);
    }
  }, [properties, selectedProperty, showClustering, showHeatmapLayer, addPropertyData, setupMapInteractions, mapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-gray-600 mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Map Not Available</h3>
            <p className="text-sm">Please add your Mapbox access token to enable maps.</p>
          </div>
          <div className="bg-gray-50 rounded p-4 text-left text-xs">
            <p>1. Get your free access token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a></p>
            <p>2. Add it to your .env.local file:</p>
            <code className="block mt-1 bg-white p-2 rounded">VITE_MAPBOX_ACCESS_TOKEN=your_token_here</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {/* Property Count */}
          <Badge className="bg-white text-gray-900 border shadow-lg">
            {properties.length} properties
          </Badge>

          {/* Map Style Selector */}
          <Card className="p-2 shadow-lg">
            <Select value={mapStyle} onValueChange={changeMapStyle}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <Layers className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mapStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="text-left">
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-gray-500">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* View Options */}
          <Card className="p-3 shadow-lg space-y-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="clustering" 
                checked={showClustering}
                onCheckedChange={(checked) => setShowClustering(checked)}
              />
              <Label htmlFor="clustering" className="text-xs">Clustering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="heatmap" 
                checked={showHeatmapLayer}
                onCheckedChange={(checked) => setShowHeatmapLayer(checked)}
              />
              <Label htmlFor="heatmap" className="text-xs">Heat Map</Label>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={toggle3D}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title={viewMode === "2d" ? "Switch to 3D" : "Switch to 2D"}
            >
              <span className="text-xs font-bold">{viewMode === "2d" ? "3D" : "2D"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={getUserLocation}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title="My Location"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fitToBounds}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title="Fit All Properties"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="w-10 h-10 p-0 bg-white shadow-lg"
              title="Reset View"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search Integration Indicator */}
      {searchQuery && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-blue-600 text-white shadow-lg">
            <Search className="h-3 w-3 mr-1" />
            Filtered: {searchQuery}
          </Badge>
        </div>
      )}

      {/* Property Popup */}
      {selectedPopup && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          {(() => {
            const property = properties.find(p => p.id === selectedPopup);
            if (!property) return null;

            return (
              <Card className="w-80 shadow-xl border-0">
                <CardContent className="p-0">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPopup(null)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 bg-white/90 hover:bg-white z-10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white border-0 text-xs">
                      {property.type}
                    </Badge>
                    <div className="absolute top-2 right-8">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-xl mb-2">
                      {property.price}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        <span>{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <span>{property.area}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">
                        {property.location}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/properties/${property.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="px-3">
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}

      {/* User Location Indicator */}
      {userLocation && (
        <div className="absolute bottom-4 right-4 z-10">
          <Badge className="bg-green-600 text-white shadow-lg">
            <Navigation className="h-3 w-3 mr-1" />
            Current Location
          </Badge>
        </div>
      )}
    </div>
  );
};

export default PropertyMapboxAdvanced;
