/**
 * Comprehensive Alerting System
 * Handles alerts from monitoring systems with multiple notification channels
 */

export interface Alert {
  id: string;
  type: 'performance' | 'uptime' | 'error' | 'security' | 'health' | 'custom';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  source: string; // Which system generated the alert
  timestamp: number;
  data?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  channels?: AlertChannel[];
  tags?: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  condition: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
    threshold: number;
    duration?: number; // How long condition must be true (ms)
  };
  severity: Alert['severity'];
  channels: AlertChannel[];
  cooldown?: number; // Minimum time between alerts (ms)
  enabled: boolean;
  tags?: string[];
}

export type AlertChannel = 
  | 'console'
  | 'toast'
  | 'browser-notification'
  | 'email'
  | 'webhook'
  | 'analytics'
  | 'local-storage';

export interface AlertingConfig {
  maxAlerts: number;
  retentionHours: number;
  defaultChannels: AlertChannel[];
  enableBrowserNotifications: boolean;
  enableToastNotifications: boolean;
  webhookUrl?: string;
  emailEndpoint?: string;
}

export interface AlertStats {
  total: number;
  byType: Record<Alert['type'], number>;
  bySeverity: Record<Alert['severity'], number>;
  resolved: number;
  unresolved: number;
  avgResolutionTime: number;
}

class AlertingSystem {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private listeners: ((alert: Alert) => void)[] = [];
  private conditionTracking = new Map<string, { startTime: number; value: number }>();
  private lastAlertTime = new Map<string, number>();

  private config: AlertingConfig = {
    maxAlerts: 1000,
    retentionHours: 24,
    defaultChannels: ['console', 'toast'],
    enableBrowserNotifications: false,
    enableToastNotifications: true,
  };

  constructor(config?: Partial<AlertingConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    this.setupDefaultRules();
    this.requestNotificationPermission();
  }

  /**
   * Setup default alerting rules
   */
  private setupDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        type: 'error',
        condition: {
          metric: 'errorRate',
          operator: '>',
          threshold: 5, // 5%
          duration: 60000, // 1 minute
        },
        severity: 'critical',
        channels: ['console', 'toast', 'browser-notification'],
        cooldown: 300000, // 5 minutes
        enabled: true,
        tags: ['error', 'critical'],
      },
      {
        id: 'poor-performance',
        name: 'Poor Performance',
        type: 'performance',
        condition: {
          metric: 'lcp',
          operator: '>',
          threshold: 4000, // 4 seconds
          duration: 30000, // 30 seconds
        },
        severity: 'warning',
        channels: ['console', 'analytics'],
        cooldown: 600000, // 10 minutes
        enabled: true,
        tags: ['performance', 'web-vitals'],
      },
      {
        id: 'application-down',
        name: 'Application Down',
        type: 'uptime',
        condition: {
          metric: 'status',
          operator: '=',
          threshold: 0, // 0 = down
          duration: 60000, // 1 minute
        },
        severity: 'emergency',
        channels: ['console', 'toast', 'browser-notification', 'webhook'],
        cooldown: 60000, // 1 minute
        enabled: true,
        tags: ['uptime', 'critical'],
      },
      {
        id: 'memory-usage-high',
        name: 'High Memory Usage',
        type: 'performance',
        condition: {
          metric: 'memoryUsage',
          operator: '>',
          threshold: 80, // 80MB
          duration: 120000, // 2 minutes
        },
        severity: 'warning',
        channels: ['console'],
        cooldown: 900000, // 15 minutes
        enabled: true,
        tags: ['memory', 'performance'],
      },
      {
        id: 'api-slow-response',
        name: 'Slow API Response',
        type: 'performance',
        condition: {
          metric: 'apiResponseTime',
          operator: '>',
          threshold: 2000, // 2 seconds
          duration: 60000, // 1 minute
        },
        severity: 'warning',
        channels: ['console', 'analytics'],
        cooldown: 300000, // 5 minutes
        enabled: true,
        tags: ['api', 'performance'],
      }
    ];

    this.rules.push(...defaultRules);
  }

  /**
   * Request browser notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && this.config.enableBrowserNotifications) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }

  /**
   * Create and send an alert
   */
  createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    message: string,
    source: string,
    data?: Record<string, any>,
    channels?: AlertChannel[]
  ): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      source,
      timestamp: Date.now(),
      data,
      channels: channels || this.config.defaultChannels,
      resolved: false,
    };

    this.addAlert(alert);
    return alert;
  }

  /**
   * Add alert to the system
   */
  private addAlert(alert: Alert): void {
    // Add to alerts list
    this.alerts.unshift(alert);
    
    // Clean up old alerts
    this.cleanupAlerts();
    
    // Send alert through channels
    this.sendAlert(alert);
    
    // Notify listeners
    this.notifyListeners(alert);
    
    console.log('Alert created:', alert);
  }

  /**
   * Send alert through specified channels
   */
  private async sendAlert(alert: Alert): Promise<void> {
    const channels = alert.channels || this.config.defaultChannels;
    
    await Promise.all(channels.map(channel => this.sendToChannel(alert, channel)));
  }

  /**
   * Send alert to a specific channel
   */
  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    try {
      switch (channel) {
        case 'console':
          this.sendToConsole(alert);
          break;
        case 'toast':
          await this.sendToToast(alert);
          break;
        case 'browser-notification':
          await this.sendToBrowserNotification(alert);
          break;
        case 'webhook':
          await this.sendToWebhook(alert);
          break;
        case 'email':
          await this.sendToEmail(alert);
          break;
        case 'analytics':
          await this.sendToAnalytics(alert);
          break;
        case 'local-storage':
          this.sendToLocalStorage(alert);
          break;
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel}:`, error);
    }
  }

  /**
   * Send alert to console
   */
  private sendToConsole(alert: Alert): void {
    const logLevel = {
      info: 'info',
      warning: 'warn',
      critical: 'error',
      emergency: 'error',
    }[alert.severity] as 'info' | 'warn' | 'error';

    console[logLevel](`[ALERT ${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`, alert);
  }

  /**
   * Send alert to toast notification
   */
  private async sendToToast(alert: Alert): Promise<void> {
    if (!this.config.enableToastNotifications) return;
    
    // Dynamic import to avoid bundling if not used
    const { toast } = await import('sonner');
    
    const options = {
      duration: alert.severity === 'emergency' ? Infinity : 5000,
      action: alert.severity === 'critical' || alert.severity === 'emergency' ? {
        label: 'Resolve',
        onClick: () => this.resolveAlert(alert.id, 'user'),
      } : undefined,
    };

    switch (alert.severity) {
      case 'emergency':
      case 'critical':
        toast.error(alert.message, options);
        break;
      case 'warning':
        toast.warning(alert.message, options);
        break;
      default:
        toast.info(alert.message, options);
    }
  }

  /**
   * Send alert to browser notification
   */
  private async sendToBrowserNotification(alert: Alert): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${alert.title}`, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id,
        requireInteraction: alert.severity === 'emergency',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds for non-emergency alerts
      if (alert.severity !== 'emergency') {
        setTimeout(() => notification.close(), 10000);
      }
    }
  }

  /**
   * Send alert to webhook
   */
  private async sendToWebhook(alert: Alert): Promise<void> {
    if (!this.config.webhookUrl) return;

    await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert,
        timestamp: new Date().toISOString(),
        app: 'real-estate-hotspot',
      }),
    });
  }

  /**
   * Send alert to email
   */
  private async sendToEmail(alert: Alert): Promise<void> {
    if (!this.config.emailEndpoint) return;

    await fetch(this.config.emailEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'alerts@realestatehotspot.com',
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        body: `
Alert Details:
- Type: ${alert.type}
- Severity: ${alert.severity}
- Source: ${alert.source}
- Time: ${new Date(alert.timestamp).toISOString()}
- Message: ${alert.message}

${alert.data ? `Data: ${JSON.stringify(alert.data, null, 2)}` : ''}
        `,
      }),
    });
  }

  /**
   * Send alert to analytics
   */
  private async sendToAnalytics(alert: Alert): Promise<void> {
    if (window.gtag) {
      window.gtag('event', 'alert_triggered', {
        alert_type: alert.type,
        alert_severity: alert.severity,
        alert_source: alert.source,
        custom_parameters: {
          alert_id: alert.id,
          alert_title: alert.title,
        },
      });
    }
  }

  /**
   * Send alert to local storage
   */
  private sendToLocalStorage(alert: Alert): void {
    try {
      const storedAlerts = JSON.parse(localStorage.getItem('monitoring_alerts') || '[]');
      storedAlerts.unshift(alert);
      
      // Keep only last 50 alerts in storage
      if (storedAlerts.length > 50) {
        storedAlerts.splice(50);
      }
      
      localStorage.setItem('monitoring_alerts', JSON.stringify(storedAlerts));
    } catch (error) {
      console.error('Failed to store alert in localStorage:', error);
    }
  }

  /**
   * Check metric against rules
   */
  checkMetric(metric: string, value: number): void {
    const relevantRules = this.rules.filter(rule => 
      rule.enabled && rule.condition.metric === metric
    );

    relevantRules.forEach(rule => this.evaluateRule(rule, value));
  }

  /**
   * Evaluate a rule against a metric value
   */
  private evaluateRule(rule: AlertRule, value: number): void {
    const conditionMet = this.evaluateCondition(rule.condition, value);
    const trackingKey = `${rule.id}-${rule.condition.metric}`;
    
    if (conditionMet) {
      // Start tracking or continue tracking
      if (!this.conditionTracking.has(trackingKey)) {
        this.conditionTracking.set(trackingKey, {
          startTime: Date.now(),
          value,
        });
      }
      
      const tracking = this.conditionTracking.get(trackingKey)!;
      const duration = Date.now() - tracking.startTime;
      
      // Check if duration threshold is met
      if (!rule.condition.duration || duration >= rule.condition.duration) {
        // Check cooldown
        const lastAlertTime = this.lastAlertTime.get(rule.id) || 0;
        const cooldown = rule.cooldown || 0;
        
        if (Date.now() - lastAlertTime >= cooldown) {
          this.createAlert(
            rule.type,
            rule.severity,
            rule.name,
            `${rule.condition.metric} is ${value} (threshold: ${rule.condition.threshold})`,
            `rule:${rule.id}`,
            {
              metric: rule.condition.metric,
              value,
              threshold: rule.condition.threshold,
              duration,
              ruleId: rule.id,
            },
            rule.channels
          );
          
          this.lastAlertTime.set(rule.id, Date.now());
        }
      }
    } else {
      // Condition not met, clear tracking
      this.conditionTracking.delete(trackingKey);
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: AlertRule['condition'], value: number): boolean {
    switch (condition.operator) {
      case '>':
        return value > condition.threshold;
      case '<':
        return value < condition.threshold;
      case '>=':
        return value >= condition.threshold;
      case '<=':
        return value <= condition.threshold;
      case '=':
        return value === condition.threshold;
      case '!=':
        return value !== condition.threshold;
      default:
        return false;
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy: string = 'system'): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.resolved) return false;

    alert.resolved = true;
    alert.resolvedAt = Date.now();
    alert.resolvedBy = resolvedBy;

    console.log('Alert resolved:', alert);
    return true;
  }

  /**
   * Add alerting rule
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove alerting rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    return true;
  }

  /**
   * Update alerting rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    return true;
  }

  /**
   * Get all alerts
   */
  getAlerts(filter?: {
    type?: Alert['type'];
    severity?: Alert['severity'];
    resolved?: boolean;
    limit?: number;
  }): Alert[] {
    let filtered = [...this.alerts];

    if (filter) {
      if (filter.type) filtered = filtered.filter(a => a.type === filter.type);
      if (filter.severity) filtered = filtered.filter(a => a.severity === filter.severity);
      if (filter.resolved !== undefined) filtered = filtered.filter(a => a.resolved === filter.resolved);
      if (filter.limit) filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  /**
   * Get alert statistics
   */
  getStats(): AlertStats {
    const total = this.alerts.length;
    const resolved = this.alerts.filter(a => a.resolved).length;
    const unresolved = total - resolved;

    const byType = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<Alert['type'], number>);

    const bySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<Alert['severity'], number>);

    const resolvedAlerts = this.alerts.filter(a => a.resolved && a.resolvedAt);
    const avgResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, alert) => sum + (alert.resolvedAt! - alert.timestamp), 0) / resolvedAlerts.length
      : 0;

    return {
      total,
      byType,
      bySeverity,
      resolved,
      unresolved,
      avgResolutionTime,
    };
  }

  /**
   * Clean up old alerts
   */
  private cleanupAlerts(): void {
    const cutoffTime = Date.now() - (this.config.retentionHours * 60 * 60 * 1000);
    
    // Remove old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime);
    
    // Limit total alerts
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.config.maxAlerts);
    }
  }

  /**
   * Add alert listener
   */
  addListener(listener: (alert: Alert) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove alert listener
   */
  removeListener(listener: (alert: Alert) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(alert: Alert): void {
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Alert listener error:', error);
      }
    });
  }

  /**
   * Export alerts data
   */
  exportData(): string {
    return JSON.stringify({
      alerts: this.alerts,
      rules: this.rules,
      stats: this.getStats(),
    }, null, 2);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AlertingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const alertingSystem = new AlertingSystem();

export default alertingSystem;
