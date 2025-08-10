import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import PropertyMapboxAdvanced from "@/components/PropertyMapboxAdvanced";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  List,
  Filter,
  Search,
  Home,
  Bed,
  Bath,
  Square,
  Heart,
} from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import LoadingState from "@/components/LoadingState";

const MapSearch = () => {
  const { properties, isLoading, error, refetch, isEmpty } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showPropertyList, setShowPropertyList] = useState(false);

  // Transform properties for map display
  const mapProperties = properties.map(property => ({
    id: property.id,
    title: property.title,
    location: `${property.city}, ${property.state}`,
    price: `₦${property.price?.toLocaleString()}`,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area_sqm ? `${property.area_sqm} sqm` : null,
    image: property.images?.[0] || '/placeholder.svg',
    images: property.images || ['/placeholder.svg'],
    type: property.listing_type === 'sale' ? 'For Sale' : 'For Rent',
    description: property.description,
    coordinates: { 
      lat: property.latitude || 6.5244, // Default to Lagos coordinates
      lng: property.longitude || 3.3792 
    },
    agent: property.real_estate_agents ? {
      name: property.real_estate_agents.agency_name || 'Real Estate Hotspot',
      phone: property.real_estate_agents.phone || '',
      email: property.real_estate_agents.email || '',
      image: property.real_estate_agents.profile_image_url || '/placeholder.svg',
    } : {
      name: 'Real Estate Hotspot',
      phone: '+234 800 HOTSPOT',
      email: 'info@realestatehotspot.com',
      image: '/placeholder.svg',
    },
    daysOnMarket: Math.floor((Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    pricePerSqft: property.area_sqm ? `₦${Math.round(property.price / property.area_sqm).toLocaleString()}` : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="relative">
        {/* Map Header */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Map Search
                  </h1>
                  <p className="text-sm text-gray-600">
                    {properties.length} properties found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showPropertyList ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowPropertyList(!showPropertyList)}
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                  <Link to="/search">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filters
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <div className="h-screen">
          <LoadingState
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            loadingText="Loading map properties..."
          >
            {mapProperties.length > 0 ? (
              <PropertyMapboxAdvanced
                properties={mapProperties}
                onPropertySelect={setSelectedProperty}
                selectedProperty={selectedProperty}
                className="w-full h-full"
              />
            ) : (
              <PropertyMapboxAdvanced
                properties={[]}
                onPropertySelect={setSelectedProperty}
                selectedProperty={null}
                className="w-full h-full"
              />
            )}
          </LoadingState>
        </div>

        {/* Property List Sidebar */}
        {showPropertyList && mapProperties.length > 0 && (
          <div className="absolute top-20 right-4 bottom-4 w-80 z-10">
            <Card className="h-full shadow-lg">
              <CardContent className="p-0 h-full">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Properties</h3>
                  <p className="text-sm text-gray-600">{mapProperties.length} found</p>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                  {mapProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedProperty?.id === property.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-semibold text-blue-700 text-sm">
                              {property.price}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {property.type}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
                            {property.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {property.location}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {property.bedrooms && (
                              <div className="flex items-center gap-1">
                                <Bed className="h-3 w-3" />
                                <span>{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center gap-1">
                                <Bath className="h-3 w-3" />
                                <span>{property.bathrooms}</span>
                              </div>
                            )}
                            {property.area && (
                              <div className="flex items-center gap-1">
                                <Square className="h-3 w-3" />
                                <span>{property.area}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selected Property Details */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={selectedProperty.image}
                    alt={selectedProperty.title}
                    className="w-20 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xl font-bold text-blue-700">
                          {selectedProperty.price}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {selectedProperty.type}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProperty(null)}
                      >
                        ×
                      </Button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {selectedProperty.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedProperty.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {selectedProperty.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{selectedProperty.bedrooms}</span>
                          </div>
                        )}
                        {selectedProperty.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{selectedProperty.bathrooms}</span>
                          </div>
                        )}
                        {selectedProperty.area && (
                          <div className="flex items-center gap-1">
                            <Square className="h-4 w-4" />
                            <span>{selectedProperty.area}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Link to={`/properties/${selectedProperty.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSearch;