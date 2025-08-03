/**
 * Advanced Performance Monitoring System
 * Tracks Core Web Vitals, custom metrics, and performance alerts
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold?: {
    good: number;
    poor: number;
  };
}

export interface CoreWebVitals {
  lcp?: PerformanceMetric; // Largest Contentful Paint
  fid?: PerformanceMetric; // First Input Delay
  cls?: PerformanceMetric; // Cumulative Layout Shift
  fcp?: PerformanceMetric; // First Contentful Paint
  ttfb?: PerformanceMetric; // Time to First Byte
}

export interface CustomMetrics {
  routeChangeTime?: PerformanceMetric;
  apiResponseTime?: PerformanceMetric;
  searchResponseTime?: PerformanceMetric;
  imageLoadTime?: PerformanceMetric;
  bundleLoadTime?: PerformanceMetric;
  memoryUsage?: PerformanceMetric;
  errorRate?: PerformanceMetric;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  message: string;
}

export interface PerformanceReport {
  coreWebVitals: CoreWebVitals;
  customMetrics: CustomMetrics;
  alerts: PerformanceAlert[];
  summary: {
    overall: 'good' | 'needs-improvement' | 'poor';
    score: number;
  };
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: PerformanceAlert[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private listeners: ((report: PerformanceReport) => void)[] = [];
  private routeStartTime: number = 0;
  private isMonitoring = false;

  // Core Web Vitals thresholds
  private thresholds = {
    lcp: { good: 2500, poor: 4000 }, // ms
    fid: { good: 100, poor: 300 }, // ms
    cls: { good: 0.1, poor: 0.25 }, // score
    fcp: { good: 1800, poor: 3000 }, // ms
    ttfb: { good: 800, poor: 1800 }, // ms
    routeChange: { good: 200, poor: 1000 }, // ms
    apiResponse: { good: 500, poor: 2000 }, // ms
    memoryUsage: { good: 50, poor: 80 }, // MB
    errorRate: { good: 0.01, poor: 0.05 }, // %
  };

  constructor() {
    this.setupObservers();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupCoreWebVitalsTracking();
    this.setupCustomMetricsTracking();
    this.setupRouteChangeTracking();
    
    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    console.log('Performance monitoring stopped');
  }

  /**
   * Setup performance observers
   */
  private setupObservers(): void {
    // Paint timing observer
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('fcp', entry.startTime, 'ms', this.thresholds.fcp);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.warn('Paint observer not supported:', error);
      }

      // Navigation timing observer
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('ttfb', navEntry.responseStart - navEntry.requestStart, 'ms', this.thresholds.ttfb);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.initiatorType === 'img') {
              this.recordMetric('imageLoad', entry.duration, 'ms');
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  /**
   * Setup Core Web Vitals tracking
   */
  private setupCoreWebVitalsTracking(): void {
    // LCP (Largest Contentful Paint)
    this.trackLCP();
    
    // FID (First Input Delay)
    this.trackFID();
    
    // CLS (Cumulative Layout Shift)
    this.trackCLS();
  }

  /**
   * Track Largest Contentful Paint
   */
  private trackLCP(): void {
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', lastEntry.startTime, 'ms', this.thresholds.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }
  }

  /**
   * Track First Input Delay
   */
  private trackFID(): void {
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('fid', entry.processingStart - entry.startTime, 'ms', this.thresholds.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }
  }

  /**
   * Track Cumulative Layout Shift
   */
  private trackCLS(): void {
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              this.recordMetric('cls', clsValue, 'score', this.thresholds.cls);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  /**
   * Setup custom metrics tracking
   */
  private setupCustomMetricsTracking(): void {
    // Memory usage tracking
    this.trackMemoryUsage();
    
    // Bundle load time tracking
    this.trackBundleLoadTime();
    
    // Error rate tracking
    this.trackErrorRate();
  }

  /**
   * Track memory usage
   */
  private trackMemoryUsage(): void {
    const trackMemory = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        this.recordMetric('memoryUsage', usedMB, 'MB', this.thresholds.memoryUsage);
      }
    };

    trackMemory();
    setInterval(trackMemory, 30000); // Every 30 seconds
  }

  /**
   * Track bundle load time
   */
  private trackBundleLoadTime(): void {
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      resources.forEach(resource => {
        if (resource.name.includes('.js') && resource.name.includes('assets')) {
          this.recordMetric('bundleLoad', resource.duration, 'ms');
        }
      });
    }
  }

  /**
   * Track error rate
   */
  private trackErrorRate(): void {
    let errorCount = 0;
    let totalRequests = 0;

    // Override fetch to track error rate
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      totalRequests++;
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          errorCount++;
        }
        
        if (totalRequests > 0) {
          const errorRate = errorCount / totalRequests;
          this.recordMetric('errorRate', errorRate * 100, '%', this.thresholds.errorRate);
        }
        
        return response;
      } catch (error) {
        errorCount++;
        if (totalRequests > 0) {
          const errorRate = errorCount / totalRequests;
          this.recordMetric('errorRate', errorRate * 100, '%', this.thresholds.errorRate);
        }
        throw error;
      }
    };
  }

  /**
   * Setup route change tracking
   */
  private setupRouteChangeTracking(): void {
    // Track route changes for SPA
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const trackRouteChange = () => {
      if (this.routeStartTime > 0) {
        const routeChangeTime = performance.now() - this.routeStartTime;
        this.recordMetric('routeChange', routeChangeTime, 'ms', this.thresholds.routeChange);
      }
      this.routeStartTime = performance.now();
    };

    history.pushState = function(...args) {
      trackRouteChange();
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      trackRouteChange();
      return originalReplaceState.apply(this, args);
    };

    window.addEventListener('popstate', trackRouteChange);
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string, 
    value: number, 
    unit: string, 
    threshold?: { good: number; poor: number }
  ): void {
    const rating = this.getRating(value, threshold);
    
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: performance.now(),
      rating,
      threshold,
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const metricHistory = this.metrics.get(name)!;
    metricHistory.push(metric);
    
    // Keep only last 100 entries per metric
    if (metricHistory.length > 100) {
      metricHistory.splice(0, metricHistory.length - 100);
    }

    // Check for alerts
    this.checkAlert(metric);

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Get rating based on threshold
   */
  private getRating(value: number, threshold?: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Check if metric triggers an alert
   */
  private checkAlert(metric: PerformanceMetric): void {
    if (metric.rating === 'poor' && metric.threshold) {
      const alert: PerformanceAlert = {
        id: `${metric.name}-${Date.now()}`,
        metric: metric.name,
        value: metric.value,
        threshold: metric.threshold.poor,
        severity: 'critical',
        timestamp: Date.now(),
        message: `${metric.name} (${metric.value}${metric.unit}) exceeded critical threshold (${metric.threshold.poor}${metric.unit})`,
      };
      
      this.alerts.push(alert);
      this.triggerAlert(alert);
    } else if (metric.rating === 'needs-improvement' && metric.threshold) {
      const alert: PerformanceAlert = {
        id: `${metric.name}-${Date.now()}`,
        metric: metric.name,
        value: metric.value,
        threshold: metric.threshold.good,
        severity: 'warning',
        timestamp: Date.now(),
        message: `${metric.name} (${metric.value}${metric.unit}) needs improvement (target: ${metric.threshold.good}${metric.unit})`,
      };
      
      this.alerts.push(alert);
      this.triggerAlert(alert);
    }
  }

  /**
   * Trigger performance alert
   */
  private triggerAlert(alert: PerformanceAlert): void {
    console.warn('Performance Alert:', alert);
    
    // Send to external monitoring service
    this.sendAlertToService(alert);
  }

  /**
   * Send alert to external monitoring service
   */
  private async sendAlertToService(alert: PerformanceAlert): Promise<void> {
    try {
      // In production, send to monitoring service
      if (import.meta.env.MODE === 'production') {
        // Example: Send to custom monitoring endpoint
        /*
        await fetch('/api/performance-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
        */
      }
      
      // Send to Google Analytics as custom event
      if (window.gtag) {
        window.gtag('event', 'performance_alert', {
          metric_name: alert.metric,
          metric_value: alert.value,
          severity: alert.severity,
          custom_parameters: {
            threshold: alert.threshold,
            message: alert.message,
          },
        });
      }
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  /**
   * Track API response time
   */
  trackApiCall(endpoint: string, startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.recordMetric('apiResponse', responseTime, 'ms', this.thresholds.apiResponse);
  }

  /**
   * Track search response time
   */
  trackSearchTime(query: string, startTime: number): void {
    const searchTime = performance.now() - startTime;
    this.recordMetric('searchResponse', searchTime, 'ms', this.thresholds.apiResponse);
  }

  /**
   * Get current performance report
   */
  getPerformanceReport(): PerformanceReport {
    const coreWebVitals: CoreWebVitals = {};
    const customMetrics: CustomMetrics = {};

    // Gather Core Web Vitals
    ['lcp', 'fid', 'cls', 'fcp', 'ttfb'].forEach(metric => {
      const metricData = this.metrics.get(metric);
      if (metricData && metricData.length > 0) {
        (coreWebVitals as any)[metric] = metricData[metricData.length - 1];
      }
    });

    // Gather custom metrics
    ['routeChange', 'apiResponse', 'searchResponse', 'imageLoad', 'bundleLoad', 'memoryUsage', 'errorRate'].forEach(metric => {
      const metricData = this.metrics.get(metric);
      if (metricData && metricData.length > 0) {
        const key = metric === 'routeChange' ? 'routeChangeTime' : 
                   metric === 'apiResponse' ? 'apiResponseTime' :
                   metric === 'searchResponse' ? 'searchResponseTime' :
                   metric === 'imageLoad' ? 'imageLoadTime' :
                   metric === 'bundleLoad' ? 'bundleLoadTime' :
                   metric;
        (customMetrics as any)[key] = metricData[metricData.length - 1];
      }
    });

    // Calculate overall score
    const allMetrics = [...Object.values(coreWebVitals), ...Object.values(customMetrics)];
    const goodCount = allMetrics.filter(m => m?.rating === 'good').length;
    const totalCount = allMetrics.length;
    const score = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 100;
    
    let overall: 'good' | 'needs-improvement' | 'poor';
    if (score >= 80) overall = 'good';
    else if (score >= 60) overall = 'needs-improvement';
    else overall = 'poor';

    return {
      coreWebVitals,
      customMetrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      summary: { overall, score },
      timestamp: Date.now(),
    };
  }

  /**
   * Add performance report listener
   */
  addListener(listener: (report: PerformanceReport) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove performance report listener
   */
  removeListener(listener: (report: PerformanceReport) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const report = this.getPerformanceReport();
    this.listeners.forEach(listener => {
      try {
        listener(report);
      } catch (error) {
        console.error('Performance listener error:', error);
      }
    });
  }

  /**
   * Clear all metrics and alerts
   */
  clearData(): void {
    this.metrics.clear();
    this.alerts = [];
  }

  /**
   * Export performance data
   */
  exportData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
