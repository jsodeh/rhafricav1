import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { SaveSearchModal } from "@/components/SaveSearchModal";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Calendar,
  Car,
  Zap,
  BookmarkPlus,
} from "lucide-react";

interface SearchFilters {
  location: string;
  saleType: string;
  priceMin: number;
  priceMax: number;
  bedrooms: string;
  bathrooms: string;
  homeType: string[];
  sqftMin: number;
  sqftMax: number;
  yearBuiltMin: number;
  yearBuiltMax: number;
  lotSizeMin: number;
  lotSizeMax: number;
  parking: string;
  amenities: string[];
  keywords: string;
  locationRadius: number; // in kilometers
  listingDate: string; // last 24h, week, month, etc.
  priceReduced: boolean;
  openHouse: boolean;
  virtualTour: boolean;
  newConstruction: boolean;
  foreclosure: boolean;
  furnished: boolean;
}

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
  resultCount?: number;
  onSearch?: () => void;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  onFiltersChange,
  className = "",
  resultCount = 0,
  onSearch,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    location: "",
    saleType: "for-sale",
    priceMin: 0,
    priceMax: 1000000000,
    bedrooms: "",
    bathrooms: "",
    homeType: [],
    sqftMin: 0,
    sqftMax: 10000,
    yearBuiltMin: 1900,
    yearBuiltMax: 2024,
    lotSizeMin: 0,
    lotSizeMax: 10,
    parking: "",
    amenities: [],
    keywords: "",
    locationRadius: 25, // 25km default radius
    listingDate: "any",
    priceReduced: false,
    openHouse: false,
    virtualTour: false,
    newConstruction: false,
    foreclosure: false,
    furnished: false,
  });

  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`;
    } else {
      return `₦${price.toLocaleString()}`;
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterChange = (
    key: keyof SearchFilters,
    value: string,
    checked: boolean,
  ) => {
    const currentArray = activeFilters[key] as string[];
    let newArray;

    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter((item) => item !== value);
    }

    handleFilterChange(key, newArray);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    if (Array.isArray(activeFilters[key])) {
      handleFilterChange(key, []);
    } else {
      handleFilterChange(key, "");
    }
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      location: "",
      saleType: "for-sale",
      priceMin: 0,
      priceMax: 1000000000,
      bedrooms: "",
      bathrooms: "",
      homeType: [],
      sqftMin: 0,
      sqftMax: 10000,
      yearBuiltMin: 1900,
      yearBuiltMax: 2024,
      lotSizeMin: 0,
      lotSizeMax: 10,
      parking: "",
      amenities: [],
      keywords: "",
      locationRadius: 25,
      listingDate: "any",
      priceReduced: false,
      openHouse: false,
      virtualTour: false,
      newConstruction: false,
      foreclosure: false,
      furnished: false,
    };
    setActiveFilters(clearedFilters);
    setPriceRange([0, 100000000]);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.location) count++;
    if (activeFilters.bedrooms) count++;
    if (activeFilters.bathrooms) count++;
    if (activeFilters.homeType.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 100000000) count++;
    if (activeFilters.amenities.length > 0) count++;
    if (activeFilters.locationRadius !== 25) count++; // default is 25km
    if (activeFilters.listingDate !== "any") count++;
    if (activeFilters.priceReduced) count++;
    if (activeFilters.openHouse) count++;
    if (activeFilters.virtualTour) count++;
    if (activeFilters.newConstruction) count++;
    if (activeFilters.foreclosure) count++;
    if (activeFilters.furnished) count++;
    if (activeFilters.parking) count++;
    if (activeFilters.keywords) count++;
    if (activeFilters.sqftMin > 0 || activeFilters.sqftMax < 10000) count++;
    if (activeFilters.yearBuiltMin > 1900 || activeFilters.yearBuiltMax < 2024) count++;
    return count;
  };

  return (
    <div className={`bg-white border-b shadow-sm ${className}`}>
      <div className="container mx-auto px-4 py-4">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          {/* Location Search */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Enter an address, neighborhood, city, or ZIP code"
              value={activeFilters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* For Sale/Rent Toggle */}
          <Select
            value={activeFilters.saleType}
            onValueChange={(value) => handleFilterChange("saleType", value)}
          >
            <SelectTrigger className="w-full lg:w-32 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="for-sale">For Sale</SelectItem>
              <SelectItem value="for-rent">For Rent</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select>
            <SelectTrigger className="w-full lg:w-32 h-12">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-4 w-80">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="mt-4 mb-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100000000}
                    min={0}
                    step={1000000}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <Label className="text-xs">Min Price</Label>
                    <Input
                      placeholder="No min"
                      value={
                        priceRange[0] > 0 ? priceRange[0].toLocaleString() : ""
                      }
                      onChange={(e) => {
                        const value =
                          parseInt(e.target.value.replace(/,/g, "")) || 0;
                        setPriceRange([value, priceRange[1]]);
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Price</Label>
                    <Input
                      placeholder="No max"
                      value={
                        priceRange[1] < 100000000
                          ? priceRange[1].toLocaleString()
                          : ""
                      }
                      onChange={(e) => {
                        const value =
                          parseInt(e.target.value.replace(/,/g, "")) ||
                          100000000;
                        setPriceRange([priceRange[0], value]);
                      }}
                    />
                  </div>
                </div>
              </div>
            </SelectContent>
          </Select>

          {/* Beds & Baths */}
          <Select
            value={activeFilters.bedrooms}
            onValueChange={(value) => handleFilterChange("bedrooms", value)}
          >
            <SelectTrigger className="w-full lg:w-40 h-12">
              <SelectValue placeholder="Beds & Baths" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-4 w-64">
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Bedrooms
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {["Any", "1+", "2+", "3+", "4+", "5+"].map((bed) => (
                      <Button
                        key={bed}
                        variant={
                          activeFilters.bedrooms === bed ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleFilterChange("bedrooms", bed)}
                        className="h-8"
                      >
                        {bed}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Bathrooms
                  </Label>
                  <div className="grid grid-cols-6 gap-2">
                    {["Any", "1+", "2+", "3+", "4+", "5+"].map((bath) => (
                      <Button
                        key={bath}
                        variant={
                          activeFilters.bathrooms === bath
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleFilterChange("bathrooms", bath)}
                        className="h-8"
                      >
                        {bath}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SelectContent>
          </Select>

          {/* Home Type */}
          <Select>
            <SelectTrigger className="w-full lg:w-32 h-12">
              <SelectValue placeholder="Home Type" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-4 w-64">
                <Label className="text-sm font-medium mb-3 block">
                  Property Type
                </Label>
                <div className="space-y-2">
                  {[
                    "House",
                    "Townhouse",
                    "Apartment",
                    "Condo",
                    "Land",
                    "Multi-family",
                    "Mobile",
                    "Co-op",
                    "Other",
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={activeFilters.homeType.includes(type)}
                        onCheckedChange={(checked) =>
                          handleArrayFilterChange(
                            "homeType",
                            type,
                            checked as boolean,
                          )
                        }
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </SelectContent>
          </Select>

          {/* More Filters */}
          <Button
            variant="outline"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="w-full lg:w-auto h-12 px-4"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            More
            {getActiveFilterCount() > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          {/* Save Search Button */}
          <Button
            variant="outline"
            onClick={() => setShowSaveModal(true)}
            className="w-full lg:w-auto h-12 px-4"
          >
            <BookmarkPlus className="h-4 w-4 mr-2" />
            Save
          </Button>

          {/* Search Button */}
          <Button
            variant="blue"
            className="w-full lg:w-auto h-12 px-8"
            onClick={() => {
              if (onSearch) {
                onSearch();
              }
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Active Filter Tags */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.location && (
              <Badge variant="secondary" className="gap-1">
                {activeFilters.location}
                <button onClick={() => clearFilter("location")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {activeFilters.bedrooms && (
              <Badge variant="secondary" className="gap-1">
                {activeFilters.bedrooms} bed
                <button onClick={() => clearFilter("bedrooms")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {activeFilters.bathrooms && (
              <Badge variant="secondary" className="gap-1">
                {activeFilters.bathrooms} bath
                <button onClick={() => clearFilter("bathrooms")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {activeFilters.homeType.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {type}
                <button
                  onClick={() =>
                    handleArrayFilterChange("homeType", type, false)
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 100000000) && (
              <Badge variant="secondary" className="gap-1">
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                <button onClick={() => setPriceRange([0, 100000000])}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 text-xs text-blue-600"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Extended Filters Panel */}
        {showMoreFilters && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Square Footage */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Square Footage
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min sqft"
                      value={
                        activeFilters.sqftMin > 0 ? activeFilters.sqftMin : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "sqftMin",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <Input
                      placeholder="Max sqft"
                      value={
                        activeFilters.sqftMax < 10000
                          ? activeFilters.sqftMax
                          : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "sqftMax",
                          parseInt(e.target.value) || 10000,
                        )
                      }
                    />
                  </div>
                </div>

                {/* Year Built */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Year Built
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min year"
                      value={
                        activeFilters.yearBuiltMin > 1900
                          ? activeFilters.yearBuiltMin
                          : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "yearBuiltMin",
                          parseInt(e.target.value) || 1900,
                        )
                      }
                    />
                    <Input
                      placeholder="Max year"
                      value={
                        activeFilters.yearBuiltMax < 2024
                          ? activeFilters.yearBuiltMax
                          : ""
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          "yearBuiltMax",
                          parseInt(e.target.value) || 2024,
                        )
                      }
                    />
                  </div>
                </div>

                {/* Parking */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Parking
                  </Label>
                  <Select
                    value={activeFilters.parking}
                    onValueChange={(value) =>
                      handleFilterChange("parking", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1+">1+ spaces</SelectItem>
                      <SelectItem value="2+">2+ spaces</SelectItem>
                      <SelectItem value="3+">3+ spaces</SelectItem>
                      <SelectItem value="garage">Garage</SelectItem>
                      <SelectItem value="carport">Carport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities */}
                <div className="md:col-span-2 lg:col-span-3">
                  <Label className="text-sm font-medium mb-3 block">
                    Amenities
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      "Swimming Pool",
                      "Gym/Fitness",
                      "Air Conditioning",
                      "Fireplace",
                      "Balcony/Patio",
                      "Garden",
                      "Security System",
                      "Generator",
                      "Elevator",
                      "Furnished",
                      "Pet Friendly",
                      "Wheelchair Accessible",
                    ].map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity}
                          checked={activeFilters.amenities.includes(amenity)}
                          onCheckedChange={(checked) =>
                            handleArrayFilterChange(
                              "amenities",
                              amenity,
                              checked as boolean,
                            )
                          }
                        />
                        <Label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Radius */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Search Radius
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={[activeFilters.locationRadius]}
                      onValueChange={([value]) => handleFilterChange("locationRadius", value)}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>1 km</span>
                      <span className="font-medium">{activeFilters.locationRadius} km</span>
                      <span>100 km</span>
                    </div>
                  </div>
                </div>

                {/* Listing Date */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Listed Within
                  </Label>
                  <Select
                    value={activeFilters.listingDate}
                    onValueChange={(value) => handleFilterChange("listingDate", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="week">Last week</SelectItem>
                      <SelectItem value="month">Last month</SelectItem>
                      <SelectItem value="3months">Last 3 months</SelectItem>
                      <SelectItem value="6months">Last 6 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Features */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Special Features
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="priceReduced"
                        checked={activeFilters.priceReduced}
                        onCheckedChange={(checked) =>
                          handleFilterChange("priceReduced", checked as boolean)
                        }
                      />
                      <Label htmlFor="priceReduced" className="text-sm">
                        Price reduced
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="openHouse"
                        checked={activeFilters.openHouse}
                        onCheckedChange={(checked) =>
                          handleFilterChange("openHouse", checked as boolean)
                        }
                      />
                      <Label htmlFor="openHouse" className="text-sm">
                        Open house
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="virtualTour"
                        checked={activeFilters.virtualTour}
                        onCheckedChange={(checked) =>
                          handleFilterChange("virtualTour", checked as boolean)
                        }
                      />
                      <Label htmlFor="virtualTour" className="text-sm">
                        Virtual tour
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newConstruction"
                        checked={activeFilters.newConstruction}
                        onCheckedChange={(checked) =>
                          handleFilterChange("newConstruction", checked as boolean)
                        }
                      />
                      <Label htmlFor="newConstruction" className="text-sm">
                        New construction
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="md:col-span-2 lg:col-span-3">
                  <Label className="text-sm font-medium mb-3 block">
                    Keywords
                  </Label>
                  <Input
                    placeholder="e.g. granite countertops, hardwood floors, new construction"
                    value={activeFilters.keywords}
                    onChange={(e) =>
                      handleFilterChange("keywords", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Search Modal */}
        <SaveSearchModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          searchFilters={activeFilters}
          resultCount={resultCount}
        />
      </div>
    </div>
  );
};

export default AdvancedSearchFilters;
