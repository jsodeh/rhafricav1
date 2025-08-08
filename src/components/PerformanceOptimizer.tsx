import { useEffect } from 'react';
import { monitorCSSPerformance } from '@/lib/cssOptimization';
import { monitorBundlePerformance, optimizeAssetLoading } from '@/lib/bundleAnalyzer';

/**
 * Performance Optimizer Component
 * 
 * This component handles performance optimizations including:
 * - CSS performance monitoring
 * - Image lazy loading optimization
 * - Bundle size monitoring
 * - Core Web Vitals tracking
 */
const PerformanceOptimizer = () => {
  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('enablePerformanceMonitoring')) {
      monitorCSSPerformance();
      monitorBundlePerformance();

      // Monitor Core Web Vitals
      try {
        import('web-vitals').then((webVitals) => {
          // Use the available functions from web-vitals with type-safe checking
          const vitals = webVitals as any; // Type assertion to avoid TypeScript errors

          if (vitals.onCLS) vitals.onCLS((metric: any) => console.log('CLS:', metric));
          if (vitals.onINP) vitals.onINP((metric: any) => console.log('INP:', metric)); // INP replaced FID in v5
          if (vitals.onFCP) vitals.onFCP((metric: any) => console.log('FCP:', metric));
          if (vitals.onLCP) vitals.onLCP((metric: any) => console.log('LCP:', metric));
          if (vitals.onTTFB) vitals.onTTFB((metric: any) => console.log('TTFB:', metric));

          // Fallback for older versions that might still have FID
          if (vitals.onFID) vitals.onFID((metric: any) => console.log('FID:', metric));
        }).catch(() => {
          // Fallback: Basic performance monitoring without web-vitals
          console.log('Web Vitals not available, using basic performance monitoring');

          // Monitor basic performance metrics
          if ('performance' in window && 'getEntriesByType' in performance) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
              console.log(`${entry.name}: ${entry.startTime}ms`);
            });

            const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigationEntry) {
              console.log('DOM Content Loaded:', navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart, 'ms');
              console.log('Load Complete:', navigationEntry.loadEventEnd - navigationEntry.loadEventStart, 'ms');
            }
          }
        });
      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }

    // Always optimize asset loading
    optimizeAssetLoading();

    // Optimize images with intersection observer
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
      fontLink.as = 'font';
      fontLink.type = 'font/woff2';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);

      // Preload critical images
      const heroImage = new Image();
      heroImage.src = '/real-estate.jpg';
    };

    preloadCriticalResources();

    // Cleanup
    return () => {
      imageObserver.disconnect();
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default PerformanceOptimizer;