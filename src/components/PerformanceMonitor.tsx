import React, { useEffect, useState } from 'react';
import { CacheMonitor } from '@/lib/cache';
import { performanceMonitor } from '@/lib/performanceMonitor';
import { healthCheckManager } from '@/lib/healthCheck';
import { uptimeMonitor } from '@/lib/uptimeMonitor';
import { alertingSystem } from '@/lib/alertingSystem';

interface PerformanceMetrics {
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  navigationStart?: number;
  loadEventEnd?: number;
  domContentLoaded?: number;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  cacheHitRate?: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Initialize monitoring systems
    performanceMonitor.startMonitoring();
    healthCheckManager.startMonitoring();
    uptimeMonitor.startMonitoring();

    // Setup alerting integration
    performanceMonitor.addListener((report) => {
      // Check performance metrics against alerting rules
      if (report.coreWebVitals.lcp) {
        alertingSystem.checkMetric('lcp', report.coreWebVitals.lcp.value);
      }
      if (report.customMetrics.memoryUsage) {
        alertingSystem.checkMetric('memoryUsage', report.customMetrics.memoryUsage.value);
      }
      if (report.customMetrics.apiResponseTime) {
        alertingSystem.checkMetric('apiResponseTime', report.customMetrics.apiResponseTime.value);
      }
      if (report.customMetrics.errorRate) {
        alertingSystem.checkMetric('errorRate', report.customMetrics.errorRate.value);
      }
    });

    uptimeMonitor.addListener((event) => {
      if (event.type === 'down') {
        alertingSystem.checkMetric('status', 0); // 0 = down
      } else if (event.type === 'up') {
        alertingSystem.checkMetric('status', 1); // 1 = up
      }
    });

    const collectMetrics = () => {
      const newMetrics: PerformanceMetrics = {};

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        newMetrics.navigationStart = navigation.navigationStart;
        newMetrics.loadEventEnd = navigation.loadEventEnd;
        newMetrics.domContentLoaded = navigation.domContentLoadedEventEnd;
      }

      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.usedJSHeapSize = memory.usedJSHeapSize;
        newMetrics.totalJSHeapSize = memory.totalJSHeapSize;
        newMetrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
      }

      const cacheMetrics = CacheMonitor.getMetrics();
      newMetrics.cacheHitRate = cacheMetrics.hitRate;

      setMetrics(newMetrics);
    };

    collectMetrics();

    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          setMetrics(prev => ({
            ...prev,
            firstInputDelay: (entry as any).processingStart - entry.startTime
          }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        setMetrics(prev => ({
          ...prev,
          cumulativeLayoutShift: clsValue
        }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }

    const interval = setInterval(collectMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyP') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatTime = (time?: number) => {
    if (!time) return 'N/A';
    return `${Math.round(time)}ms`;
  };

  const getScoreColor = (score: number, good: number, poor: number) => {
    if (score <= good) return 'text-green-600';
    if (score <= poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50 backdrop-blur">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <h4 className="font-semibold text-blue-400 mb-1">Core Web Vitals</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>
              LCP: <span className={getScoreColor(metrics.largestContentfulPaint || 0, 2500, 4000)}>
                {formatTime(metrics.largestContentfulPaint)}
              </span>
            </div>
            <div>
              FID: <span className={getScoreColor(metrics.firstInputDelay || 0, 100, 300)}>
                {formatTime(metrics.firstInputDelay)}
              </span>
            </div>
            <div className="col-span-2">
              CLS: <span className={getScoreColor((metrics.cumulativeLayoutShift || 0) * 1000, 100, 250)}>
                {(metrics.cumulativeLayoutShift || 0).toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-green-400 mb-1">Navigation</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>Load: {formatTime(metrics.loadEventEnd)}</div>
            <div>DOMReady: {formatTime(metrics.domContentLoaded)}</div>
          </div>
        </div>

        {metrics.usedJSHeapSize && (
          <div>
            <h4 className="font-semibold text-purple-400 mb-1">Memory</h4>
            <div className="text-xs">
              <div>Used: {formatBytes(metrics.usedJSHeapSize)}</div>
              <div>Total: {formatBytes(metrics.totalJSHeapSize)}</div>
              <div className="text-gray-400">
                Usage: {metrics.totalJSHeapSize ? 
                  Math.round((metrics.usedJSHeapSize / metrics.totalJSHeapSize) * 100) : 0}%
              </div>
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-yellow-400 mb-1">Cache</h4>
          <div className="text-xs">
            Hit Rate: <span className={getScoreColor(100 - (metrics.cacheHitRate || 0), 80, 60)}>
              {(metrics.cacheHitRate || 0).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400 text-xs">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;

export const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};
