import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { propertyCache, agentCache, searchCache } from './cache';

// Default query options optimized for performance
const defaultOptions: DefaultOptions = {
  queries: {
    // Stale time - how long data is considered fresh
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Cache time - how long data stays in cache when unused
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 404s
      if (error?.status === 404) return false;
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch settings
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    
    // Network mode
    networkMode: 'online',
    
    // Error handling
    throwOnError: false,
    
    // Suspense support
    suspense: false,
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Network mode for mutations
    networkMode: 'online',
    
    // Error handling for mutations
    throwOnError: false,
  },
};

// Create optimized query client
export const createOptimizedQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions,
    logger: {
      log: (message) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[QueryClient]', message);
        }
      },
      warn: (message) => {
        console.warn('[QueryClient]', message);
      },
      error: (message) => {
        console.error('[QueryClient]', message);
      },
    },
  });
};

// Query key factories for consistent caching
export const queryKeys = {
  // Properties
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.properties.lists(), filters] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
    featured: () => [...queryKeys.properties.all, 'featured'] as const,
    nearby: (lat: number, lng: number, radius?: number) => 
      [...queryKeys.properties.all, 'nearby', { lat, lng, radius }] as const,
    search: (query: string, filters?: Record<string, any>) => 
      [...queryKeys.properties.all, 'search', query, filters] as const,
  },

  // Agents
  agents: {
    all: ['agents'] as const,
    lists: () => [...queryKeys.agents.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.agents.lists(), filters] as const,
    details: () => [...queryKeys.agents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.agents.details(), id] as const,
    properties: (id: string) => [...queryKeys.agents.detail(id), 'properties'] as const,
    reviews: (id: string) => [...queryKeys.agents.detail(id), 'reviews'] as const,
  },

  // Searches
  searches: {
    all: ['searches'] as const,
    saved: () => [...queryKeys.searches.all, 'saved'] as const,
    alerts: () => [...queryKeys.searches.all, 'alerts'] as const,
    history: () => [...queryKeys.searches.all, 'history'] as const,
  },

  // User data
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    bookmarks: () => [...queryKeys.user.all, 'bookmarks'] as const,
    messages: () => [...queryKeys.user.all, 'messages'] as const,
    notifications: () => [...queryKeys.user.all, 'notifications'] as const,
  },

  // Location data
  locations: {
    all: ['locations'] as const,
    states: () => [...queryKeys.locations.all, 'states'] as const,
    cities: (state?: string) => [...queryKeys.locations.all, 'cities', state] as const,
    areas: (city?: string) => [...queryKeys.locations.all, 'areas', city] as const,
    neighborhoods: (area?: string) => [...queryKeys.locations.all, 'neighborhoods', area] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    property: (id: string) => [...queryKeys.analytics.all, 'property', id] as const,
    agent: (id: string) => [...queryKeys.analytics.all, 'agent', id] as const,
    search: (query: string) => [...queryKeys.analytics.all, 'search', query] as const,
  },

  // Configuration
  config: {
    all: ['config'] as const,
    features: () => [...queryKeys.config.all, 'features'] as const,
    settings: () => [...queryKeys.config.all, 'settings'] as const,
  },
} as const;

// Custom hooks for optimized data fetching
export const useOptimizedQuery = <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
    cache?: 'memory' | 'localStorage' | 'sessionStorage';
  }
) => {
  const { cache = 'memory', ...queryOptions } = options || {};
  
  // Create cache key
  const cacheKey = JSON.stringify(queryKey);
  
  // Try to get from local cache first
  let cachedData: T | null = null;
  if (cache === 'localStorage') {
    cachedData = propertyCache.get(cacheKey);
  } else if (cache === 'sessionStorage') {
    cachedData = searchCache.get(cacheKey);
  }

  return {
    data: cachedData,
    isLoading: cachedData === null,
    error: null,
    // ... other query result properties
  };
};

// Prefetching utilities
export const prefetchQueries = {
  // Prefetch featured properties for homepage
  async featuredProperties(queryClient: QueryClient) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.properties.featured(),
      queryFn: async () => {
        // Fetch featured properties
        return [];
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },

  // Prefetch popular agents
  async popularAgents(queryClient: QueryClient) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.agents.list({ featured: true }),
      queryFn: async () => {
        // Fetch popular agents
        return [];
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  },

  // Prefetch location data
  async locationData(queryClient: QueryClient) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.locations.states(),
      queryFn: async () => {
        // Fetch states/locations
        return [];
      },
      staleTime: 60 * 60 * 1000, // 1 hour (locations don't change often)
    });
  },

  // Prefetch property details when hovering over property card
  async propertyDetails(queryClient: QueryClient, propertyId: string) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.properties.detail(propertyId),
      queryFn: async () => {
        // Fetch property details
        return null;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};

// Query invalidation utilities
export const invalidateQueries = {
  // Invalidate all property queries
  async properties(queryClient: QueryClient) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.properties.all,
    });
  },

  // Invalidate specific property
  async property(queryClient: QueryClient, propertyId: string) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.properties.detail(propertyId),
    });
  },

  // Invalidate agent data
  async agent(queryClient: QueryClient, agentId: string) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.agents.detail(agentId),
    });
  },

  // Invalidate search results
  async searches(queryClient: QueryClient) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.searches.all,
    });
  },

  // Invalidate user data
  async userData(queryClient: QueryClient) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.user.all,
    });
  },
};

// Background refetching for critical data
export const backgroundRefetch = {
  async startBackgroundSync(queryClient: QueryClient) {
    // Refetch featured properties every 10 minutes
    setInterval(() => {
      queryClient.refetchQueries({
        queryKey: queryKeys.properties.featured(),
        type: 'active',
      });
    }, 10 * 60 * 1000);

    // Refetch user notifications every 2 minutes
    setInterval(() => {
      queryClient.refetchQueries({
        queryKey: queryKeys.user.notifications(),
        type: 'active',
      });
    }, 2 * 60 * 1000);
  },
};

// Performance monitoring
export const queryPerformance = {
  logSlowQueries: true,
  slowQueryThreshold: 2000, // 2 seconds

  onQueryStart: (queryKey: readonly unknown[]) => {
    if (queryPerformance.logSlowQueries) {
      console.time(`Query: ${JSON.stringify(queryKey)}`);
    }
  },

  onQueryEnd: (queryKey: readonly unknown[], duration: number) => {
    if (queryPerformance.logSlowQueries) {
      console.timeEnd(`Query: ${JSON.stringify(queryKey)}`);
      
      if (duration > queryPerformance.slowQueryThreshold) {
        console.warn(`Slow query detected: ${JSON.stringify(queryKey)} took ${duration}ms`);
      }
    }
  },
};

export default createOptimizedQueryClient;
