/**
 * Uptime Monitoring Service
 * Tracks application availability and generates uptime reports
 */

export interface UptimeEvent {
  id: string;
  type: 'up' | 'down' | 'degraded';
  timestamp: number;
  duration?: number; // Duration of the event in ms
  reason?: string;
  details?: Record<string, any>;
}

export interface UptimeMetrics {
  uptime: number; // Percentage (0-100)
  totalUptime: number; // Total uptime in ms
  totalDowntime: number; // Total downtime in ms
  incidents: number; // Number of incidents
  mtbf: number; // Mean Time Between Failures in ms
  mttr: number; // Mean Time To Recovery in ms
}

export interface UptimeReport {
  period: {
    start: number;
    end: number;
    duration: number;
  };
  metrics: UptimeMetrics;
  events: UptimeEvent[];
  sla: {
    target: number;
    actual: number;
    met: boolean;
  };
  availability: {
    daily: { date: string; uptime: number }[];
    hourly: { hour: number; uptime: number }[];
  };
}

export interface UptimeConfig {
  checkInterval: number; // How often to check (ms)
  healthTimeout: number; // Timeout for health checks (ms)
  slaTarget: number; // SLA target percentage (0-100)
  retentionDays: number; // How long to keep data (days)
  alertThresholds: {
    downtime: number; // Alert after X ms of downtime
    degraded: number; // Alert after X ms of degraded performance
  };
}

class UptimeMonitor {
  private events: UptimeEvent[] = [];
  private currentStatus: 'up' | 'down' | 'degraded' = 'up';
  private lastStatusChange = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private startTime = Date.now();
  private isMonitoring = false;
  private listeners: ((event: UptimeEvent) => void)[] = [];

  private config: UptimeConfig = {
    checkInterval: 30000, // 30 seconds
    healthTimeout: 10000, // 10 seconds
    slaTarget: 99.9, // 99.9% uptime
    retentionDays: 30,
    alertThresholds: {
      downtime: 60000, // 1 minute
      degraded: 300000, // 5 minutes
    },
  };

  constructor(config?: Partial<UptimeConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.setupVisibilityListener();
  }

  /**
   * Start uptime monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.recordEvent('up', 'Monitoring started');
    
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkInterval);

    console.log('Uptime monitoring started');
  }

  /**
   * Stop uptime monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.recordEvent('down', 'Monitoring stopped');
    console.log('Uptime monitoring stopped');
  }

  /**
   * Setup page visibility listener
   */
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - might indicate app issues
        this.recordEvent('degraded', 'Page hidden/backgrounded');
      } else {
        // Page is visible again
        this.recordEvent('up', 'Page visible again');
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      // Do not record a 'down' event that might trigger auto-recovery reloads
      this.recordEvent('degraded', 'Page unloading');
    });
  }

  /**
   * Perform application health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if the application is responsive
      const isResponsive = await this.checkApplicationResponsiveness();
      
      // Check if APIs are accessible
      const isApiHealthy = await this.checkApiHealth();
      
      // Check if critical features work
      const areCriticalFeaturesWorking = await this.checkCriticalFeatures();
      
      const responseTime = Date.now() - startTime;
      
      // Determine status based on checks
      let newStatus: 'up' | 'down' | 'degraded';
      
      if (!isResponsive || !areCriticalFeaturesWorking) {
        newStatus = 'down';
      } else if (!isApiHealthy || responseTime > this.config.healthTimeout) {
        newStatus = 'degraded';
      } else {
        newStatus = 'up';
      }

      // Record status change if different
      if (newStatus !== this.currentStatus) {
        this.handleStatusChange(newStatus, {
          responseTime,
          isResponsive,
          isApiHealthy,
          areCriticalFeaturesWorking,
        });
      }

    } catch (error) {
      this.handleStatusChange('down', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check if application is responsive
   */
  private async checkApplicationResponsiveness(): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      
      // Check if we can interact with the DOM
      try {
        const testElement = document.createElement('div');
        document.body.appendChild(testElement);
        document.body.removeChild(testElement);
        
        clearTimeout(timeout);
        resolve(true);
      } catch {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  /**
   * Check API health
   */
  private async checkApiHealth(): Promise<boolean> {
    try {
      // Try to access health check endpoint
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: this.config.healthTimeout,
      } as any);
      
      return response.ok;
    } catch {
      // If health endpoint doesn't exist, try a basic API call
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { error } = await supabase
          .from('properties')
          .select('id')
          .limit(1);
        
        return !error;
      } catch {
        return false;
      }
    }
  }

  /**
   * Check if critical features are working
   */
  private async checkCriticalFeatures(): Promise<boolean> {
    try {
      // Check if routing works
      const routingWorks = window.location.pathname !== undefined;
      
      // Check if localStorage works
      const storageWorks = this.testLocalStorage();
      
      // Check if essential DOM elements exist
      const domWorks = !!document.getElementById('root');
      
      return routingWorks && storageWorks && domWorks;
    } catch {
      return false;
    }
  }

  /**
   * Test localStorage functionality
   */
  private testLocalStorage(): boolean {
    try {
      const testKey = '__uptime_test__';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return value === 'test';
    } catch {
      return false;
    }
  }

  /**
   * Handle status change
   */
  private handleStatusChange(newStatus: 'up' | 'down' | 'degraded', details?: Record<string, any>): void {
    const now = Date.now();
    const duration = now - this.lastStatusChange;
    
    // Record the end of the previous status
    if (this.events.length > 0) {
      const lastEvent = this.events[this.events.length - 1];
      lastEvent.duration = duration;
    }

    // Record the new status
    this.recordEvent(newStatus, `Status changed from ${this.currentStatus} to ${newStatus}`, details);
    
    this.currentStatus = newStatus;
    this.lastStatusChange = now;

    // Check if we need to send alerts
    this.checkForAlerts(newStatus, duration);
  }

  /**
   * Record an uptime event
   */
  private recordEvent(type: 'up' | 'down' | 'degraded', reason?: string, details?: Record<string, any>): void {
    const event: UptimeEvent = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      reason,
      details,
    };

    this.events.push(event);
    
    // Clean up old events
    this.cleanupOldEvents();
    
    // Notify listeners
    this.notifyListeners(event);
    
    console.log('Uptime event recorded:', event);
  }

  /**
   * Check if alerts should be triggered
   */
  private checkForAlerts(status: 'up' | 'down' | 'degraded', duration: number): void {
    if (status === 'down' && duration >= this.config.alertThresholds.downtime) {
      this.sendAlert('critical', `Application has been down for ${Math.round(duration / 1000)} seconds`);
    } else if (status === 'degraded' && duration >= this.config.alertThresholds.degraded) {
      this.sendAlert('warning', `Application has been degraded for ${Math.round(duration / 60000)} minutes`);
    }
  }

  /**
   * Send uptime alert
   */
  private async sendAlert(severity: 'warning' | 'critical', message: string): Promise<void> {
    console.warn(`Uptime Alert [${severity}]:`, message);
    
    try {
      // Send to external monitoring service
      if (import.meta.env.MODE === 'production') {
        // Example: Send to monitoring endpoint
        /*
        await fetch('/api/uptime-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            severity,
            message,
            timestamp: Date.now(),
            status: this.currentStatus,
          }),
        });
        */
      }

      // Send to Google Analytics
      if (window.gtag) {
        window.gtag('event', 'uptime_alert', {
          severity,
          status: this.currentStatus,
          custom_parameters: { message },
        });
      }
    } catch (error) {
      console.error('Failed to send uptime alert:', error);
    }
  }

  /**
   * Clean up old events
   */
  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > cutoffTime);
  }

  /**
   * Calculate uptime metrics for a period
   */
  private calculateMetrics(startTime: number, endTime: number): UptimeMetrics {
    const relevantEvents = this.events.filter(
      event => event.timestamp >= startTime && event.timestamp <= endTime
    );

    let totalUptime = 0;
    let totalDowntime = 0;
    let incidents = 0;
    const failureTimes: number[] = [];
    const recoveryTimes: number[] = [];

    for (let i = 0; i < relevantEvents.length; i++) {
      const event = relevantEvents[i];
      const nextEvent = relevantEvents[i + 1];
      
      const duration = event.duration || (nextEvent ? nextEvent.timestamp - event.timestamp : endTime - event.timestamp);

      if (event.type === 'up') {
        totalUptime += duration;
      } else {
        totalDowntime += duration;
        if (event.type === 'down') {
          incidents++;
          failureTimes.push(event.timestamp);
          
          // Find recovery time
          const recoveryEvent = relevantEvents.slice(i + 1).find(e => e.type === 'up');
          if (recoveryEvent) {
            recoveryTimes.push(recoveryEvent.timestamp - event.timestamp);
          }
        }
      }
    }

    const totalTime = endTime - startTime;
    const uptime = totalTime > 0 ? (totalUptime / totalTime) * 100 : 100;

    // Calculate MTBF (Mean Time Between Failures)
    const mtbf = incidents > 1 ? totalUptime / (incidents - 1) : totalUptime;

    // Calculate MTTR (Mean Time To Recovery)
    const mttr = recoveryTimes.length > 0 
      ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length 
      : 0;

    return {
      uptime,
      totalUptime,
      totalDowntime,
      incidents,
      mtbf,
      mttr,
    };
  }

  /**
   * Generate uptime report for a period
   */
  generateReport(startTime?: number, endTime?: number): UptimeReport {
    const now = Date.now();
    const start = startTime || this.startTime;
    const end = endTime || now;
    
    const metrics = this.calculateMetrics(start, end);
    const events = this.events.filter(
      event => event.timestamp >= start && event.timestamp <= end
    );

    // Calculate daily availability
    const daily: { date: string; uptime: number }[] = [];
    const dailyMs = 24 * 60 * 60 * 1000;
    
    for (let day = start; day < end; day += dailyMs) {
      const dayEnd = Math.min(day + dailyMs, end);
      const dayMetrics = this.calculateMetrics(day, dayEnd);
      daily.push({
        date: new Date(day).toISOString().split('T')[0],
        uptime: dayMetrics.uptime,
      });
    }

    // Calculate hourly availability for the last 24 hours
    const hourly: { hour: number; uptime: number }[] = [];
    const hourMs = 60 * 60 * 1000;
    const last24h = Math.max(start, end - (24 * hourMs));
    
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = last24h + (hour * hourMs);
      const hourEnd = hourStart + hourMs;
      
      if (hourStart < end) {
        const hourMetrics = this.calculateMetrics(hourStart, Math.min(hourEnd, end));
        hourly.push({
          hour,
          uptime: hourMetrics.uptime,
        });
      }
    }

    return {
      period: {
        start,
        end,
        duration: end - start,
      },
      metrics,
      events,
      sla: {
        target: this.config.slaTarget,
        actual: metrics.uptime,
        met: metrics.uptime >= this.config.slaTarget,
      },
      availability: {
        daily,
        hourly,
      },
    };
  }

  /**
   * Get current status
   */
  getCurrentStatus(): 'up' | 'down' | 'degraded' {
    return this.currentStatus;
  }

  /**
   * Get current uptime percentage
   */
  getCurrentUptime(): number {
    const report = this.generateReport();
    return report.metrics.uptime;
  }

  /**
   * Add event listener
   */
  addListener(listener: (event: UptimeEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: (event: UptimeEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: UptimeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Uptime listener error:', error);
      }
    });
  }

  /**
   * Export uptime data
   */
  exportData(): string {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<UptimeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new config
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}

// Create singleton instance
export const uptimeMonitor = new UptimeMonitor();

export default uptimeMonitor;
