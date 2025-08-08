/**
 * Bundle Size Analyzer
 * 
 * This module provides utilities for analyzing and optimizing bundle size
 * by identifying large dependencies and suggesting optimizations.
 */

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  largestChunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  suggestions: string[];
}

/**
 * Analyze current bundle performance
 */
export const analyzeBundleSize = async (): Promise<BundleAnalysis> => {
  const analysis: BundleAnalysis = {
    totalSize: 0,
    gzippedSize: 0,
    largestChunks: [],
    suggestions: []
  };

  if (typeof window === 'undefined') {
    return analysis;
  }

  try {
    // Get performance entries for script resources
    const scriptEntries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('.js') || entry.name.includes('.css'))
      .map(entry => ({
        name: entry.name.split('/').pop() || 'unknown',
        size: (entry as any).transferSize || 0,
        percentage: 0
      }))
      .sort((a, b) => b.size - a.size);

    const totalSize = scriptEntries.reduce((sum, entry) => sum + entry.size, 0);
    
    // Calculate percentages
    scriptEntries.forEach(entry => {
      entry.percentage = (entry.size / totalSize) * 100;
    });

    analysis.totalSize = totalSize;
    analysis.gzippedSize = Math.round(totalSize * 0.3); // Rough estimate
    analysis.largestChunks = scriptEntries.slice(0, 10);

    // Generate optimization suggestions
    if (totalSize > 1000000) { // > 1MB
      analysis.suggestions.push('Bundle size is large (>1MB). Consider code splitting.');
    }

    const largeChunks = scriptEntries.filter(chunk => chunk.percentage > 20);
    if (largeChunks.length > 0) {
      analysis.suggestions.push(`Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}`);
    }

    // Check for common optimization opportunities
    const hasLodash = scriptEntries.some(chunk => chunk.name.includes('lodash'));
    if (hasLodash) {
      analysis.suggestions.push('Consider using lodash-es or individual lodash functions to reduce bundle size');
    }

    const hasMoment = scriptEntries.some(chunk => chunk.name.includes('moment'));
    if (hasMoment) {
      analysis.suggestions.push('Consider replacing moment.js with date-fns or dayjs for smaller bundle size');
    }

    // CSS optimization suggestions
    const cssSize = scriptEntries
      .filter(chunk => chunk.name.includes('.css'))
      .reduce((sum, chunk) => sum + chunk.size, 0);
    
    if (cssSize > 200000) { // > 200KB
      analysis.suggestions.push('CSS bundle is large. Consider purging unused styles and using critical CSS.');
    }

    // General suggestions
    analysis.suggestions.push(
      'Use dynamic imports for route-based code splitting',
      'Implement tree shaking to remove unused code',
      'Consider using a CDN for large third-party libraries',
      'Optimize images and use modern formats (WebP, AVIF)',
      'Enable gzip/brotli compression on your server'
    );

  } catch (error) {
    console.warn('Bundle analysis failed:', error);
    analysis.suggestions.push('Bundle analysis failed. Check browser console for details.');
  }

  return analysis;
};

/**
 * Monitor bundle loading performance
 */
export const monitorBundlePerformance = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Monitor script loading times
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.name.includes('.js') || entry.name.includes('.css')) {
        const loadTime = entry.duration;
        const size = (entry as any).transferSize || 0;
        
        console.log(`Resource loaded: ${entry.name.split('/').pop()}`);
        console.log(`  Size: ${(size / 1024).toFixed(2)}KB`);
        console.log(`  Load time: ${loadTime.toFixed(2)}ms`);
        
        // Warn about slow loading resources
        if (loadTime > 1000) {
          console.warn(`Slow loading resource detected: ${entry.name} (${loadTime.toFixed(2)}ms)`);
        }
        
        // Warn about large resources
        if (size > 500000) { // > 500KB
          console.warn(`Large resource detected: ${entry.name} (${(size / 1024).toFixed(2)}KB)`);
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });

  // Monitor long tasks that might indicate large bundle parsing
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask not supported in all browsers
    }
  }
};

/**
 * Suggest code splitting opportunities
 */
export const suggestCodeSplitting = (): string[] => {
  const suggestions: string[] = [];

  // Check for large route components that could be split
  const routeComponents = [
    'Dashboard',
    'Properties',
    'PropertyDetail',
    'AdminDashboard',
    'AgentDashboard',
    'OwnerDashboard'
  ];

  suggestions.push(
    'Split large route components using React.lazy()',
    'Use dynamic imports for heavy third-party libraries',
    'Implement route-based code splitting',
    'Consider splitting vendor libraries into separate chunks'
  );

  // Check for heavy dependencies
  const heavyDependencies = [
    'mapbox-gl',
    'chart.js',
    'react-query',
    'framer-motion'
  ];

  heavyDependencies.forEach(dep => {
    suggestions.push(`Consider lazy loading ${dep} only when needed`);
  });

  return suggestions;
};

/**
 * Optimize asset loading
 */
export const optimizeAssetLoading = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Preload critical resources
  const preloadCriticalAssets = () => {
    const criticalAssets = [
      '/real-estate.jpg', // Hero image
      // Add other critical assets
    ];

    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = asset.includes('.jpg') || asset.includes('.png') ? 'image' : 'fetch';
      document.head.appendChild(link);
    });
  };

  // Lazy load non-critical assets
  const lazyLoadAssets = () => {
    const nonCriticalAssets = [
      // Add non-critical assets that can be loaded later
    ];

    // Load these after the page has loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        nonCriticalAssets.forEach(asset => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = asset;
          document.head.appendChild(link);
        });
      }, 2000);
    });
  };

  preloadCriticalAssets();
  lazyLoadAssets();
};

/**
 * Generate performance budget report
 */
export const generatePerformanceBudget = (): {
  budget: Record<string, number>;
  current: Record<string, number>;
  status: Record<string, 'pass' | 'warn' | 'fail'>;
} => {
  const budget = {
    totalJS: 500, // KB
    totalCSS: 100, // KB
    totalImages: 1000, // KB
    totalFonts: 100, // KB
  };

  const current = {
    totalJS: 0,
    totalCSS: 0,
    totalImages: 0,
    totalFonts: 0,
  };

  const status: Record<string, 'pass' | 'warn' | 'fail'> = {};

  if (typeof window !== 'undefined') {
    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(resource => {
      const size = (resource as any).transferSize || 0;
      const sizeKB = size / 1024;
      
      if (resource.name.includes('.js')) {
        current.totalJS += sizeKB;
      } else if (resource.name.includes('.css')) {
        current.totalCSS += sizeKB;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        current.totalImages += sizeKB;
      } else if (resource.name.match(/\.(woff|woff2|ttf|otf)$/)) {
        current.totalFonts += sizeKB;
      }
    });

    // Determine status for each category
    Object.keys(budget).forEach(key => {
      const budgetValue = budget[key as keyof typeof budget];
      const currentValue = current[key as keyof typeof current];
      
      if (currentValue <= budgetValue) {
        status[key] = 'pass';
      } else if (currentValue <= budgetValue * 1.2) {
        status[key] = 'warn';
      } else {
        status[key] = 'fail';
      }
    });
  }

  return { budget, current, status };
};

export default {
  analyzeBundleSize,
  monitorBundlePerformance,
  suggestCodeSplitting,
  optimizeAssetLoading,
  generatePerformanceBudget
};