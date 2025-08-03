// Caching utilities for Real Estate Hotspot

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  serialize?: boolean; // Whether to serialize complex objects
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

/**
 * Generic cache implementation with multiple storage options
 */
export class Cache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      storage: 'memory',
      serialize: true,
      ...options
    };

    // Load from persistent storage
    if (this.options.storage !== 'memory') {
      this.loadFromStorage();
    }
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.options.ttl,
      hits: 0
    };

    // Ensure cache size limit
    if (this.cache.size >= this.options.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, item);
    this.saveToStorage();
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    // Update hit count for LRU eviction
    item.hits++;
    return item.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.saveToStorage();
    return result;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    items: Array<{ key: string; age: number; hits: number }>;
  } {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      age: Date.now() - item.timestamp,
      hits: item.hits
    }));

    const totalHits = items.reduce((sum, item) => sum + item.hits, 0);
    const totalRequests = items.length;

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      items
    };
  }

  /**
   * Evict least recently used item
   */
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;

    let leastUsedKey = '';
    let leastHits = Infinity;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.hits < leastHits || (item.hits === leastHits && item.timestamp < oldestTimestamp)) {
        leastUsedKey = key;
        leastHits = item.hits;
        oldestTimestamp = item.timestamp;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Load cache from persistent storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storage = this.getStorage();
      const data = storage?.getItem(`cache_${this.constructor.name}`);
      
      if (data) {
        const parsed = JSON.parse(data);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  /**
   * Save cache to persistent storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined' || this.options.storage === 'memory') return;

    try {
      const storage = this.getStorage();
      const data = JSON.stringify(Array.from(this.cache.entries()));
      storage?.setItem(`cache_${this.constructor.name}`, data);
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  /**
   * Get storage interface
   */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    switch (this.options.storage) {
      case 'localStorage':
        return window.localStorage;
      case 'sessionStorage':
        return window.sessionStorage;
      default:
        return null;
    }
  }
}

/**
 * Specialized caches for different data types
 */
export const propertyCache = new Cache({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50,
  storage: 'localStorage'
});

export const agentCache = new Cache({
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 30,
  storage: 'localStorage'
});

export const searchCache = new Cache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 20,
  storage: 'sessionStorage'
});

export const imageCache = new Cache({
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100,
  storage: 'localStorage'
});

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: any[]) => any>(
  cache: Cache,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: Parameters<T>) {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyKey}_${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method and cache result
      const result = originalMethod.apply(this, args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.then((data) => {
          cache.set(key, data);
          return data;
        });
      }

      cache.set(key, result);
      return result;
    };

    return descriptor;
  };
}

/**
 * Memoization for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Debounced cache setter for high-frequency updates
 */
export function debouncedCacheSet<T>(
  cache: Cache<T>,
  delay: number = 300
): (key: string, data: T) => void {
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (key: string, data: T) => {
    const existingTimeout = timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      cache.set(key, data);
      timeouts.delete(key);
    }, delay);

    timeouts.set(key, timeout);
  };
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  private static warmupTasks: Array<() => Promise<void>> = [];

  static addWarmupTask(task: () => Promise<void>): void {
    this.warmupTasks.push(task);
  }

  static async warmup(): Promise<void> {
    console.log('Starting cache warmup...');
    const startTime = Date.now();

    try {
      await Promise.allSettled(this.warmupTasks.map(task => task()));
      console.log(`Cache warmup completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  }

  static async preloadCriticalData(): Promise<void> {
    // Preload featured properties
    this.addWarmupTask(async () => {
      // This would fetch and cache featured properties
      console.log('Preloading featured properties...');
    });

    // Preload popular agents
    this.addWarmupTask(async () => {
      // This would fetch and cache popular agents
      console.log('Preloading popular agents...');
    });

    // Preload location data
    this.addWarmupTask(async () => {
      // This would fetch and cache location/area data
      console.log('Preloading location data...');
    });

    await this.warmup();
  }
}

/**
 * Performance monitoring for cache
 */
export class CacheMonitor {
  private static metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0
  };

  static recordHit(): void {
    this.metrics.hits++;
  }

  static recordMiss(): void {
    this.metrics.misses++;
  }

  static recordSet(): void {
    this.metrics.sets++;
  }

  static recordEviction(): void {
    this.metrics.evictions++;
  }

  static getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total > 0 ? (this.metrics.hits / total) * 100 : 0,
      total
    };
  }

  static reset(): void {
    this.metrics = { hits: 0, misses: 0, sets: 0, evictions: 0 };
  }
}

export default Cache;
