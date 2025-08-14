import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: number | null;
  onPropertySelect?: (propertyId: number) => void;
  className?: string;
  height?: string;
}

const PropertyMapbox: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  className = "",
  height = "600px",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState<number | null>(null);

  // Get Mapbox access token from environment
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Generate realistic positions for properties if coordinates are not provided
  const getPropertyPosition = (property: Property, index: number) => {
    if (property.coordinates) {
      return property.coordinates;
    }

    // Default Lagos area coordinates
    const lagosPositions = [
      { lat: 6.4281, lng: 3.4219 }, // Victoria Island
      { lat: 6.4698, lng: 3.5852 }, // Lekki
      { lat: 6.5875, lng: 3.3619 }, // Ikeja
      { lat: 6.4541, lng: 3.4316 }, // Ikoyi
      { lat: 6.4986, lng: 3.3897 }, // Surulere
      { lat: 6.5244, lng: 3.3792 }, // Lagos Island
    ];

    return lagosPositions[index % lagosPositions.length];
  };

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox access token not found. Please add VITE_MAPBOX_ACCESS_TOKEN to your environment variables.');
      return;
    }

    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      try {
        // @ts-ignore
        if (typeof window !== 'undefined' && !window.mapboxgl) {
          const mapboxgl = await import('mapbox-gl');
          // @ts-ignore
          window.mapboxgl = mapboxgl.default;
        }

        // @ts-ignore
        const mapboxgl = window.mapboxgl;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [3.3792, 6.5244], // Lagos center
          zoom: 11
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

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
  }, [MAPBOX_TOKEN]);

  const addMarkers = (map: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    properties.forEach((property, index) => {
      const position = getPropertyPosition(property, index);
      const isSelected = selectedProperty === property.id;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'mapbox-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: ${isSelected ? '#2563eb' : '#ef4444'};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
      `;

      const price = (() => {
        const raw = typeof property.price === 'number' ? String(property.price) : String(property.price || '');
        return raw
          .replace("₦", "")
          .replace(",000,000", "M")
          .replace(",000", "K");
      })();
      
      el.textContent = price;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      el.addEventListener('click', () => {
        map.flyTo({
          center: [position.lng, position.lat],
          zoom: 15
        });
        setSelectedPopup(property.id);
        onPropertySelect?.(property.id);
      });

      // @ts-ignore
      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([position.lng, position.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  const formatPrice = (price: any) => {
    const raw = typeof price === 'number' ? String(price) : String(price || '');
    return raw
      .replace("₦", "")
      .replace(",000,000", "M")
      .replace(",000", "K");
  };

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

      {/* Property Count Badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge className="bg-white text-gray-900 border shadow-lg">
          {properties.length} properties
        </Badge>
      </div>

      {/* Property Popup */}
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
                  <div className="p-3">
                    <div className="font-bold text-lg mb-1">
                      {property.price}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <span>{property.bedrooms} bed</span>
                      <span>•</span>
                      <span>{property.bathrooms} bath</span>
                      <span>•</span>
                      <span>{property.area}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">
                        {property.location}
                      </span>
                    </div>
                    <Link to={`/properties/${property.id}`}>
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
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

export default PropertyMapbox;
