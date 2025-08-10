import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Navigation, X } from 'lucide-react';

interface LocationData {
  address: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface MapboxLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  className?: string;
}

const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (showMap && mapContainer.current && !map.current && MAPBOX_TOKEN) {
      initializeMap();
    }
  }, [showMap, MAPBOX_TOKEN]);

  const initializeMap = async () => {
    try {
      // Dynamically import Mapbox GL JS
      const mapboxgl = await import('mapbox-gl');
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      const initialCoords = selectedLocation?.coordinates || { lng: 3.3792, lat: 6.5244 }; // Lagos, Nigeria

      map.current = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialCoords.lng, initialCoords.lat],
        zoom: 12
      });

      // Add marker
      marker.current = new mapboxgl.default.Marker({
        draggable: true,
        color: '#3B82F6'
      })
        .setLngLat([initialCoords.lng, initialCoords.lat])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        reverseGeocode(lngLat.lat, lngLat.lng);
      });

      // Handle map click
      map.current.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        marker.current.setLngLat([lng, lat]);
        reverseGeocode(lat, lng);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=ng&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Error searching location:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!MAPBOX_TOKEN) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=ng`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const locationData = parseLocationFromFeature(feature, { lat, lng });
        setSelectedLocation(locationData);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const parseLocationFromFeature = (feature: any, coordinates: { lat: number; lng: number }): LocationData => {
    const context = feature.context || [];
    const placeName = feature.place_name || '';
    
    // Extract city and state from context
    let city = '';
    let state = '';
    
    context.forEach((item: any) => {
      if (item.id.includes('place')) {
        city = item.text;
      } else if (item.id.includes('region')) {
        state = item.text;
      }
    });

    // If city not found in context, try to extract from place_name
    if (!city && placeName) {
      const parts = placeName.split(',');
      if (parts.length > 1) {
        city = parts[1].trim();
      }
    }

    return {
      address: feature.text || placeName.split(',')[0] || '',
      city: city || 'Lagos', // Default to Lagos if not found
      state: state || 'Lagos', // Default to Lagos State if not found
      coordinates
    };
  };

  const handleSuggestionClick = (suggestion: any) => {
    const coordinates = {
      lat: suggestion.center[1],
      lng: suggestion.center[0]
    };
    
    const locationData = parseLocationFromFeature(suggestion, coordinates);
    setSelectedLocation(locationData);
    onLocationSelect(locationData);
    setSuggestions([]);
    setSearchQuery(suggestion.place_name);

    // Update map if visible
    if (map.current && marker.current) {
      map.current.setCenter([coordinates.lng, coordinates.lat]);
      marker.current.setLngLat([coordinates.lng, coordinates.lat]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude);
          
          if (map.current && marker.current) {
            map.current.setCenter([longitude, latitude]);
            marker.current.setLngLat([longitude, latitude]);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchLocation(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (!MAPBOX_TOKEN) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Mapbox token not configured</p>
            <p className="text-sm">Please add VITE_MAPBOX_ACCESS_TOKEN to your environment variables</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Property Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Label htmlFor="location-search">Search for location</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="location-search"
              type="text"
              placeholder="Search for address, city, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={getCurrentLocation}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{suggestion.text}</p>
                      <p className="text-sm text-gray-500">{suggestion.place_name}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Selected Location</p>
                  <p className="text-sm text-blue-700">
                    {selectedLocation.address}, {selectedLocation.city}, {selectedLocation.state}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Coordinates: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedLocation(null);
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Map Toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>

        {/* Map Container */}
        {showMap && (
          <div className="space-y-2">
            <div 
              ref={mapContainer} 
              className="w-full h-64 rounded-lg border border-gray-200"
              style={{ minHeight: '256px' }}
            />
            <p className="text-xs text-gray-500 text-center">
              Click on the map or drag the marker to select a location
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapboxLocationPicker;