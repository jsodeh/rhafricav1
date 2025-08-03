// Analytics configuration for different environments

export interface AnalyticsConfig {
  googleAnalytics: {
    enabled: boolean;
    measurementId?: string;
    debug: boolean;
  };
  hotjar: {
    enabled: boolean;
    siteId?: string;
  };
  sentry: {
    enabled: boolean;
    dsn?: string;
    environment: string;
  };
  customTracking: {
    enabled: boolean;
    endpoint?: string;
  };
  features: {
    performanceMonitoring: boolean;
    errorTracking: boolean;
    userBehaviorTracking: boolean;
    conversionTracking: boolean;
  };
}

class AnalyticsConfigManager {
  private config: AnalyticsConfig;
  private environment: string;

  constructor() {
    this.environment = import.meta.env.NODE_ENV || 'development';
    this.config = this.createConfig();
  }

  private createConfig(): AnalyticsConfig {
    const baseConfig: AnalyticsConfig = {
      googleAnalytics: {
        enabled: false,
        debug: false,
      },
      hotjar: {
        enabled: false,
      },
      sentry: {
        enabled: false,
        environment: this.environment,
      },
      customTracking: {
        enabled: false,
      },
      features: {
        performanceMonitoring: true,
        errorTracking: true,
        userBehaviorTracking: false,
        conversionTracking: false,
      },
    };

    // Environment-specific configurations
    switch (this.environment) {
      case 'development':
        return {
          ...baseConfig,
          googleAnalytics: {
            enabled: !!import.meta.env.VITE_GA_MEASUREMENT_ID,
            measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
            debug: true,
          },
          features: {
            ...baseConfig.features,
            userBehaviorTracking: true,
          },
        };

      case 'staging':
        return {
          ...baseConfig,
          googleAnalytics: {
            enabled: !!import.meta.env.VITE_GA_MEASUREMENT_ID,
            measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
            debug: false,
          },
          hotjar: {
            enabled: !!import.meta.env.VITE_HOTJAR_ID,
            siteId: import.meta.env.VITE_HOTJAR_ID,
          },
          sentry: {
            enabled: !!import.meta.env.VITE_SENTRY_DSN,
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: 'staging',
          },
          features: {
            performanceMonitoring: true,
            errorTracking: true,
            userBehaviorTracking: true,
            conversionTracking: false,
          },
        };

      case 'production':
        return {
          ...baseConfig,
          googleAnalytics: {
            enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
            measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
            debug: false,
          },
          hotjar: {
            enabled: !!import.meta.env.VITE_HOTJAR_ID,
            siteId: import.meta.env.VITE_HOTJAR_ID,
          },
          sentry: {
            enabled: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: 'production',
          },
          customTracking: {
            enabled: true,
            endpoint: '/api/analytics',
          },
          features: {
            performanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
            errorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
            userBehaviorTracking: true,
            conversionTracking: true,
          },
        };

      default:
        return baseConfig;
    }
  }

  getConfig(): AnalyticsConfig {
    return this.config;
  }

  isFeatureEnabled(feature: keyof AnalyticsConfig['features']): boolean {
    return this.config.features[feature];
  }

  getGoogleAnalyticsConfig() {
    return this.config.googleAnalytics;
  }

  getHotjarConfig() {
    return this.config.hotjar;
  }

  getSentryConfig() {
    return this.config.sentry;
  }

  // Initialize third-party analytics services
  async initializeServices(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Initialize Hotjar
    if (this.config.hotjar.enabled && this.config.hotjar.siteId) {
      promises.push(this.initializeHotjar());
    }

    // Initialize Sentry
    if (this.config.sentry.enabled && this.config.sentry.dsn) {
      promises.push(this.initializeSentry());
    }

    await Promise.all(promises);
  }

  private async initializeHotjar(): Promise<void> {
    return new Promise((resolve) => {
      const hjScript = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${this.config.hotjar.siteId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      
      const script = document.createElement('script');
      script.innerHTML = hjScript;
      document.head.appendChild(script);
      
      console.log('Hotjar initialized with site ID:', this.config.hotjar.siteId);
      resolve();
    });
  }

  private async initializeSentry(): Promise<void> {
    try {
      // For production, you would import and configure Sentry here
      // import * as Sentry from "@sentry/browser";
      // Sentry.init({
      //   dsn: this.config.sentry.dsn,
      //   environment: this.config.sentry.environment,
      // });
      
      console.log('Sentry would be initialized here with DSN:', this.config.sentry.dsn);
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  // GDPR compliance utilities
  hasUserConsent(): boolean {
    return localStorage.getItem('analytics_consent') === 'true';
  }

  setUserConsent(consent: boolean): void {
    localStorage.setItem('analytics_consent', consent.toString());
    
    if (consent) {
      this.initializeServices();
    } else {
      this.disableTracking();
    }
  }

  private disableTracking(): void {
    // Disable Google Analytics
    if (window.gtag) {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    }

    // Disable Hotjar
    if ((window as any).hj) {
      (window as any).hj('stateChange', '/privacy-mode');
    }
  }

  // Analytics event validation
  validateEvent(event: any): boolean {
    const requiredFields = ['action', 'category'];
    return requiredFields.every(field => event[field]);
  }

  // Performance budget checking
  checkPerformanceBudget(): {
    withinBudget: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    let withinBudget = true;

    // Check bundle size
    const scripts = document.querySelectorAll('script[src]');
    const totalScriptSize = Array.from(scripts).reduce((total, script) => {
      const src = script.getAttribute('src');
      if (src && src.includes('.js')) {
        // Estimate size based on common patterns
        return total + 100; // Simplified estimation
      }
      return total;
    }, 0);

    if (totalScriptSize > 500) { // 500KB budget
      issues.push(`Script budget exceeded: ${totalScriptSize}KB > 500KB`);
      withinBudget = false;
    }

    // Check third-party scripts
    const thirdPartyScripts = Array.from(scripts).filter(script => {
      const src = script.getAttribute('src');
      return src && !src.startsWith('/') && !src.startsWith(window.location.origin);
    });

    if (thirdPartyScripts.length > 5) {
      issues.push(`Too many third-party scripts: ${thirdPartyScripts.length} > 5`);
      withinBudget = false;
    }

    return { withinBudget, issues };
  }
}

// Export singleton instance
export const analyticsConfig = new AnalyticsConfigManager();

// React hook for analytics configuration
export const useAnalyticsConfig = () => {
  return {
    config: analyticsConfig.getConfig(),
    isFeatureEnabled: analyticsConfig.isFeatureEnabled.bind(analyticsConfig),
    hasUserConsent: analyticsConfig.hasUserConsent.bind(analyticsConfig),
    setUserConsent: analyticsConfig.setUserConsent.bind(analyticsConfig),
  };
};

export default AnalyticsConfigManager;
