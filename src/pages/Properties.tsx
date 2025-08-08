import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import { MapPin, Search, Filter, Grid3X3, List, Eye, LayoutGrid } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard from "@/components/PropertyCard";
import SEO from "@/components/SEO";
import { pageConfigs } from "@/lib/seo";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [location, setLocation] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [searchParams] = useSearchParams();

  // Set propertyType from query param on mount and when query changes
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && typeParam !== propertyType) {
      setPropertyType(typeParam);
    }
  }, [searchParams]);

  const { data: properties, isLoading, error } = useProperties({
    searchTerm,
    propertyType: propertyType === "all" ? undefined : propertyType,
    priceRange: priceRange === "all" ? undefined : priceRange,
    city: location === "all" ? undefined : location,
  });

  const handleSearch = () => {
    // The search will automatically trigger due to the useProperties hook watching the state
    console.log('Search triggered with:', { searchTerm, propertyType, priceRange, location });
  };

  return (
    <SEO
      title={pageConfigs.properties.title}
      description={pageConfigs.properties.description}
      keywords={pageConfigs.properties.keywords}
      ogImage="/properties-hero.jpg"
    >
      <div className="page-container bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RH</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Real Estate Hotspot</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/properties" className="text-blue-700 font-medium">Browse Properties</Link>
            <Link to="/agents" className="text-gray-600 hover:text-blue-700 transition-colors">Find Agents</Link>
            <Link to="/services" className="text-gray-600 hover:text-blue-700 transition-colors">Services</Link>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" className="border-blue-700 text-blue-700 hover:bg-blue-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto page-content">
        {/* Search and Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search properties, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Abuja">Abuja</SelectItem>
                  <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  <SelectItem value="Kano">Kano</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5m">Under ₦5M</SelectItem>
                  <SelectItem value="5m-20m">₦5M - ₦20M</SelectItem>
                  <SelectItem value="20m-50m">₦20M - ₦50M</SelectItem>
                  <SelectItem value="above-50m">Above ₦50M</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Properties {propertyType !== "all" ? `(${propertyType})` : ""} for Sale
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span>
                {isLoading ? 'Loading...' : `${properties?.length || 0} properties found`}
              </span>
              {properties && properties.length > itemsPerPage && (
                <span>
                  • Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, properties.length)} of {properties.length}
                </span>
              )}
              {location !== "all" && (
                <Badge variant="secondary">📍 {location}</Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary">💰 {priceRange}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              More Filters
              {advancedFilters && (
                <Badge className="ml-2 bg-blue-600 text-white">Active</Badge>
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="border-0 rounded-l-lg rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="border-0 rounded-r-lg rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="most-viewed">Most Viewed</SelectItem>
                <SelectItem value="recently-updated">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Search Filters */}
        {showAdvancedFilters && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <AdvancedSearchFilters
                onFiltersChange={(filters) => {
                  setAdvancedFilters(filters);
                  console.log('Advanced filters applied:', filters);
                }}
                resultCount={properties?.length || 0}
                onSearch={() => {
                  console.log('Advanced search triggered');
                  setCurrentPage(1); // Reset to first page on new search
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading properties...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-red-600">Error loading properties. Please try again.</div>
          </div>
        )}

        {/* Property Grid/List */}
        {properties && properties.length > 0 && (
          <>
            <div className={
              viewMode === "grid"
                ? "property-grid"
                : "space-y-spacing-4"
            }>
              {properties
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((property) => (
                  <div key={property.id} className={viewMode === "list" ? "w-full" : ""}>
                    <PropertyCard 
                      property={property} 
                      variant={property.featured ? 'featured' : 'standard'}
                      aspectRatio="16:9"
                    />
                  </div>
                ))}
            </div>

            {/* Pagination */}
            {properties.length > itemsPerPage && (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from(
                    { length: Math.ceil(properties.length / itemsPerPage) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev =>
                    Math.min(prev + 1, Math.ceil(properties.length / itemsPerPage))
                  )}
                  disabled={currentPage === Math.ceil(properties.length / itemsPerPage)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {properties && properties.length === 0 && !isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse all properties.</p>
              {showAdvancedFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAdvancedFilters(false);
                    setAdvancedFilters(null);
                    setSearchTerm("");
                    setPropertyType("all");
                    setPriceRange("all");
                    setLocation("all");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </SEO>
  );
};

export default Properties;
