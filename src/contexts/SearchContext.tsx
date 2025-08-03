import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
  filters: any;
  setFilters: (filters: any) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const useSearchContext = useSearch;

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState({});

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      isSearchFocused,
      setIsSearchFocused,
      suggestions,
      setSuggestions,
      filters,
      setFilters
    }}>
      {children}
    </SearchContext.Provider>
  );
};
