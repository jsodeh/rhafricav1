/**
 * Comprehensive Health Check System
 * Monitors application health, dependencies, and performance
 */

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
}

export interface HealthThresholds {
  responseTime: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number;
    critical: number;
  };
  memoryUsage: {
    warning: number;
    critical: number;
  };
}

class HealthCheckManager {
  private checks: Map<string, () => Promise<HealthCheckResult>> = new Map();
  private lastResults: Map<string, HealthCheckResult> = new Map();
  private startTime = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((health: SystemHealth) => void)[] = [];

  private thresholds: HealthThresholds = {
    responseTime: {
      warning: 1000,
      critical: 3000,
    },
    errorRate: {
      warning: 0.05, // 5%
      critical: 0.1, // 10%
    },
    memoryUsage: {
      warning: 0.8, // 80%
      critical: 0.9, // 90%
    },
  };

  constructor() {
    this.setupDefaultChecks();
  }

  /**
   * Setup default health checks
   */
  private setupDefaultChecks(): void {
    // Application readiness check
    this.registerCheck('app-ready', this.checkAppReady.bind(this));
    
    // API connectivity check
    this.registerCheck('api-connectivity', this.checkApiConnectivity.bind(this));
    
    // Database connectivity check
    this.registerCheck('database', this.checkDatabase.bind(this));
    
    // External services check
    this.registerCheck('external-services', this.checkExternalServices.bind(this));
    
    // Browser API availability check
    this.registerCheck('browser-apis', this.checkBrowserApis.bind(this));
    
    // Performance metrics check
    this.registerCheck('performance', this.checkPerformance.bind(this));
    
    // Local storage check
    this.registerCheck('local-storage', this.checkLocalStorage.bind(this));
    
    // Network connectivity check
    this.registerCheck('network', this.checkNetworkConnectivity.bind(this));
  }

  /**
   * Register a custom health check
   */
  registerCheck(name: string, checkFunction: () => Promise<HealthCheckResult>): void {
    this.checks.set(name, checkFunction);
  }

  /**
   * Remove a health check
   */
  unregisterCheck(name: string): void {
    this.checks.delete(name);
    this.lastResults.delete(name);
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<SystemHealth> {
    const results: HealthCheckResult[] = [];
    
    for (const [name, checkFn] of this.checks) {
      try {
        const result = await checkFn();
        results.push(result);
        this.lastResults.set(name, result);
      } catch (error) {
        const failedResult: HealthCheckResult = {
          name,
          status: 'unhealthy',
          responseTime: 0,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
        results.push(failedResult);
        this.lastResults.set(name, failedResult);
      }
    }

    const systemHealth = this.calculateOverallHealth(results);
    this.notifyListeners(systemHealth);
    
    return systemHealth;
  }

  /**
   * Run a specific health check
   */
  async runCheck(name: string): Promise<HealthCheckResult | null> {
    const checkFn = this.checks.get(name);
    if (!checkFn) return null;

    try {
      const result = await checkFn();
      this.lastResults.set(name, result);
      return result;
    } catch (error) {
      const failedResult: HealthCheckResult = {
        name,
        status: 'unhealthy',
        responseTime: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
      this.lastResults.set(name, failedResult);
      return failedResult;
    }
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(results: HealthCheckResult[]): SystemHealth {
    const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;
    
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    return {
      overall,
      checks: results,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || 'development',
      environment: import.meta.env.MODE,
    };
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      await this.runAllChecks();
    }, intervalMs);
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Add health status listener
   */
  addListener(listener: (health: SystemHealth) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove health status listener
   */
  removeListener(listener: (health: SystemHealth) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(health: SystemHealth): void {
    this.listeners.forEach(listener => {
      try {
        listener(health);
      } catch (error) {
        console.error('Health check listener error:', error);
      }
    });
  }

  /**
   * Get current health status
   */
  getCurrentHealth(): SystemHealth | null {
    if (this.lastResults.size === 0) return null;
    
    const results = Array.from(this.lastResults.values());
    return this.calculateOverallHealth(results);
  }

  /**
   * Individual health checks
   */
  
  private async checkAppReady(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check if essential DOM elements exist
      const hasRoot = !!document.getElementById('root');
      const hasRouter = !!document.querySelector('[data-testid="router"]') || window.location.pathname !== undefined;
      
      const responseTime = Date.now() - startTime;
      
      if (!hasRoot) {
        return {
          name: 'app-ready',
          status: 'unhealthy',
          responseTime,
          message: 'Root element not found',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        name: 'app-ready',
        status: 'healthy',
        responseTime,
        message: 'Application ready',
        details: { hasRoot, hasRouter },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'app-ready',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'App readiness check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkApiConnectivity(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Try to fetch a simple health endpoint or make a minimal API call
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000,
      } as any);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'api-connectivity',
          status: responseTime > this.thresholds.responseTime.critical ? 'degraded' : 'healthy',
          responseTime,
          message: 'API accessible',
          details: { status: response.status },
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          name: 'api-connectivity',
          status: 'degraded',
          responseTime,
          message: `API returned ${response.status}`,
          details: { status: response.status },
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        name: 'api-connectivity',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'API not accessible',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Try a simple database query via Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return {
          name: 'database',
          status: 'unhealthy',
          responseTime,
          message: `Database error: ${error.message}`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        name: 'database',
        status: responseTime > this.thresholds.responseTime.critical ? 'degraded' : 'healthy',
        responseTime,
        message: 'Database accessible',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkExternalServices(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const services = [];
    
    try {
      // Check Mapbox API (skip if no token to avoid auth errors)
      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      if (mapboxToken && mapboxToken !== 'your_mapbox_access_token_here' && mapboxToken !== 'your_actual_mapbox_token_here') {
        try {
          const mapboxResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${mapboxToken}`,
            { method: 'GET', timeout: 5000 } as any
          );
          services.push({ name: 'mapbox', status: mapboxResponse.ok });
        } catch {
          services.push({ name: 'mapbox', status: false });
        }
      } else {
        services.push({ name: 'mapbox', status: false });
      }

      // Check Paystack API
      try {
        const paystackResponse = await fetch('https://api.paystack.co/bank', {
          method: 'GET',
          timeout: 5000,
        } as any);
        services.push({ name: 'paystack', status: paystackResponse.ok });
      } catch {
        services.push({ name: 'paystack', status: false });
      }

      const responseTime = Date.now() - startTime;
      const failedServices = services.filter(s => !s.status);
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (failedServices.length === 0) {
        status = 'healthy';
      } else if (failedServices.length < services.length) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        name: 'external-services',
        status,
        responseTime,
        message: `${services.length - failedServices.length}/${services.length} services available`,
        details: { services },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'external-services',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'External services check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkBrowserApis(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    const apis = [
      { name: 'localStorage', available: typeof Storage !== 'undefined' && window.localStorage },
      { name: 'sessionStorage', available: typeof Storage !== 'undefined' && window.sessionStorage },
      { name: 'fetch', available: typeof fetch !== 'undefined' },
      { name: 'geolocation', available: 'geolocation' in navigator },
      { name: 'webgl', available: !!document.createElement('canvas').getContext('webgl') },
      { name: 'webWorker', available: typeof Worker !== 'undefined' },
      { name: 'indexedDB', available: 'indexedDB' in window },
    ];

    const responseTime = Date.now() - startTime;
    const unavailableApis = apis.filter(api => !api.available);
    
    return {
      name: 'browser-apis',
      status: unavailableApis.length === 0 ? 'healthy' : 'degraded',
      responseTime,
      message: `${apis.length - unavailableApis.length}/${apis.length} APIs available`,
      details: { apis },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkPerformance(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const memory = (performance as any).memory;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      let memoryStatus = 'healthy';
      if (memory) {
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (memoryUsage > this.thresholds.memoryUsage.critical) {
          memoryStatus = 'unhealthy';
        } else if (memoryUsage > this.thresholds.memoryUsage.warning) {
          memoryStatus = 'degraded';
        }
      }

      const responseTime = Date.now() - startTime;
      
      return {
        name: 'performance',
        status: memoryStatus as any,
        responseTime,
        message: 'Performance metrics collected',
        details: {
          memory: memory ? {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
          } : null,
          navigation: navigation ? {
            loadEventEnd: Math.round(navigation.loadEventEnd),
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd),
          } : null,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'performance',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: 'Performance check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkLocalStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const testKey = '__health_check_test__';
      const testValue = 'test';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const responseTime = Date.now() - startTime;
      
      if (retrieved === testValue) {
        return {
          name: 'local-storage',
          status: 'healthy',
          responseTime,
          message: 'Local storage functional',
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          name: 'local-storage',
          status: 'degraded',
          responseTime,
          message: 'Local storage test failed',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        name: 'local-storage',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Local storage unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async checkNetworkConnectivity(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const isOnline = navigator.onLine;
      const connection = (navigator as any).connection;
      
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'network',
        status: isOnline ? 'healthy' : 'unhealthy',
        responseTime,
        message: isOnline ? 'Network connected' : 'Network disconnected',
        details: {
          online: isOnline,
          connection: connection ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          } : null,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: 'network',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: 'Network check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Export health data for external monitoring
   */
  exportHealthData(): string {
    const health = this.getCurrentHealth();
    return JSON.stringify(health, null, 2);
  }

  /**
   * Update thresholds
   */
  updateThresholds(newThresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}

// Create singleton instance
export const healthCheckManager = new HealthCheckManager();

export default healthCheckManager;
