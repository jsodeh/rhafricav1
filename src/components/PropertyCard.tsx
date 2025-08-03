import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Share2, Bath, Bed, Square, Calendar, Shield } from "lucide-react";
import { Property } from "@/hooks/useProperties";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
      <div className="relative">
        <img 
          src={primaryImage} 
          alt={property.title} 
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.featured && (
            <Badge className="bg-amber-500 text-white border-0">Featured</Badge>
          )}
          {property.verified && (
            <Badge className="bg-green-500 text-white border-0">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs capitalize">{property.property_type}</Badge>
          <span className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {getTimeAgo(property.created_at)}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.address}, {property.city}, {property.state}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms || 'N/A'}
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms || 'N/A'}
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              {formatArea(property.area_sqm)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-700">{formatPrice(property.price)}</span>
          <div className="text-right">
            <p className="text-xs text-gray-500">Listed by</p>
            <p className="text-sm font-medium text-gray-700">
              {property.real_estate_agents?.agency_name || 'Real Estate Agent'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link to={`/properties/${property.id}`} className="block">
            <Button variant="blue" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
