import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Share2, Bath, Bed, Square } from "lucide-react";
import { Property } from "@/hooks/useProperties";

interface CompactPropertyCardProps {
  property: Property;
  showSaveButton?: boolean;
}

const CompactPropertyCard = ({ property, showSaveButton = true }: CompactPropertyCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatArea = (area: number | null) => {
    return area ? `${area} sqm` : 'N/A';
  };

  const primaryImage = property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden">
      <Link to={`/properties/${property.id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-xl">
          <div className="aspect-[4/3] w-full relative">
            <img 
              src={primaryImage} 
              alt={property.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          
          {/* Badges and Actions Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {property.featured && (
              <Badge className="bg-red-600 text-white border-0 text-xs px-2 py-1">Featured</Badge>
            )}
          </div>
          
          {showSaveButton && (
            <div className="absolute top-2 right-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-150 shadow-sm h-8 w-8 p-0"
                aria-label="Save property"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-3">
          {/* Price */}
          <div className="text-lg font-bold text-gray-900 mb-1">
            {formatPrice(property.price)}
          </div>
          
          {/* Property Features */}
          <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
            <div className="flex items-center">
              <Bed className="h-3 w-3 mr-1" />
              <span>{property.bedrooms || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-3 w-3 mr-1" />
              <span>{property.bathrooms || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-3 w-3 mr-1" />
              <span>{formatArea(property.area_sqm)}</span>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">
              {property.address}, {property.city}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150 line-clamp-2 leading-tight">
            {property.title}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default CompactPropertyCard;