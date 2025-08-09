import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Share2, Bath, Bed, Square, Calendar, Shield } from "lucide-react";
import { Property } from "@/hooks/useProperties";

interface PropertyCardProps {
  property: Property;
  variant?: 'compact' | 'standard' | 'featured';
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

const PropertyCard = ({ 
  property, 
  variant = 'standard',
  aspectRatio = '16:9'
}: PropertyCardProps) => {
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const primaryImage = property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg';

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      default:
        return 'aspect-[16/9]';
    }
  };

  // Get variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'bg-white rounded-lg shadow-sm border border-gray-100';
      case 'featured':
        return 'bg-white rounded-lg shadow-lg border border-gray-100';
      default:
        return 'bg-white rounded-lg shadow-md border border-gray-100';
    }
  };

  return (
    <Card className={`${getVariantClasses()} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full rounded-xl`}>
      {/* Image Container with Fixed Aspect Ratio */}
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100">
        <div className={`${getAspectRatioClass()} w-full relative`}>
          <img 
            src={primaryImage} 
            alt={property.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.featured && (
            <Badge className="bg-amber-500 text-white border-0 shadow-md backdrop-blur-sm">Featured</Badge>
          )}
          {property.verified && (
            <Badge className="bg-green-600 text-white border-0 shadow-md backdrop-blur-sm">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white/95 backdrop-blur-sm border-white/30 hover:bg-white hover:scale-105 hover:shadow-md transition-all duration-150 shadow-sm"
            aria-label="Add to favorites"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white/95 backdrop-blur-sm border-white/30 hover:bg-white hover:scale-105 hover:shadow-md transition-all duration-150 shadow-sm"
            aria-label="Share property"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Card Content with CSS Grid Layout */}
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs capitalize border-gray-300 text-gray-700 bg-gray-50">
            {property.property_type}
          </Badge>
          <span className="text-xs text-gray-600 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {getTimeAgo(property.created_at)}
          </span>
        </div>
        
        {/* Title Section */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-150 line-clamp-2 flex-shrink-0 leading-tight">
          {property.title}
        </h3>
        
        {/* Location Section */}
        <div className="flex items-center text-gray-700 mb-4 flex-shrink-0">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-600" />
          <span className="text-sm truncate">
            {property.address}, {property.city}, {property.state}
          </span>
        </div>
        
        {/* Property Features */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center space-x-4 text-sm text-gray-700">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1.5 text-gray-600" />
              <span>{property.bedrooms || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1.5 text-gray-600" />
              <span>{property.bathrooms || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1.5 text-gray-600" />
              <span>{formatArea(property.area_sqm)}</span>
            </div>
          </div>
        </div>
        
        {/* Spacer to push footer content to bottom */}
        <div className="flex-1"></div>
        
        {/* Price and Agent Section */}
        <div className="flex items-end justify-between mb-5 flex-shrink-0">
          <div>
            <span className="text-2xl font-bold text-blue-700 leading-none">
              {formatPrice(property.price)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">Listed by</p>
            <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
              {property.real_estate_agents?.agency_name || 'Real Estate Agent'}
            </p>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="pt-5 border-t border-gray-100 flex-shrink-0">
          <Link to={`/properties/${property.id}`} className="block">
            <Button 
              variant="default" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 font-medium"
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
