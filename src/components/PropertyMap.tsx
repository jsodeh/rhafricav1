import React from "react";
import PropertyMapboxAdvanced from "./PropertyMapboxAdvanced";

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

// Enhanced map component with advanced features
const PropertyMap: React.FC<PropertyMapProps> = (props) => {
  return <PropertyMapboxAdvanced {...props} />;
};

export default PropertyMap;
