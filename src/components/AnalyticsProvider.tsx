import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, performanceMonitor, errorTracker, useAnalytics } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsContextType {
  trackPageView: (path: string, title: string) => void;
  trackPropertyView: (property: any) => void;
  trackSearch: (searchData: any) => void;
  trackContact: (contactData: any) => void;
  trackConversion: (type: string, value?: number) => void;
  trackError: (error: Error, context?: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const analyticsHooks = useAnalytics();

  // Initialize analytics on mount
  useEffect(() => {
    analytics.initialize();
  }, []);

  // Track user when authenticated
  useEffect(() => {
    if (user?.id) {
      analytics.setUserId(user.id);
      analytics.setUserProperties({
        user_type: user.role || 'user',
        subscription_status: 'free', // Update based on actual subscription
        registration_date: user.created_at || new Date().toISOString(),
      });
    }
  }, [user]);

  // Track page views on route changes
  useEffect(() => {
    const pageTitle = document.title;
    analytics.trackPageView(location.pathname, pageTitle);
  }, [location]);

  // Enhanced tracking methods
  const trackPropertyView = (property: any) => {
    analytics.trackPropertyView({
      property_id: property.id,
      property_type: property.type,
      property_price: property.price,
      property_location: property.location,
      property_bedrooms: property.bedrooms,
      property_bathrooms: property.bathrooms,
      view_source: 'direct', // Can be enhanced to track source
    });
  };

  const trackSearch = (searchData: any) => {
    analytics.trackSearch({
      search_term: searchData.query || '',
      search_location: searchData.location,
      search_type: searchData.type,
      results_count: searchData.resultsCount || 0,
      search_source: searchData.source || 'unknown',
    });
  };

  const trackContact = (contactData: any) => {
    analytics.trackContact({
      contact_type: contactData.type,
      recipient_id: contactData.recipientId,
      property_id: contactData.propertyId,
      contact_method: contactData.method || 'form',
    });
  };

  const value: AnalyticsContextType = {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackPropertyView,
    trackSearch,
    trackContact,
    trackConversion: analytics.trackConversion.bind(analytics),
    trackError: errorTracker.trackError.bind(errorTracker),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Higher-order component for automatic page tracking
export const withAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const location = useLocation();
    
    useEffect(() => {
      const title = pageName || document.title;
      analytics.trackPageView(location.pathname, title);
    }, [location]);

    return <Component {...props} ref={ref} />;
  });
};

// Hook for tracking user engagement
export const useEngagementTracking = () => {
  useEffect(() => {
    let startTime = Date.now();
    let isVisible = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isVisible) {
          const engagementTime = Date.now() - startTime;
          analytics.trackEngagement({
            engagement_time_msec: engagementTime,
            page_title: document.title,
            page_location: window.location.href,
          });
          isVisible = false;
        }
      } else {
        startTime = Date.now();
        isVisible = true;
      }
    };

    const handleBeforeUnload = () => {
      if (isVisible) {
        const engagementTime = Date.now() - startTime;
        analytics.trackEngagement({
          engagement_time_msec: engagementTime,
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track engagement when component unmounts
      if (isVisible) {
        const engagementTime = Date.now() - startTime;
        analytics.trackEngagement({
          engagement_time_msec: engagementTime,
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };
  }, []);
};

// Component for tracking property interactions
export const PropertyAnalytics: React.FC<{
  property: any;
  children: ReactNode;
}> = ({ property, children }) => {
  const { trackPropertyView } = useAnalyticsContext();

  useEffect(() => {
    if (property) {
      trackPropertyView(property);
    }
  }, [property, trackPropertyView]);

  return <>{children}</>;
};

// Component for tracking search interactions
export const SearchAnalytics: React.FC<{
  searchData: any;
  children: ReactNode;
}> = ({ searchData, children }) => {
  const { trackSearch } = useAnalyticsContext();

  useEffect(() => {
    if (searchData?.query) {
      trackSearch(searchData);
    }
  }, [searchData, trackSearch]);

  return <>{children}</>;
};

// Debug component for development
export const AnalyticsDebugger: React.FC = () => {
  const [metrics, setMetrics] = React.useState<Map<string, number>>(new Map());
  const [errors, setErrors] = React.useState<any[]>([]);

  useEffect(() => {
    if (import.meta.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setErrors(errorTracker.getErrors().slice(-5)); // Show last 5 errors
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (import.meta.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <h4 className="font-bold text-green-400 mb-2">Analytics Debug</h4>
      
      {/* Performance Metrics */}
      <div className="mb-2">
        <h5 className="text-yellow-400 font-semibold">Performance:</h5>
        {Array.from(metrics.entries()).map(([key, value]) => (
          <div key={key} className="text-xs">
            {key.toUpperCase()}: {value.toFixed(2)}ms
          </div>
        ))}
      </div>

      {/* Recent Errors */}
      {errors.length > 0 && (
        <div>
          <h5 className="text-red-400 font-semibold">Recent Errors:</h5>
          {errors.map((errorInfo, index) => (
            <div key={index} className="text-xs text-red-300">
              {errorInfo.error.message}
            </div>
          ))}
        </div>
      )}

      {/* Analytics Status */}
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-xs text-gray-400">
          GA ID: {import.meta.env.VITE_GA_MEASUREMENT_ID ? '✓' : '✗'}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsProvider;
