import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Map,
  List,
  Heart,
  Share2,
  MoreHorizontal,
  Bed,
  Bath,
  Square,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import StickyNavigation from "@/components/StickyNavigation";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import PropertyMapboxAdvanced from "@/components/PropertyMapboxAdvanced";

// Extended sample properties for search results
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

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredProperties, setFilteredProperties] =
    useState(searchProperties);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileList, setShowMobileList] = useState(false);
  const propertiesPerPage = 12;

  const location = searchParams.get("location") || "";
  const totalResults = filteredProperties.length;
  const totalPages = Math.ceil(totalResults / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    startIndex,
    startIndex + propertiesPerPage,
  );

  useEffect(() => {
    // Filter properties based on search parameters
    let filtered = searchProperties;

    if (location) {
      filtered = filtered.filter((property) =>
        property.location.toLowerCase().includes(location.toLowerCase()),
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) =>
            parseInt(a.price.replace(/[₦,]/g, "")) -
            parseInt(b.price.replace(/[₦,]/g, "")),
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            parseInt(b.price.replace(/[₦,]/g, "")) -
            parseInt(a.price.replace(/[₦,]/g, "")),
        );
        break;
      case "newest":
        filtered.sort((a, b) => a.daysOnMarket - b.daysOnMarket);
        break;
      case "size":
        filtered.sort((a, b) => parseInt(b.area) - parseInt(a.area));
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  }, [location, sortBy]);

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
    setCurrentPage(1);
  };

  return (
    <div className="page-container bg-gray-50">
      <StickyNavigation isScrolled={true} showSearchInNav={false} />

      {/* Search Filters */}
      <AdvancedSearchFilters onFiltersChange={handleFiltersChange} />

      <div className="container mx-auto page-content">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Real Estate & Homes For Sale
            </h1>
            <p className="text-gray-600 mt-1">
              {totalResults.toLocaleString()} results{" "}
              {location && `in ${location}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort: Homes for You" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="size">Largest</SelectItem>
                <SelectItem value="beds">Most Bedrooms</SelectItem>
                <SelectItem value="baths">Most Bathrooms</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex bg-white border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="rounded-none"
              >
                <Map className="h-4 w-4 mr-1" />
                Map
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <>
            {/* Property Grid */}
            <div className="property-grid mb-8">
              {currentProperties.map((property) => (
                <Link to={`/properties/${property.id}`} key={property.id}>
                  <Card className="hover:shadow-lg transition-all duration-200 group overflow-hidden">
                    <div className="relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-red-600 text-white border-0">
                        {property.type}
                      </Badge>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      {property.daysOnMarket <= 7 && (
                        <Badge className="absolute bottom-3 left-3 bg-green-600 text-white border-0">
                          New
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <span className="text-xl font-bold text-gray-900">
                          {property.price}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-600 mb-2 text-sm">
                        <div className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          <span>{property.bedrooms} bed</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-3 w-3 mr-1" />
                          <span>{property.bathrooms} bath</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-3 w-3 mr-1" />
                          <span>{property.area}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="text-sm">{property.location}</span>
                      </div>

                      <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {property.title}
                      </h3>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                        <span>{property.daysOnMarket} days on market</span>
                        <span>{property.pricePerSqft}/sqft</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Map View */
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:h-[600px]">
            {/* Mobile: Full-width map with overlay toggle */}
            <div className="lg:hidden">
              <div className="relative h-[50vh] mb-4">
                <PropertyMapboxAdvanced
                  properties={currentProperties}
                  selectedProperty={selectedProperty}
                  onPropertySelect={setSelectedProperty}
                  height="100%"
                  showControls={true}
                  enableClustering={true}
                  showHeatmap={false}
                />
                {/* Mobile properties overlay toggle */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Button
                    className="w-full bg-white/95 text-gray-900 hover:bg-white border shadow-lg"
                    onClick={() => setShowMobileList(!showMobileList)}
                  >
                    {showMobileList ? "Hide" : "Show"} Properties (
                    {filteredProperties.length})
                  </Button>
                </div>
              </div>

              {/* Mobile Properties List - Collapsible */}
              {showMobileList && (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto bg-white rounded-lg border p-4">
                  {currentProperties.map((property) => (
                    <Link to={`/properties/${property.id}`} key={property.id}>
                      <Card className="hover:shadow-md transition-shadow">
                        <div className="flex gap-3 p-3">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-20 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base text-gray-900 mb-1">
                              {property.price}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                              <span>{property.bedrooms} bed</span>
                              <span>•</span>
                              <span>{property.bathrooms} bath</span>
                              <span>•</span>
                              <span>{property.area}</span>
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {property.location}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: Side-by-side layout */}
            <div className="hidden lg:block space-y-4 overflow-y-auto">
              {currentProperties.map((property) => (
                <Link to={`/properties/${property.id}`} key={property.id}>
                  <Card className="hover:shadow-lg transition-shadow group">
                    <div className="flex">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-32 h-24 object-cover rounded-l-lg"
                      />
                      <CardContent className="p-3 flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-lg">
                            {property.price}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <span>{property.bedrooms} bed</span>
                          <span>•</span>
                          <span>{property.bathrooms} bath</span>
                          <span>•</span>
                          <span>{property.area}</span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-1">
                          {property.location}
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Desktop: Interactive Map */}
            <div className="hidden lg:block">
              <PropertyMapboxAdvanced
                properties={currentProperties}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                height="600px"
                showControls={true}
                enableClustering={true}
                showHeatmap={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
