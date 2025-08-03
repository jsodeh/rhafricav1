// Analytics utilities for Real Estate Hotspot

// Google Analytics 4 (GA4) implementation
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

export interface PropertyViewEvent {
  property_id: string;
  property_type: string;
  property_price: number;
  property_location: string;
  property_bedrooms?: number;
  property_bathrooms?: number;
  view_source: 'search' | 'featured' | 'related' | 'direct';
}

export interface SearchEvent {
  search_term: string;
  search_location?: string;
  search_type?: string;
  results_count: number;
  search_source: 'hero' | 'nav' | 'filters';
}

export interface ContactEvent {
  contact_type: 'agent' | 'property' | 'service' | 'support';
  recipient_id?: string;
  property_id?: string;
  contact_method: 'form' | 'phone' | 'email' | 'chat';
}

export interface UserEngagementEvent {
  engagement_time_msec: number;
  page_title: string;
  page_location: string;
}

class AnalyticsManager {
  private isInitialized = false;
  private measurementId: string;
  private debugMode: boolean;

  constructor() {
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
    this.debugMode = import.meta.env.NODE_ENV === 'development';
  }

  /**
   * Initialize Google Analytics
   */
  initialize(): void {
    if (!this.measurementId || this.isInitialized) {
      if (this.debugMode) {
        console.log('Analytics not initialized:', { 
          hasMeasurementId: !!this.measurementId, 
          isInitialized: this.isInitialized 
        });
      }
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: false, // We'll handle page views manually
      cookie_flags: 'SameSite=None;Secure',
      anonymize_ip: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: false
    });

    this.isInitialized = true;

    if (this.debugMode) {
      console.log('Google Analytics initialized with ID:', this.measurementId);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title: string): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      page_path: path,
      page_title: title,
    });

    if (this.debugMode) {
      console.log('Page view tracked:', { path, title });
    }
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) return;

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.customParameters,
    });

    if (this.debugMode) {
      console.log('Event tracked:', event);
    }
  }

  /**
   * Track property view
   */
  trackPropertyView(event: PropertyViewEvent): void {
    this.trackEvent({
      action: 'view_item',
      category: 'Property',
      label: `${event.property_type} - ${event.property_location}`,
      value: event.property_price,
      customParameters: {
        item_id: event.property_id,
        item_name: `${event.property_bedrooms}BR ${event.property_bathrooms}BA ${event.property_type}`,
        item_category: event.property_type,
        item_location: event.property_location,
        currency: 'NGN',
        value: event.property_price,
        view_source: event.view_source,
        bedrooms: event.property_bedrooms,
        bathrooms: event.property_bathrooms,
      },
    });
  }

  /**
   * Track search performed
   */
  trackSearch(event: SearchEvent): void {
    this.trackEvent({
      action: 'search',
      category: 'User Interaction',
      label: event.search_term,
      value: event.results_count,
      customParameters: {
        search_term: event.search_term,
        search_location: event.search_location,
        search_type: event.search_type,
        results_count: event.results_count,
        search_source: event.search_source,
      },
    });
  }

  /**
   * Track contact attempt
   */
  trackContact(event: ContactEvent): void {
    this.trackEvent({
      action: 'contact',
      category: 'Lead Generation',
      label: `${event.contact_type}_${event.contact_method}`,
      customParameters: {
        contact_type: event.contact_type,
        contact_method: event.contact_method,
        recipient_id: event.recipient_id,
        property_id: event.property_id,
      },
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(event: UserEngagementEvent): void {
    this.trackEvent({
      action: 'user_engagement',
      category: 'User Behavior',
      value: Math.round(event.engagement_time_msec / 1000),
      customParameters: {
        engagement_time_msec: event.engagement_time_msec,
        page_title: event.page_title,
        page_location: event.page_location,
      },
    });
  }

  /**
   * Track conversion events
   */
  trackConversion(type: 'sign_up' | 'contact_form' | 'property_inquiry' | 'viewing_request', value?: number): void {
    this.trackEvent({
      action: type,
      category: 'Conversion',
      value: value,
      customParameters: {
        conversion_type: type,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track error events
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent({
      action: 'exception',
      category: 'Error',
      label: error.message,
      customParameters: {
        description: error.message,
        fatal: false,
        context: context,
        stack: error.stack,
      },
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) return;

    window.gtag('set', {
      user_properties: properties,
    });

    if (this.debugMode) {
      console.log('User properties set:', properties);
    }
  }

  /**
   * Set user ID for cross-device tracking
   */
  setUserId(userId: string): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      user_id: userId,
    });

    if (this.debugMode) {
      console.log('User ID set:', userId);
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Core Web Vitals
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('lcp', lastEntry.startTime);
        this.reportMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fid = (entry as any).processingStart - entry.startTime;
          this.metrics.set('fid', fid);
          this.reportMetric('FID', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.metrics.set('cls', clsValue);
        this.reportMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  private reportMetric(name: string, value: number): void {
    // Report to analytics
    analytics.trackEvent({
      action: 'core_web_vitals',
      category: 'Performance',
      label: name,
      value: Math.round(value),
      customParameters: {
        metric_name: name,
        metric_value: value,
        page_url: window.location.href,
      },
    });
  }

  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Error tracking
class ErrorTracker {
  private errors: Array<{ error: Error; timestamp: Date; context?: string }> = [];

  constructor() {
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), `${event.filename}:${event.lineno}:${event.colno}`);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'Unhandled Promise Rejection');
    });
  }

  trackError(error: Error, context?: string): void {
    const errorInfo = {
      error,
      timestamp: new Date(),
      context,
    };

    this.errors.push(errorInfo);
    
    // Report to analytics
    analytics.trackError(error, context);

    // Log to console in development
    if (import.meta.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorInfo);
    }

    // Limit stored errors to prevent memory issues
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-50);
    }
  }

  getErrors(): Array<{ error: Error; timestamp: Date; context?: string }> {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// Export instances
export const analytics = new AnalyticsManager();
export const performanceMonitor = new PerformanceMonitor();
export const errorTracker = new ErrorTracker();

// React hooks for analytics
export const useAnalytics = () => {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPropertyView: analytics.trackPropertyView.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackContact: analytics.trackContact.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
  };
};

export const usePageTracking = (path: string, title: string) => {
  React.useEffect(() => {
    analytics.trackPageView(path, title);
  }, [path, title]);
};

export const useErrorTracking = () => {
  return {
    trackError: errorTracker.trackError.bind(errorTracker),
    getErrors: errorTracker.getErrors.bind(errorTracker),
    clearErrors: errorTracker.clearErrors.bind(errorTracker),
  };
};

import React from 'react';
