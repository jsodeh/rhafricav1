import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  List,
  Settings,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  MapPin,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StickyNavigation from "@/components/StickyNavigation";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import MapSearchIntegration from "@/components/MapSearchIntegration";

// Same property data as SearchResults
const searchProperties = [
  {
    id: 1,
    title: "Modern 3-Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: "₦45,000,000",
    bedrooms: 3,
    bathrooms: 2,
    area: "150 sqm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    type: "For Sale",
    description: "Stunning modern apartment with panoramic views",
    coordinates: { lat: 6.4281, lng: 3.4219 },
    agent: {
      name: "Sarah Johnson",
      phone: "+234 801 234 5678",
      email: "sarah.johnson@realestate.com",
      image: "/placeholder.svg",
    },
    daysOnMarket: 4,
    pricePerSqft: "₦300,000",
  },
  {
    id: 2,
    title: "Luxury 4-Bedroom Duplex",
    location: "Lekki Phase 1, Lagos",
    price: "₦75,000,000",
    bedrooms: 4,
    bathrooms: 3,
    area: "250 sqm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    type: "For Sale",
    description: "Beautifully designed duplex in a serene estate",
    coordinates: { lat: 6.4698, lng: 3.5852 },
    agent: {
      name: "Michael Adebayo",
      phone: "+234 802 345 6789",
      email: "michael.adebayo@realestate.com",
      image: "/placeholder.svg",
    },
    daysOnMarket: 12,
    pricePerSqft: "₦300,000",
  },
  {
    id: 3,
    title: "Executive 2-Bedroom Flat",
    location: "Ikeja GRA, Lagos",
    price: "₦25,000,000",
    bedrooms: 2,
    bathrooms: 2,
    area: "120 sqm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    type: "For Sale",
    description: "Well-maintained apartment in premier location",
    coordinates: { lat: 6.5875, lng: 3.3619 },
    agent: {
      name: "Fatima Hassan",
      phone: "+234 803 456 7890",
      email: "fatima.hassan@realestate.com",
      image: "/placeholder.svg",
    },
    daysOnMarket: 8,
    pricePerSqft: "₦208,333",
  },
  {
    id: 4,
    title: "Ultra-Luxury 5-Bedroom Mansion",
    location: "Banana Island, Lagos",
    price: "₦250,000,000",
    bedrooms: 5,
    bathrooms: 4,
    area: "400 sqm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    type: "For Sale",
    description: "Ultra-luxury mansion with private beach access",
    coordinates: { lat: 6.4281, lng: 3.4319 },
    agent: {
      name: "David Okonkwo",
      phone: "+234 804 567 8901",
      email: "david.okonkwo@realestate.com",
      image: "/placeholder.svg",
    },
    daysOnMarket: 21,
    pricePerSqft: "₦625,000",
  },
  {
    id: 5,
    title: "Contemporary 3-Bedroom Penthouse",
    location: "Ikoyi, Lagos",
    price: "₦85,000,000",
    bedrooms: 3,
    bathrooms: 3,
    area: "200 sqm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    type: "For Sale",
    description: "Exclusive penthouse with 360-degree views",
    coordinates: { lat: 6.4541, lng: 3.4316 },
    agent: {
      name: "Grace Okechukwu",
      phone: "+234 805 678 9012",
      email: "grace.okechukwu@realestate.com",
      image: "/placeholder.svg",
    },
    daysOnMarket: 6,
    pricePerSqft: "₦425,000",
  },
  {
    id: 6,
    title: "Elegant 4-Bedroom Terrace",
    location: "Abuja, FCT",
    price: "₦55,000,000",
    bedrooms: 4,
    bathrooms: 3,
    area: "180 sqm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    type: "For Sale",
    description: "Modern terrace house in upscale neighborhood",
    coordinates: { lat: 9.0579, lng: 7.4951 },
    agent: {
      name: "Aisha Bello",
      phone: "+234 806 789 0123",
      email: "aisha.bello@realestate.com",
      image: "/placeholder.svg",
    },
    daysOnMarket: 15,
    pricePerSqft: "₦305,556",
  },
];

const MapSearch = () => {
  const [searchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [filteredProperties, setFilteredProperties] =
    useState(searchProperties);

  const location = searchParams.get("location") || "";
  const totalResults = filteredProperties.length;

  useEffect(() => {
    // Filter properties based on search parameters
    let filtered = searchProperties;

    if (location) {
      filtered = filtered.filter((property) =>
        property.location.toLowerCase().includes(location.toLowerCase()),
      );
    }

    setFilteredProperties(filtered);
  }, [location]);

  const handleFiltersChange = (filters: any) => {
    // Apply filters to properties
    let filtered = searchProperties;

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter((property) =>
        property.location
          .toLowerCase()
          .includes(filters.location.toLowerCase()),
      );
    }

    // Apply bedroom filter
    if (filters.bedrooms && filters.bedrooms !== "Any") {
      const bedroomCount = parseInt(filters.bedrooms.replace("+", ""));
      filtered = filtered.filter(
        (property) => property.bedrooms >= bedroomCount,
      );
    }

    // Apply bathroom filter
    if (filters.bathrooms && filters.bathrooms !== "Any") {
      const bathroomCount = parseInt(filters.bathrooms.replace("+", ""));
      filtered = filtered.filter(
        (property) => property.bathrooms >= bathroomCount,
      );
    }

    setFilteredProperties(filtered);
  };

  const selectedPropertyData = selectedProperty
    ? filteredProperties.find((p) => p.id === selectedProperty)
    : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <StickyNavigation isScrolled={true} showSearchInNav={false} />

      {/* Top Controls Bar */}
      <div className="bg-white border-b shadow-sm z-40 flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">
                Map View • {totalResults} properties{" "}
                {location && `in ${location}`}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPropertyList(!showPropertyList)}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>

              <Link to="/search">
                <Button variant="outline" size="sm">
                  Grid View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm z-30 flex-shrink-0">
          <AdvancedSearchFilters onFiltersChange={handleFiltersChange} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Enhanced Map Search Integration */}
        <MapSearchIntegration
          properties={filteredProperties}
          onPropertySelect={setSelectedProperty}
          showSidebar={showPropertyList}
          height="100%"
          className="w-full h-full"
        />


      </div>
    </div>
  );
};

export default MapSearch;
