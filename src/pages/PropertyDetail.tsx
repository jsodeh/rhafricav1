import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BookingModal } from "@/components/BookingModal";
import ContactFormModal from "@/components/ContactFormModal";
import { useContactForms } from "@/hooks/useContactForms";
import { PropertySEO, BreadcrumbSEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Heart,
  Share2,
  EyeOff,
  MoreHorizontal,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Car,
  Home,
  Building,
  Thermometer,
  Zap,
  Shield,
  TreePine,
  Camera,
  Play,
  Eye,
  Clock,
  Navigation,
} from "lucide-react";
import StickyNavigation from "@/components/StickyNavigation";
import { useProperty } from "@/hooks/useProperties";

// Error Boundary Component
class PropertyDetailErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PropertyDetail Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container bg-white">
          <StickyNavigation isScrolled={true} showSearchInNav={false} />
          <div className="container mx-auto page-content">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
                <p className="text-gray-600 mb-6">We're having trouble loading this property.</p>
                <Link to="/properties">
                  <Button>Browse Properties</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PropertyDetail = () => {
  const { id } = useParams();
  const { data: fetchedProperty, isLoading, error } = useProperty(id || '');
  
  // Component state
  const [activeTab, setActiveTab] = useState("photos");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const { submitContactForm } = useContactForms();

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container bg-white">
        <StickyNavigation isScrolled={true} showSearchInNav={false} />
        <div className="container mx-auto page-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading property details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create a sample property for fallback
  const sampleProperty = {
    id: id || '1',
    title: "Modern 3-Bedroom Apartment in Victoria Island",
    description: "Stunning modern apartment with panoramic views of Lagos lagoon. Features high-end finishes, smart home technology, and access to premium amenities including gym, pool, and 24/7 security.",
    property_type: 'apartment',
    listing_type: 'sale' as const,
    status: 'for_sale' as const,
    price: 45000000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 150,
    address: "123 Luxury Lane, Victoria Island",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    amenities: ["Swimming Pool", "Gym", "24/7 Security", "Parking"],
    year_built: 2022,
    parking_spaces: 2,
    furnishing_status: "Furnished",
    views_count: 150,
    created_at: new Date().toISOString(),
    agent_id: null,
    real_estate_agents: null
  };
  
  // Use fetched property or fallback to sample
  const property = fetchedProperty || sampleProperty;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get primary image
  const primaryImage = property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg';
  const allImages = property.images || ['/placeholder.svg'];

  // Sample property data for features that aren't in the database yet
  const sampleFeatures = {
    interior: {
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      fullBaths: property.bathrooms || 0,
      halfBaths: 0,
      masterBedroomMainLevel: 1,
      mainLevelBedrooms: 1,
    },
    heating: ["Forced Air"],
    cooling: ["Central Air"],
    features: ["Modern Kitchen", "Spacious Living Area", "Built-in Wardrobes"],
    parking: {
      features: ["Attached", "Garage"],
      spaces: property.parking_spaces || 2,
    },
    lot: {
      size: property.area_sqm ? `${property.area_sqm} sqm` : "N/A",
    },
    construction: {
      type: ["Single Family"],
      style: ["Modern"],
      subtype: ["Single Family Residence"],
      materials: ["Brick", "Roof: Asphalt/Fiberglass"],
      condition: "Updated/Remodeled",
      yearBuilt: property.year_built || 2020,
    },
    utilities: {
      sewer: "Public Sewer",
      water: "Public",
    },
  };

  const specialFeatures = [
    "MODERN FINISHES",
    "OPEN FLOORPLAN", 
    "PREMIUM LOCATION",
    "SECURE PARKING",
    "24/7 SECURITY"
  ];

  const agent = property.real_estate_agents || {
    id: "no-agent",
    name: "Real Estate Hotspot",
    agency_name: "Real Estate Hotspot",
    phone: "+234 800 HOTSPOT",
    email: "info@realestatehotspot.com",
    profile_image_url: "/placeholder.svg",
    rating: 4.5
  };

  const propertyHistory = [
    {
      date: new Date(property.created_at).toLocaleDateString(),
      event: "Listed by " + (agent.agency_name || "Real Estate Hotspot"),
      price: formatPrice(property.price),
    },
  ];

  const marketStats = {
    medianSalePrice: "₦2,850,000",
    medianPricePerSqft: "₦18,500", 
    homesForSale: 156,
    homesSold: 89,
  };

  const nearbyAmenities = [
    { name: "Tafawa Balewa Square", distance: "0.5 miles", type: "Park" },
    { name: "National Theatre", distance: "0.8 miles", type: "Entertainment" },
    { name: "Lagos Island General Hospital", distance: "1.2 miles", type: "Healthcare" },
  ];

  // Event handlers
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        url: window.location.href,
      });
    }
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Properties', url: '/properties' },
    { name: property.title, url: `/properties/${id}` }
  ];

  return (
    <PropertySEO
      property={{
        id: id || '1',
        title: property.title || "Property Details",
        description: property.description || "View property details",
        price: Number(property.price) || 0,
        location: property.location || `${property.city}, ${property.state}`,
        type: property.property_type,
        bedrooms: Number(property.bedrooms) || 0,
        bathrooms: Number(property.bathrooms) || 0,
        area: Number(property.area_sqm) || 0,
        images: allImages,
        agent: {
          name: agent.name || "Agent",
          phone: agent.phone || '',
          email: agent.email || ''
        }
      }}
    >
      <BreadcrumbSEO breadcrumbs={breadcrumbs} />
      <div className="page-container bg-white">
        <StickyNavigation isScrolled={true} showSearchInNav={false} />

        {/* Header Actions */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link
                to="/properties"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to search
              </Link>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Heart
                    className={`h-4 w-4 mr-1 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
                  />
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2">
                {/* Image Gallery with Tabs */}
                <div className="mb-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="photos" className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Photos
                      </TabsTrigger>
                      <TabsTrigger
                        value="floorplan"
                        className="flex items-center"
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Floor Plan
                      </TabsTrigger>
                      <TabsTrigger value="3dhome" className="flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        3D Home
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="photos">
                      <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative">
                          <img
                            src={allImages[selectedImageIndex]}
                            alt="Property main view"
                            className="w-full h-96 object-cover rounded-lg"
                          />
                          <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                            {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                          </Badge>
                          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded">
                            {selectedImageIndex + 1} / {allImages.length}
                          </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="grid grid-cols-6 gap-2">
                          {allImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => handleImageSelect(index)}
                              className={`relative rounded-lg overflow-hidden ${
                                selectedImageIndex === index
                                  ? "ring-2 ring-blue-500"
                                  : ""
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Property view ${index + 1}`}
                                className="w-full h-16 object-cover"
                              />
                            </button>
                          ))}
                        </div>

                        <Button variant="outline" className="w-full">
                          <Camera className="h-4 w-4 mr-2" />
                          See all media →
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="floorplan">
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src="/placeholder.svg"
                            alt="Floor plan"
                            className="w-full h-96 object-contain bg-gray-50 rounded-lg"
                          />
                        </div>
                        <div className="text-center text-gray-600">
                          <p>Interactive floor plan coming soon</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="3dhome">
                      <div className="space-y-4">
                        <div className="relative bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                              3D Virtual Tour
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Experience this property in immersive 3D
                            </p>
                            <Button>
                              <Play className="h-4 w-4 mr-2" />
                              Start Virtual Tour
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Property Stats */}
                <div className="mb-6">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    Listed {new Date(property.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{property.views_count || 0} views</span>
                  </div>
                </div>

                {/* What's Special Section */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">What's special</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {specialFeatures.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-center py-2"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description || "Beautiful property with modern amenities and excellent location."}
                    </p>
                  </CardContent>
                </Card>

                {/* Facts & Features */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">
                      Facts & features
                    </h2>

                    {/* Interior */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        Interior
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">
                            Bedrooms & bathrooms
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>Bedrooms: {property.bedrooms || 'N/A'}</li>
                            <li>Bathrooms: {property.bathrooms || 'N/A'}</li>
                            <li>Area: {property.area_sqm ? `${property.area_sqm} sqm` : 'N/A'}</li>
                            <li>Year Built: {property.year_built || 'N/A'}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Features</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {sampleFeatures.features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Property */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Property
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Parking</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>Parking spaces: {property.parking_spaces || 'N/A'}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Location</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>Address: {property.address}</li>
                            <li>City: {property.city}</li>
                            <li>State: {property.state}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Agent & Contact */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-6">
                  {/* Price & Basic Info */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatPrice(property.price)}
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.bedrooms || 0} beds
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.bathrooms || 0} baths
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.area_sqm || 0} sqm
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {property.address}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{property.property_type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Built in {property.year_built || 'N/A'}</span>
                        </div>
                      </div>

                      <Button
                        variant="default"
                        className="w-full mb-3"
                        onClick={() => setShowViewingModal(true)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Request a tour
                      </Button>
                      <div className="text-center text-xs text-gray-500">
                        Ask a question or schedule a tour
                      </div>
                    </CardContent>
                  </Card>

                  {/* Listing Agent */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-gray-600 mb-3">Listed by</div>
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={agent?.profile_image_url || "/default-avatar.png"}
                          alt={agent?.name || "Agent"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-semibold hover:text-blue-700 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {agent?.name || "Agent"}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-600">
                            {agent.agency_name || "Real Estate Agent"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowContactModal(true)}
                        >
                          <span className="text-sm text-gray-500">Contact</span>
                          <span className="text-sm font-medium text-gray-900">
                            Contact {agent?.name?.split(" ")[0] || "Agent"}
                          </span>
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={`tel:${agent.phone || ''}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </a>
                        <a href={`mailto:${agent.email || ''}`} className="w-full">
                          <Button variant="outline" size="sm" className="w-full">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Home Value */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-sm text-gray-600 mb-2">Home value</div>
                      <div className="text-2xl font-bold mb-2">
                        {formatPrice(property.price)}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        Last updated: {new Date().toLocaleDateString()}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open('/mortgage', '_blank')}
                      >
                        Get pre-qualified
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          property={{
            id: id || '1',
            title: property.title,
            address: property.address,
            price: property.price,
            agent_id: agent.id,
            agent_name: agent?.name || "Agent",
            agent_phone: agent.phone || '',
            agent_email: agent.email || '',
          }}
        />

        {/* Contact Agent Modal */}
        <ContactFormModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          type="agent"
          recipientId={agent.id}
          recipientName={agent?.name || "Agent"}
          recipientRole="agent"
          propertyId={property.id.toString()}
          propertyTitle={`${property.bedrooms} bed ${property.bathrooms} bath ${property.property_type} - ${property.city}`}
          title="Contact Agent"
          description={`Send a message to ${agent?.name || "Agent"} about this property`}
          defaultSubject={`Inquiry about ${property.bedrooms} bed ${property.bathrooms} bath ${property.property_type} - ${formatPrice(property.price)}`}
          onSubmit={submitContactForm}
        />

        {/* Property Viewing Modal */}
        <ContactFormModal
          isOpen={showViewingModal}
          onClose={() => setShowViewingModal(false)}
          type="booking"
          recipientId={agent.id}
          recipientName={agent?.name || "Agent"}
          recipientRole="agent"
          propertyId={property.id.toString()}
          propertyTitle={`${property.bedrooms} bed ${property.bathrooms} bath ${property.property_type} - ${property.city}`}
          title="Schedule Property Viewing"
          description="Request an appointment to view this property"
          defaultSubject={`Viewing request for ${property.bedrooms} bed ${property.bathrooms} bath ${property.property_type}`}
          defaultMessage="I would like to schedule a viewing for this property. Please let me know your available times."
          onSubmit={submitContactForm}
        />
      </div>
    </PropertySEO>
  );
};

// Wrap with Error Boundary
const PropertyDetailWithErrorBoundary = () => (
  <PropertyDetailErrorBoundary>
    <PropertyDetail />
  </PropertyDetailErrorBoundary>
);

export default PropertyDetailWithErrorBoundary;