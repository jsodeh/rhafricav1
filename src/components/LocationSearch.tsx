import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, X, Mic, Clock, TrendingUp, Star } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Type declaration for Speech Recognition API
declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

interface LocationSearchProps {
  placeholder?: string;
  className?: string;
  onLocationSelect?: (location: string) => void;
  inputClassName?: string;
  preventAutoSuggestions?: boolean;
}

// Sample Nigerian cities and areas for autocomplete
const nigerianLocations = [
  "Lagos, Nigeria",
  "Victoria Island, Lagos",
  "Ikoyi, Lagos",
  "Lekki, Lagos",
  "Lekki Phase 1, Lagos",
  "Lekki Phase 2, Lagos",
  "Banana Island, Lagos",
  "Surulere, Lagos",
  "Ikeja, Lagos",
  "Yaba, Lagos",
  "Ajah, Lagos",
  "Sangotedo, Lagos",
  "Chevron, Lekki",
  "Abuja, Nigeria",
  "Garki, Abuja",
  "Maitama, Abuja",
  "Wuse, Abuja",
  "Wuse 2, Abuja",
  "Asokoro, Abuja",
  "Gwarinpa, Abuja",
  "Port Harcourt, Rivers",
  "Kano, Nigeria",
  "Ibadan, Oyo",
  "Benin City, Edo",
  "Enugu, Nigeria",
  "Calabar, Cross River",
  "Jos, Plateau",
  "Kaduna, Nigeria",
];

// Popular search locations (most searched)
const popularSearches = [
  { location: "Lekki, Lagos", count: 2341, badge: "Most Popular" },
  { location: "Victoria Island, Lagos", count: 1876, badge: "Trending" },
  { location: "Ikoyi, Lagos", count: 1654, badge: "Hot" },
  { location: "Abuja, Nigeria", count: 1432, badge: "Popular" },
  { location: "Banana Island, Lagos", count: 987, badge: "Luxury" },
  { location: "Maitama, Abuja", count: 765, badge: "Premium" },
];

// Property type suggestions for specific locations
const locationSuggestions = {
  "Lekki": ["3 bedroom apartments in Lekki", "4 bedroom duplexes in Lekki", "Land for sale in Lekki"],
  "Victoria Island": ["Luxury apartments in VI", "Penthouse in Victoria Island", "Commercial property in VI"],
  "Ikoyi": ["5 bedroom houses in Ikoyi", "Waterfront properties in Ikoyi", "Luxury apartments in Ikoyi"],
  "Abuja": ["Houses in Abuja", "Apartments in Abuja FCT", "Land in Abuja"],
};

const LocationSearch = ({
  placeholder = "Enter an address, neighborhood, city, or ZIP code",
  className = "",
  onLocationSelect,
  inputClassName = "",
  preventAutoSuggestions = false,
}: LocationSearchProps) => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    suggestions,
    setSuggestions,
  } = useSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load recent searches on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(saved.slice(0, 5)); // Show last 5 searches
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = nigerianLocations.filter((location) =>
        location.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
      setShowCurrentLocation(true);
      setShowSmartSuggestions(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowCurrentLocation(false);
      setShowSmartSuggestions(false);
    }
  }, [searchQuery, setSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
        setShowCurrentLocation(false);
        setShowSmartSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchFocused]);

  const handleInputFocus = () => {
    setIsSearchFocused(true);
    // Only show suggestions if auto-suggestions are not prevented
    if (!preventAutoSuggestions) {
      // Only show suggestions if user has typed something OR explicitly clicked
      if (searchQuery.length > 0) {
        setShowSuggestions(true);
        setShowCurrentLocation(true);
        setShowSmartSuggestions(false);
      } else if (hasUserInteracted) {
        setShowCurrentLocation(true);
        setShowSmartSuggestions(true);
      }
    }
    // If preventAutoSuggestions is true or conditions not met, suggestions remain hidden
  };

  const handleInputClick = () => {
    setHasUserInteracted(true);
    setIsSearchFocused(true);
    // Always show suggestions on explicit click, regardless of preventAutoSuggestions
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
      setShowCurrentLocation(true);
      setShowSmartSuggestions(false);
    } else {
      setShowCurrentLocation(true);
      setShowSmartSuggestions(true);
    }
  };

  const saveToRecentSearches = (location: string) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const filtered = recent.filter((item: string) => item !== location);
    const updated = [location, ...filtered].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated.slice(0, 5));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    setShowCurrentLocation(false);
    setShowSmartSuggestions(false);
    saveToRecentSearches(suggestion);
    onLocationSelect?.(suggestion);

    // Navigate to map view
    navigate(`/map?location=${encodeURIComponent(suggestion)}`);
  };

  const startVoiceSearch = () => {
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      alert('Voice search is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);

      // Auto-search if transcript matches a location
      const matchedLocation = nigerianLocations.find(loc =>
        loc.toLowerCase().includes(transcript.toLowerCase())
      );
      if (matchedLocation) {
        setTimeout(() => handleSuggestionClick(matchedLocation), 500);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Voice search failed. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleCurrentLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location accessed:", position.coords);
          setSearchQuery("Current Location");
          setShowSuggestions(false);
          setIsSearchFocused(false);
          setShowCurrentLocation(false);
          onLocationSelect?.("Current Location");

          // Navigate to map view with current location
          navigate(`/map?location=${encodeURIComponent("Current Location")}&lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
        },
        (error) => {
          console.error("Location access denied:", error);
          // Still navigate to map even if location access fails
          navigate(`/map?location=${encodeURIComponent("Current Location")}`);
        },
      );
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setShowCurrentLocation(false);
    setShowSmartSuggestions(false);
    setHasUserInteracted(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowSuggestions(false);
      setIsSearchFocused(false);
      setShowCurrentLocation(false);
      onLocationSelect?.(searchQuery);
      navigate(`/map?location=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onClick={handleInputClick}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={`w-full pl-12 pr-20 border-2 border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm ${inputClassName}`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 z-10">
            {/* Voice Search Button */}
            <button
              onClick={startVoiceSearch}
              disabled={isListening}
              className={`p-1 rounded-full transition-colors ${isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'hover:bg-gray-100 text-gray-400'
                }`}
              title="Voice search"
            >
              <Mic className="h-4 w-4" />
            </button>
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full"
                title="Clear search"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {(showSuggestions || showCurrentLocation || showSmartSuggestions) && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
          <div className="py-2">
            {/* Current Location Option */}
            {showCurrentLocation && (
              <button
                onClick={handleCurrentLocationClick}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors border-b border-gray-100"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Current Location
                  </div>
                  <div className="text-sm text-gray-500">
                    Use my current location
                  </div>
                </div>
              </button>
            )}

            {/* Voice Search Status */}
            {isListening && (
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Mic className="h-4 w-4 text-red-600 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-medium text-red-600">Listening...</div>
                    <div className="text-sm text-red-500">Speak your location</div>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Suggestions (when no search query) */}
            {showSmartSuggestions && !searchQuery && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                      </div>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                      >
                        <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900">{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Searches */}
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Popular Searches</span>
                    </div>
                  </div>
                  {popularSearches.slice(0, 4).map((item, index) => (
                    <button
                      key={`popular-${index}`}
                      onClick={() => handleSuggestionClick(item.location)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-gray-900">{item.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                        <span className="text-xs text-gray-500">{item.count}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Smart Property Suggestions */}
                {searchQuery.length === 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Quick Searches</span>
                      </div>
                    </div>
                    {[
                      "3 bedroom apartments in Lagos",
                      "Houses for sale in Abuja",
                      "Luxury properties in Lekki",
                      "Land for sale in Nigeria"
                    ].map((quickSearch, index) => (
                      <button
                        key={`quick-${index}`}
                        onClick={() => handleSuggestionClick(quickSearch)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                      >
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-900">{quickSearch}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Location Suggestions (when searching) */}
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900">
                  {searchQuery && suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                    <>
                      {suggestion.substring(0, suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()))}
                      <span className="font-semibold bg-yellow-200">
                        {suggestion.substring(
                          suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()),
                          suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length
                        )}
                      </span>
                      {suggestion.substring(suggestion.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                    </>
                  ) : (
                    suggestion
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
