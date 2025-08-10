import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters";
import MapSearchIntegration from "@/components/MapSearchIntegration";
import StickyNavigation from "@/components/StickyNavigation";
import { MapPin, Search, Filter, Grid3X3, List, Eye, LayoutGrid, Map, Heart, Share2, Bed, Bath, Square } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard from "@/components/PropertyCard";
import SEO from "@/components/SEO";
import { pageConfigs } from "@/lib/seo";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [listingStatus, setListingStatus] = useState<string | undefined>(undefined); // 'for_sale' | 'for_rent'
  const [priceRange, setPriceRange] = useState("all");
  const [location, setLocation] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"map" | "grid" | "list">("map");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [showPropertyList, setShowPropertyList] = useState(true);
  const [searchParams] = useSearchParams();

  // Set sale/rent from query param and map to status; also keep legacy type filter for property type
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      const normalized = typeParam.toLowerCase();
      if (normalized === 'sale') setListingStatus('for_sale');
      else if (normalized === 'rent') setListingStatus('for_rent');
    } else {
      setListingStatus(undefined);
    }
  }, [searchParams]);

  const { properties, isLoading, error } = useProperties({
    search: searchTerm || undefined,
    property_type: propertyType === "all" ? undefined : (propertyType as any),
    min_price: priceRange === "all" ? undefined : undefined,
    city: location === "all" ? undefined : location,
    status: listingStatus as any,
  } as any);

  const handleSearch = () => {
    // The search will automatically trigger due to the useProperties hook watching the state
    console.log('Search triggered with:', { searchTerm, propertyType, priceRange, location });
  };

  // Transform properties data to include coordinates for map display
  const propertiesWithCoordinates = properties?.map((property, index) => ({
    ...property,
    coordinates: {
      // Use real coordinates if available, otherwise fallback to city-based coordinates
      lat: property.latitude || (
        property.city === 'Lagos' ? 6.5244 + (Math.random() - 0.5) * 0.1 :
        property.city === 'Abuja' ? 9.0579 + (Math.random() - 0.5) * 0.1 :
        property.city === 'Port Harcourt' ? 4.8156 + (Math.random() - 0.5) * 0.1 :
        property.city === 'Kano' ? 12.0022 + (Math.random() - 0.5) * 0.1 :
        6.5244 + (Math.random() - 0.5) * 0.1
      ),
      lng: property.longitude || (
        property.city === 'Lagos' ? 3.3792 + (Math.random() - 0.5) * 0.1 :
        property.city === 'Abuja' ? 7.4951 + (Math.random() - 0.5) * 0.1 :
        property.city === 'Port Harcourt' ? 7.0498 + (Math.random() - 0.5) * 0.1 :
        property.city === 'Kano' ? 8.5920 + (Math.random() - 0.5) * 0.1 :
        3.3792 + (Math.random() - 0.5) * 0.1
      ),
    }
  })) || [];

  const selectedPropertyData = selectedProperty 
    ? propertiesWithCoordinates.find(p => p.id === selectedProperty)
    : null;

  return (
    <SEO
      title={pageConfigs.properties.title}
      description={pageConfigs.properties.description}
      keywords={pageConfigs.properties.keywords}
      ogImage="/properties-hero.jpg"
    >
      <div className="h-screen flex flex-col bg-gray-50">
        <StickyNavigation isScrolled={true} showSearchInNav={false} />

        {/* Top Search Bar */}
        <div className="bg-white border-b shadow-sm z-40 flex-shrink-0">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search properties, locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5m">Under ₦5M</SelectItem>
                  <SelectItem value="5m-20m">₦5M - ₦20M</SelectItem>
                  <SelectItem value="20m-50m">₦20M - ₦50M</SelectItem>
                  <SelectItem value="above-50m">Above ₦50M</SelectItem>
                </SelectContent>
              </Select>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="border-0 rounded-l-lg rounded-r-none"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="border-0 rounded-none"
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

                {viewMode === "map" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPropertyList(!showPropertyList)}
                  >
                    {showPropertyList ? "Hide List" : "Show List"}
                  </Button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="font-medium">
                  {isLoading ? 'Loading...' : `${properties?.length || 0} properties found`}
                </span>
                {location !== "all" && (
                  <Badge variant="secondary">📍 {location}</Badge>
                )}
                {propertyType !== "all" && (
                  <Badge variant="secondary">🏠 {propertyType}</Badge>
                )}
                {priceRange !== "all" && (
                  <Badge variant="secondary">💰 {priceRange}</Badge>
                )}
              </div>
              
              {viewMode !== "map" && (
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="featured">Featured First</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="bg-white border-b shadow-sm z-30 flex-shrink-0">
            <AdvancedSearchFilters
              onFiltersChange={(filters) => {
                setAdvancedFilters(filters);
                console.log('Advanced filters applied:', filters);
              }}
              resultCount={properties?.length || 0}
              onSearch={() => {
                console.log('Advanced search triggered');
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 relative overflow-hidden">
          {viewMode === "map" ? (
            /* Zillow-style Map View */
            <div className="flex h-full">
               {/* Property List Sidebar (wider to allow 2-column grid) */}
               {showPropertyList && (
                 <div className="w-[32rem] bg-white border-r shadow-lg overflow-hidden flex flex-col">
                  <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-900">
                      {properties?.length || 0} Properties
                    </h2>
                  </div>
                  
                   <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="text-gray-600">Loading properties...</div>
                      </div>
                     ) : properties && properties.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                         {properties.map((property) => (
                           <div
                             key={property.id}
                             className={`cursor-pointer rounded-lg border transition-all hover:shadow-md ${
                               selectedProperty === property.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                             }`}
                             onClick={() => setSelectedProperty(property.id)}
                           >
                             <div className="p-4">
                               <div className="flex gap-3">
                                 <img
                                   src={property.images?.[0] || '/placeholder.svg'}
                                   alt={property.title}
                                   className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                                 />
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-start justify-between mb-2">
                                     <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                       {property.title}
                                     </h3>
                                     <div className="flex gap-1 ml-2">
                                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                         <Heart className="h-3 w-3" />
                                       </Button>
                                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                         <Share2 className="h-3 w-3" />
                                       </Button>
                                     </div>
                                   </div>
                                   <div className="text-lg font-bold text-blue-700 mb-2">
                                     ₦{property.price?.toLocaleString()}
                                   </div>
                                   <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                     {property.bedrooms && (
                                       <div className="flex items-center gap-1">
                                         <Bed className="h-3 w-3" />
                                         <span>{property.bedrooms}</span>
                                       </div>
                                     )}
                                     {property.bathrooms && (
                                       <div className="flex items-center gap-1">
                                         <Bath className="h-3 w-3" />
                                         <span>{property.bathrooms}</span>
                                       </div>
                                     )}
                                     {property.area_sqm && (
                                       <div className="flex items-center gap-1">
                                         <Square className="h-3 w-3" />
                                         <span>{property.area_sqm} sqm</span>
                                       </div>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-1 text-xs text-gray-600">
                                     <MapPin className="h-3 w-3" />
                                     <span className="truncate">{property.address}, {property.city}</span>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                    ) : (
                      <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                          <p className="text-gray-600">Try adjusting your search criteria.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Map Container */}
              <div className="flex-1 relative">
                <MapSearchIntegration
                  properties={propertiesWithCoordinates}
                  onPropertySelect={setSelectedProperty}
                  showSidebar={false}
                  height="100%"
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            /* Traditional Grid/List View */
            <div className="container mx-auto px-4 py-6 h-full overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-gray-600">Loading properties...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-red-600">Error loading properties. Please try again.</div>
                </div>
              ) : properties && properties.length > 0 ? (
                <>
                  <div className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
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
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse all properties.</p>
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
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SEO>
  );
};

export default Properties;
