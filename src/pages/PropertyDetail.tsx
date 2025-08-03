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

// Sample property data - in real app, this would come from API
const sampleProperty = {
  id: 1,
  price: "₦45,000,000",
  priceHistory: [
    { date: "2024-01-15", price: "₦43,000,000", event: "Listed" },
    { date: "2024-02-01", price: "₦45,000,000", event: "Price increase" },
  ],
  address: "123 Luxury Lane, Victoria Island, Lagos",
  city: "Lagos",
  state: "Lagos State",
  zipCode: "101241",
  bedrooms: 3,
  bathrooms: 2,
  area: 150,
  lotSize: 0.25,
  yearBuilt: 2022,
  propertyType: "Apartment",
  homeType: "Condo",
  listingType: "For Sale",
  daysOnZillow: 4,
  views: 3817,
  saves: 207,
  monthlyPayment: "₦237,000",
  images: [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ],
  description:
    "Stunning modern apartment with panoramic views of Lagos lagoon. Features high-end finishes, smart home technology, and access to premium amenities including gym, pool, and 24/7 security. Completely reimagined kitchen is a true chef's dream featuring premium Thor stainless steel appliances, dual islands, soft-close cabinetry, quartz countertops, pot filler, full wall ice... read more",
  features: {
    interior: {
      bedrooms: 3,
      bathrooms: 2,
      fullBaths: 2,
      halfBaths: 0,
      masterBedroomMainLevel: 1,
      mainLevelBedrooms: 1,
    },
    heating: ["Forced Air"],
    cooling: ["Central Air"],
    features: ["Basement, Full Finished", "Basement", "Fireplace"],
    parking: {
      features: ["Attached", "Garage"],
      spaces: 3,
    },
    lot: {
      size: "0.63 Acres",
    },
    construction: {
      type: ["Single Family"],
      style: ["Cape Cod"],
      subtype: ["Single Family Residence"],
      materials: ["Brick", "Roof: Asphalt/Fiberglass"],
      condition: "Updated/Remodeled",
      yearBuilt: 1999,
    },
    utilities: {
      sewer: "Public Sewer",
      water: "Public",
    },
  },
  specialFeatures: [
    "DUAL ISLANDS",
    "IMPECCABLE FINISHES",
    "OPEN FLOORPLAN",
    "COVERED PORCH",
    "LUXURY ENGINEERED HARDWOOD",
    "LARGE STAMPED PATIO",
    "GLAMOUR BATH",
  ],
  agent: {
    id: "1",
    name: "Wade Hurley",
    company: "Howard Hanna Real Estate Services",
    phone: "+234 801 234 5678",
    email: "wade.hurley@howardhanna.com",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    isListingAgent: true,
  },
  propertyHistory: [
    {
      date: "Jul 28, 2022",
      event: "Listed by Howard Hanna Real Estate Services",
      price: "₦45,000,000",
    },
  ],
  marketStats: {
    medianSalePrice: "₦2,850,000",
    medianPricePerSqft: "₦18,500",
    homesForSale: 156,
    homesSold: 89,
  },
  nearbyAmenities: [
    { name: "Tafawa Balewa Square", distance: "0.5 miles", type: "Park" },
    { name: "National Theatre", distance: "0.8 miles", type: "Entertainment" },
    {
      name: "Lagos Island General Hospital",
      distance: "1.2 miles",
      type: "Healthcare",
    },
  ],
  virtualTour: "https://example.com/virtual-tour",
  floorPlan: "/placeholder.svg",
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("photos");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const { submitContactForm } = useContactForms();

  useEffect(() => {
    // In real app, fetch property data by ID
    console.log("Fetching property with ID:", id);
  }, [id]);

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sampleProperty.address,
        url: window.location.href,
      });
    }
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Properties', url: '/properties' },
    { name: sampleProperty.address, url: `/properties/${id}` }
  ];

  return (
    <PropertySEO property={{
      id: id || '1',
      title: sampleProperty.address,
      description: sampleProperty.description,
      price: sampleProperty.price,
      location: sampleProperty.neighborhood,
      type: sampleProperty.type,
      bedrooms: sampleProperty.bedrooms,
      bathrooms: sampleProperty.bathrooms,
      area: sampleProperty.size,
      images: sampleProperty.images,
      agent: {
        name: sampleProperty.agent.name,
        phone: sampleProperty.agent.phone,
        email: sampleProperty.agent.email
      }
    }}>
      <BreadcrumbSEO breadcrumbs={breadcrumbs} />
      <div className="min-h-screen bg-white">
      <StickyNavigation isScrolled={true} showSearchInNav={false} />

      {/* Header Actions */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
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
                          src={sampleProperty.images[selectedImageIndex]}
                          alt="Property main view"
                          className="w-full h-96 object-cover rounded-lg"
                        />
                        <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                          {sampleProperty.listingType}
                        </Badge>
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded">
                          {selectedImageIndex + 1} /{" "}
                          {sampleProperty.images.length}
                        </div>
                      </div>

                      {/* Thumbnail Gallery */}
                      <div className="grid grid-cols-6 gap-2">
                        {sampleProperty.images.map((image, index) => (
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
                          src={sampleProperty.floorPlan}
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
                  {sampleProperty.daysOnZillow} days on Real Estate Hotspot
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{sampleProperty.views.toLocaleString()} views</span>
                  <span>{sampleProperty.saves} saves</span>
                </div>
              </div>

              {/* What's Special Section */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">What's special</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {sampleProperty.specialFeatures.map((feature, index) => (
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
                    {sampleProperty.description}
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
                          <li>
                            Bedrooms:{" "}
                            {sampleProperty.features.interior.bedrooms}
                          </li>
                          <li>
                            Bathrooms:{" "}
                            {sampleProperty.features.interior.bathrooms}
                          </li>
                          <li>
                            Full bathrooms:{" "}
                            {sampleProperty.features.interior.fullBaths}
                          </li>
                          <li>
                            Half bathrooms:{" "}
                            {sampleProperty.features.interior.halfBaths}
                          </li>
                          <li>
                            Main level bedrooms:{" "}
                            {sampleProperty.features.interior.mainLevelBedrooms}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Heating</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {sampleProperty.features.heating.map(
                            (item, index) => (
                              <li key={index}>{item}</li>
                            ),
                          )}
                        </ul>
                        <h4 className="font-medium mb-2 mt-4">Cooling</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {sampleProperty.features.cooling.map(
                            (item, index) => (
                              <li key={index}>{item}</li>
                            ),
                          )}
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
                          <li>
                            Parking features:{" "}
                            {sampleProperty.features.parking.features.join(
                              ", ",
                            )}
                          </li>
                          <li>
                            Attached garage spaces:{" "}
                            {sampleProperty.features.parking.spaces}
                          </li>
                        </ul>
                        <h4 className="font-medium mb-2 mt-4">Features</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {sampleProperty.features.features.map(
                            (feature, index) => (
                              <li key={index}>{feature}</li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Lot</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>Size: {sampleProperty.features.lot.size}</li>
                        </ul>
                        <h4 className="font-medium mb-2 mt-4">Construction</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>
                            Type & style:{" "}
                            {sampleProperty.features.construction.type.join(
                              ", ",
                            )}
                          </li>
                          <li>
                            Home type:{" "}
                            {sampleProperty.features.construction.style.join(
                              ", ",
                            )}
                          </li>
                          <li>
                            Property subtype:{" "}
                            {sampleProperty.features.construction.subtype.join(
                              ", ",
                            )}
                          </li>
                          <li>
                            Materials:{" "}
                            {sampleProperty.features.construction.materials.join(
                              ", ",
                            )}
                          </li>
                          <li>
                            Condition:{" "}
                            {sampleProperty.features.construction.condition}
                          </li>
                          <li>
                            Year built:{" "}
                            {sampleProperty.features.construction.yearBuilt}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Utilities */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Utilities & green energy
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Sewer: {sampleProperty.features.utilities.sewer}</li>
                      <li>Water: {sampleProperty.features.utilities.water}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Travel Times */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Navigation className="h-4 w-4 mr-2" />
                    Travel times
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Add a destination</span>
                      <Button variant="ghost" size="sm">
                        +
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      See commute times to work, school, and other important
                      locations
                    </p>
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
                      {sampleProperty.price}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Est. payment: {sampleProperty.monthlyPayment}/mo
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {sampleProperty.bedrooms} beds
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {sampleProperty.bathrooms} baths
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {sampleProperty.area} sqft
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {sampleProperty.address}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Single family residence</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Built in {sampleProperty.yearBuilt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{sampleProperty.features.lot.size}</span>
                      </div>
                    </div>

                    <Button
                      variant="blue"
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
                    <div className="text-sm text-gray-600 mb-3">Listing by</div>
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={sampleProperty.agent.image}
                        alt={sampleProperty.agent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/agents/${sampleProperty.agent.id}`}
                          className="font-semibold hover:text-blue-700 transition-colors"
                        >
                          {sampleProperty.agent.name}
                        </Link>
                        <div className="text-sm text-gray-600">
                          {sampleProperty.agent.company}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowContactModal(true)}
                      >
                        Contact {sampleProperty.agent.name.split(" ")[0]}
                      </Button>
                      <Link
                        to={`/agents/${sampleProperty.agent.id}`}
                        className="block"
                      >
                        <Button variant="outline" className="w-full">
                          View Agent Profile
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Home Value */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-600 mb-2">Home value</div>
                    <div className="text-2xl font-bold mb-2">
                      {sampleProperty.price}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Last updated: Nov 2024
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
          title: sampleProperty.title,
          address: sampleProperty.location,
          price: parseFloat(sampleProperty.price.replace(/[₦,]/g, '')),
          agent_id: '1',
          agent_name: sampleProperty.agent.name,
          agent_phone: sampleProperty.agent.phone,
          agent_email: sampleProperty.agent.email,
        }}
      />

      {/* Contact Agent Modal */}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        type="agent"
        recipientId={sampleProperty.agent.id}
        recipientName={sampleProperty.agent.name}
        recipientRole={sampleProperty.agent.role}
        propertyId={sampleProperty.id.toString()}
        propertyTitle={`${sampleProperty.bedrooms} bed ${sampleProperty.bathrooms} bath ${sampleProperty.propertyType} - ${sampleProperty.city}`}
        title="Contact Agent"
        description={`Send a message to ${sampleProperty.agent.name} about this property`}
        defaultSubject={`Inquiry about ${sampleProperty.bedrooms} bed ${sampleProperty.bathrooms} bath ${sampleProperty.propertyType} - ${sampleProperty.price}`}
        onSubmit={submitContactForm}
      />

      {/* Property Viewing Modal */}
      <ContactFormModal
        isOpen={showViewingModal}
        onClose={() => setShowViewingModal(false)}
        type="booking"
        recipientId={sampleProperty.agent.id}
        recipientName={sampleProperty.agent.name}
        recipientRole={sampleProperty.agent.role}
        propertyId={sampleProperty.id.toString()}
        propertyTitle={`${sampleProperty.bedrooms} bed ${sampleProperty.bathrooms} bath ${sampleProperty.propertyType} - ${sampleProperty.city}`}
        title="Schedule Property Viewing"
        description="Request an appointment to view this property"
        defaultSubject={`Viewing request for ${sampleProperty.bedrooms} bed ${sampleProperty.bathrooms} bath ${sampleProperty.propertyType}`}
        defaultMessage="I would like to schedule a viewing for this property. Please let me know your available times."
        onSubmit={submitContactForm}
      />
    </div>
    </PropertySEO>
  );
};

export default PropertyDetail;
