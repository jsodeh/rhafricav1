import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Home, 
  Bed, 
  Bath, 
  Filter,
  X,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useKeyboardNavigation,
  useFocusManagement,
  useScreenReader,
  useARIA,
  KEYBOARD_CODES,
  ARIA_ROLES,
  ARIA_PROPS
} from '@/lib/accessibility';

interface SearchFilters {
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  keywords: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property' | 'agent';
  metadata?: Record<string, any>;
}

interface AccessibleSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onClear?: () => void;
  initialFilters?: Partial<SearchFilters>;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
  showAdvancedFilters?: boolean;
}

export const AccessibleSearchForm: React.FC<AccessibleSearchFormProps> = ({
  onSearch,
  onClear,
  initialFilters = {},
  suggestions = [],
  isLoading = false,
  className,
  compact = false,
  showAdvancedFilters = false
}) => {
  const { announce } = useScreenReader();
  const { setFocus } = useFocusManagement();
  const { ariaAttributes, updateAria } = useARIA();

  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    keywords: '',
    ...initialFilters
  });

  const [showFilters, setShowFilters] = useState(showAdvancedFilters);
  const [activeSuggestions, setActiveSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSearched, setHasSearched] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for suggestions
  const { handleKeyDown: handleSuggestionsKeyDown } = useKeyboardNavigation(
    () => {
      // Enter - select current suggestion
      if (selectedSuggestion >= 0 && activeSuggestions[selectedSuggestion]) {
        selectSuggestion(activeSuggestions[selectedSuggestion]);
      } else {
        // Submit search if no suggestion selected
        handleSearch();
      }
    },
    undefined,
    () => {
      // Escape - close suggestions
      setActiveSuggestions([]);
      setSelectedSuggestion(-1);
    },
    (direction) => {
      // Arrow navigation for suggestions
      if (activeSuggestions.length === 0) return;

      if (direction === 'down') {
        const newIndex = selectedSuggestion < activeSuggestions.length - 1 
          ? selectedSuggestion + 1 
          : -1;
        setSelectedSuggestion(newIndex);
        
        if (newIndex >= 0) {
          announce(`Selected suggestion: ${activeSuggestions[newIndex].text}`, 'polite');
        }
      } else if (direction === 'up') {
        const newIndex = selectedSuggestion > -1 
          ? selectedSuggestion - 1 
          : activeSuggestions.length - 1;
        setSelectedSuggestion(newIndex);
        
        if (newIndex >= 0) {
          announce(`Selected suggestion: ${activeSuggestions[newIndex].text}`, 'polite');
        }
      }
    }
  );

  // Update filters
  const updateFilter = useCallback((field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Handle location input for suggestions
    if (field === 'location' && value.length > 2) {
      const filteredSuggestions = suggestions.filter(s => 
        s.text.toLowerCase().includes(value.toLowerCase())
      );
      setActiveSuggestions(filteredSuggestions.slice(0, 5));
      setSelectedSuggestion(-1);
      
      if (filteredSuggestions.length > 0) {
        updateAria({
          'aria-expanded': 'true',
          'aria-activedescendant': '',
        });
      }
    } else if (field === 'location' && value.length <= 2) {
      setActiveSuggestions([]);
      setSelectedSuggestion(-1);
      updateAria({ 'aria-expanded': 'false' });
    }
  }, [errors, suggestions, updateAria]);

  // Select suggestion
  const selectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    updateFilter('location', suggestion.text);
    setActiveSuggestions([]);
    setSelectedSuggestion(-1);
    updateAria({ 'aria-expanded': 'false' });
    announce(`Selected: ${suggestion.text}`, 'polite');
  }, [updateFilter, updateAria, announce]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // At least one search criteria required
    const hasSearchCriteria = filters.location || filters.keywords || 
                             filters.propertyType || filters.minPrice || 
                             filters.maxPrice || filters.bedrooms || filters.bathrooms;

    if (!hasSearchCriteria) {
      newErrors.general = 'Please enter at least one search criteria';
    }

    // Price validation
    if (filters.minPrice && filters.maxPrice) {
      const min = parseFloat(filters.minPrice);
      const max = parseFloat(filters.maxPrice);
      
      if (min >= max) {
        newErrors.price = 'Minimum price must be less than maximum price';
      }
    }

    // Number validation
    if (filters.bedrooms && (isNaN(Number(filters.bedrooms)) || Number(filters.bedrooms) < 0)) {
      newErrors.bedrooms = 'Please enter a valid number of bedrooms';
    }

    if (filters.bathrooms && (isNaN(Number(filters.bathrooms)) || Number(filters.bathrooms) < 0)) {
      newErrors.bathrooms = 'Please enter a valid number of bathrooms';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      announce(`Form validation failed: ${newErrors[firstErrorField]}`, 'assertive');
      
      // Focus first error field
      const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement instanceof HTMLElement) {
        setFocus(errorElement);
      }
    }

    return Object.keys(newErrors).length === 0;
  }, [filters, announce, setFocus]);

  // Handle search submission
  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setHasSearched(true);
    onSearch(filters);
    
    const searchTerms = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
      
    announce(`Search initiated with filters: ${searchTerms}`, 'polite');
  }, [filters, validateForm, onSearch, announce]);

  // Handle clear filters
  const handleClear = useCallback(() => {
    const clearedFilters: SearchFilters = {
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      keywords: ''
    };
    
    setFilters(clearedFilters);
    setErrors({});
    setHasSearched(false);
    setActiveSuggestions([]);
    setSelectedSuggestion(-1);
    
    onClear?.();
    announce('Search filters cleared', 'polite');
    
    // Focus first input
    if (locationInputRef.current) {
      setFocus(locationInputRef.current);
    }
  }, [onClear, announce, setFocus]);

  // Toggle advanced filters
  const toggleFilters = useCallback(() => {
    const newState = !showFilters;
    setShowFilters(newState);
    announce(
      newState ? 'Advanced filters expanded' : 'Advanced filters collapsed',
      'polite'
    );
  }, [showFilters, announce]);

  // Property type options
  const propertyTypes = [
    { value: '', label: 'Any Property Type' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
  ];

  // Room number options
  const roomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5+', label: '5+' },
  ];

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value).length;

  if (compact) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <form 
            ref={formRef}
            onSubmit={handleSearch}
            role="search"
            aria-label="Property search form"
            className="flex gap-2"
          >
            <div className="flex-1 relative">
              <Label htmlFor="compact-search" className="sr-only">
                Search properties by location or keywords
              </Label>
              <Input
                id="compact-search"
                ref={locationInputRef}
                type="text"
                value={filters.location || filters.keywords}
                onChange={(e) => updateFilter('location', e.target.value)}
                onKeyDown={handleSuggestionsKeyDown}
                placeholder="Search by location or keywords..."
                className="pl-10"
                aria-describedby={activeSuggestions.length > 0 ? 'search-suggestions' : undefined}
                aria-expanded={activeSuggestions.length > 0}
                aria-haspopup="listbox"
                role="combobox"
                autoComplete="off"
                {...ariaAttributes}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              
              {/* Suggestions dropdown */}
              {activeSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  id="search-suggestions"
                  role="listbox"
                  aria-label="Search suggestions"
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto"
                >
                  {activeSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      role="option"
                      aria-selected={index === selectedSuggestion}
                      className={cn(
                        'px-3 py-2 cursor-pointer text-sm',
                        index === selectedSuggestion 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'hover:bg-gray-100'
                      )}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" aria-hidden="true" />
                        {suggestion.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              aria-label="Search properties"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <form 
          ref={formRef}
          onSubmit={handleSearch}
          role="search"
          aria-label="Advanced property search form"
          className="space-y-4"
        >
          {/* General error message */}
          {errors.general && (
            <div 
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">{errors.general}</span>
            </div>
          )}

          {/* Main search fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Location */}
            <div className="relative">
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  ref={locationInputRef}
                  type="text"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  onKeyDown={handleSuggestionsKeyDown}
                  placeholder="City, neighborhood, or ZIP code"
                  className="pl-10"
                  aria-describedby={activeSuggestions.length > 0 ? 'location-suggestions' : 'location-help'}
                  aria-expanded={activeSuggestions.length > 0}
                  aria-haspopup="listbox"
                  role="combobox"
                  autoComplete="off"
                  {...ariaAttributes}
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <div id="location-help" className="sr-only">
                Type to search for locations. Use arrow keys to navigate suggestions.
              </div>
              
              {/* Location suggestions */}
              {activeSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  id="location-suggestions"
                  role="listbox"
                  aria-label="Location suggestions"
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto"
                >
                  {activeSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      role="option"
                      aria-selected={index === selectedSuggestion}
                      className={cn(
                        'px-3 py-2 cursor-pointer text-sm',
                        index === selectedSuggestion 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'hover:bg-gray-100'
                      )}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" aria-hidden="true" />
                        {suggestion.text}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Type */}
            <div>
              <Label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </Label>
              <Select 
                value={filters.propertyType} 
                onValueChange={(value) => updateFilter('propertyType', value)}
              >
                <SelectTrigger id="property-type" aria-describedby="property-type-help">
                  <Home className="h-4 w-4 text-gray-400 mr-2" aria-hidden="true" />
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div id="property-type-help" className="sr-only">
                Select the type of property you are looking for
              </div>
            </div>

            {/* Keywords */}
            <div>
              <Label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </Label>
              <Input
                id="keywords"
                type="text"
                value={filters.keywords}
                onChange={(e) => updateFilter('keywords', e.target.value)}
                placeholder="Pool, garage, modern..."
                aria-describedby="keywords-help"
              />
              <div id="keywords-help" className="sr-only">
                Enter keywords to search for specific property features
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            type="button"
            variant="outline"
            onClick={toggleFilters}
            className="flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform',
                showFilters && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </Button>

          {/* Advanced Filters */}
          {showFilters && (
            <div
              ref={filtersRef}
              id="advanced-filters"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"
            >
              {/* Price Range */}
              <div className="md:col-span-2">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="min-price" className="sr-only">Minimum price</Label>
                    <div className="relative">
                      <Input
                        id="min-price"
                        type="text"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        placeholder="Min price"
                        className="pl-8"
                        aria-describedby="min-price-help"
                      />
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <div id="min-price-help" className="sr-only">Enter minimum price</div>
                  </div>
                  <div>
                    <Label htmlFor="max-price" className="sr-only">Maximum price</Label>
                    <div className="relative">
                      <Input
                        id="max-price"
                        type="text"
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        placeholder="Max price"
                        className="pl-8"
                        aria-describedby="max-price-help"
                      />
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <div id="max-price-help" className="sr-only">Enter maximum price</div>
                  </div>
                </div>
                {errors.price && (
                  <div role="alert" className="text-sm text-red-600 mt-1">
                    {errors.price}
                  </div>
                )}
              </div>

              {/* Bedrooms */}
              <div>
                <Label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </Label>
                <Select 
                  value={filters.bedrooms} 
                  onValueChange={(value) => updateFilter('bedrooms', value)}
                >
                  <SelectTrigger id="bedrooms">
                    <Bed className="h-4 w-4 text-gray-400 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bedrooms && (
                  <div role="alert" className="text-sm text-red-600 mt-1">
                    {errors.bedrooms}
                  </div>
                )}
              </div>

              {/* Bathrooms */}
              <div>
                <Label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </Label>
                <Select 
                  value={filters.bathrooms} 
                  onValueChange={(value) => updateFilter('bathrooms', value)}
                >
                  <SelectTrigger id="bathrooms">
                    <Bath className="h-4 w-4 text-gray-400 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bathrooms && (
                  <div role="alert" className="text-sm text-red-600 mt-1">
                    {errors.bathrooms}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 sm:flex-none"
              disabled={isLoading}
              aria-describedby="search-help"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                  Search Properties
                </>
              )}
            </Button>
            
            {(hasSearched || activeFiltersCount > 0) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                aria-label="Clear all search filters"
              >
                <X className="h-4 w-4 mr-2" aria-hidden="true" />
                Clear Filters
              </Button>
            )}
          </div>
          
          <div id="search-help" className="sr-only">
            Click search to find properties matching your criteria
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccessibleSearchForm;
