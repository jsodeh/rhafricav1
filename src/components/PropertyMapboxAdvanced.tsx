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
import 'mapbox-gl/dist/mapbox-gl.css';

// Declare global propertyMarkers array
declare global {
  interface Window {
    propertyMarkers: any[];
    mapboxgl: any;
  }
}

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState("streets-v12");

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const getPropertyPosition = (property: Property, index: number) => {
    if (property.coordinates) {
      return property.coordinates;
    }
    const lagosPositions = [
      { lat: 6.4281, lng: 3.4219 },
      { lat: 6.4698, lng: 3.5852 },
      { lat: 6.5875, lng: 3.3619 },
      { lat: 6.4541, lng: 3.4316 },
      { lat: 6.4986, lng: 3.3897 },
      { lat: 6.5244, lng: 3.3792 },
    ];
    return lagosPositions[index % lagosPositions.length];
  };

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox access token not found.');
      return;
    }

    if (!mapRef.current || mapInstanceRef.current) return;

    const loadMapbox = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: `mapbox://styles/mapbox/${mapStyle}`,
          center: [3.3792, 6.5244],
          zoom: 11,
        });

        map.on('load', () => {
          setMapLoaded(true);
          addMarkers(map);
        });

        mapInstanceRef.current = map;

        return () => {
          map.remove();
        };
      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };

    loadMapbox();
  }, [MAPBOX_TOKEN, mapStyle]);

  const addMarkers = (map: any) => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (properties.length === 0) return;

    const bounds = new window.mapboxgl.LngLatBounds();

    properties.forEach((property, index) => {
      const position = getPropertyPosition(property, index);
      bounds.extend([position.lng, position.lat]);

      const el = document.createElement('div');
      el.style.width = '10px';
      el.style.height = '10px';
      el.style.backgroundImage = `url(${property.image})`;
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        setSelectedPopup(property.id);
        onPropertySelect?.(property.id);
        map.flyTo({ center: [position.lng, position.lat], zoom: 15 });
      });

      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([position.lng, position.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
  };

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      addMarkers(mapInstanceRef.current);
    }
  }, [properties, mapLoaded]);

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full" style={{ height }} />
      {selectedPopup && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          {(() => {
            const property = properties.find(p => p.id === selectedPopup);
            if (!property) return null;

            return (
              <Card className="w-64 shadow-xl border-0">
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
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-lg mb-1">{property.price}</div>
                    <div className="text-sm text-gray-600 mb-2">{property.location}</div>
                    <Link to={`/properties/${property.id}`}>
                      <Button size="sm" className="w-full">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PropertyMapboxAdvanced;
