import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import StickyNavigation from "@/components/StickyNavigation";
import PropertyCard from "@/components/PropertyCard";
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
  Grid3X3,
  List,
  MapPin,
  Filter,
  SlidersHorizontal,
  Search,
  Home,
  ArrowUpDown,
} from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import LoadingState from "@/components/LoadingState";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { properties, isLoading, error, refetch } = useProperties();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredProperties, setFilteredProperties] = useState(properties);

  // Get search parameters
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const propertyType = searchParams.get("type") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const bedrooms = searchParams.get("bedrooms") || "";

  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

  // Filter properties based on search parameters
  useEffect(() => {
    let filtered = [...properties];

    // Filter by search query
    if (query) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.description?.toLowerCase().includes(query.toLowerCase()) ||
        property.city.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter(property =>
        property.city.toLowerCase().includes(location.toLowerCase()) ||
        property.state.toLowerCase().includes(location.toLowerCase()) ||
        property.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by property type
    if (propertyType && propertyType !== "all") {
      filtered = filtered.filter(property =>
        property.property_type.toLowerCase() === propertyType.toLowerCase()
      );
    }

    // Filter by price range
    if (minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(maxPrice));
    }

    // Filter by bedrooms
    if (bedrooms && bedrooms !== "any") {
      const bedroomCount = parseInt(bedrooms);
      filtered = filtered.filter(property => property.bedrooms === bedroomCount);
    }

    // Sort properties
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, query, location, propertyType, minPrice, maxPrice, bedrooms, sortBy]);

  const buildSearchSummary = () => {
    const parts = [];
    if (query) parts.push(`"${query}"`);
    if (location) parts.push(`in ${location}`);
    if (propertyType && propertyType !== "all") parts.push(`${propertyType}s`);
    if (bedrooms && bedrooms !== "any") parts.push(`${bedrooms} bedrooms`);
    if (minPrice || maxPrice) {
      if (minPrice && maxPrice) {
        parts.push(`₦${parseInt(minPrice).toLocaleString()} - ₦${parseInt(maxPrice).toLocaleString()}`);
      } else if (minPrice) {
        parts.push(`from ₦${parseInt(minPrice).toLocaleString()}`);
      } else if (maxPrice) {
        parts.push(`up to ₦${parseInt(maxPrice).toLocaleString()}`);
      }
    }
    return parts.length > 0 ? parts.join(" ") : "All properties";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              <p className="text-gray-600">
                {filteredProperties.length} properties found for: {buildSearchSummary()}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="rounded-l-none"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filters Summary */}
        {(query || location || propertyType || minPrice || maxPrice || bedrooms) && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {query && (
                  <Badge variant="secondary">
                    Search: "{query}"
                  </Badge>
                )}
                {location && (
                  <Badge variant="secondary">
                    Location: {location}
                  </Badge>
                )}
                {propertyType && propertyType !== "all" && (
                  <Badge variant="secondary">
                    Type: {propertyType}
                  </Badge>
                )}
                {bedrooms && bedrooms !== "any" && (
                  <Badge variant="secondary">
                    Bedrooms: {bedrooms}
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary">
                    Price: {minPrice && `₦${parseInt(minPrice).toLocaleString()}`}
                    {minPrice && maxPrice && " - "}
                    {maxPrice && `₦${parseInt(maxPrice).toLocaleString()}`}
                  </Badge>
                )}
                <Link to="/search" className="ml-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Modify Search
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Content */}
        <LoadingState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          loadingText="Searching properties..."
        >
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find any properties matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <div className="space-x-4">
                <Link to="/search">
                  <Button>
                    <Filter className="h-4 w-4 mr-2" />
                    Modify Search
                  </Button>
                </Link>
                <Link to="/properties">
                  <Button variant="outline">
                    <Home className="h-4 w-4 mr-2" />
                    Browse All Properties
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </LoadingState>
      </div>
    </div>
  );
};

export default SearchResults;