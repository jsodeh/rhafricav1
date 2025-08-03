/**
 * Comprehensive error logging and monitoring service
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  buildVersion?: string;
  environment?: string;
  [key: string]: any;
}

export interface ErrorEvent {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  error?: Error;
  stack?: string;
  context: ErrorContext;
  fingerprint?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface ErrorFilter {
  level?: ErrorEvent['level'][];
  timeRange?: { start: Date; end: Date };
  userId?: string;
  tags?: Record<string, string>;
}

export interface ErrorStats {
  total: number;
  byLevel: Record<ErrorEvent['level'], number>;
  topErrors: Array<{ message: string; count: number; lastSeen: string }>;
  errorRate: number;
  userAffected: number;
}

class ErrorLoggingService {
  private errors: ErrorEvent[] = [];
  private maxErrors = 1000; // Keep last 1000 errors in memory
  private sessionId: string;
  private buildVersion: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.buildVersion = import.meta.env.VITE_APP_VERSION || 'development';
    this.setupGlobalErrorHandlers();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('Uncaught Error', {
        error: event.error,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });

    // Catch network errors
    window.addEventListener('online', () => {
      this.logInfo('Network connection restored');
    });

    window.addEventListener('offline', () => {
      this.logWarning('Network connection lost');
    });
  }

  /**
   * Get current context information
   */
  private getContext(additionalContext?: Partial<ErrorContext>): ErrorContext {
    return {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      buildVersion: this.buildVersion,
      environment: import.meta.env.MODE,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      platform: navigator.platform,
      ...additionalContext,
    };
  }

  /**
   * Generate error fingerprint for deduplication
   */
  private generateFingerprint(message: string, stack?: string): string {
    const content = stack || message;
    // Simple hash function for fingerprinting
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Add error to storage
   */
  private addError(errorEvent: ErrorEvent): void {
    this.errors.unshift(errorEvent);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Send to external service in production
    this.sendToExternalService(errorEvent);
  }

  /**
   * Send error to external monitoring service
   */
  private async sendToExternalService(errorEvent: ErrorEvent): Promise<void> {
    // Skip in development
    if (import.meta.env.MODE === 'development') {
      console.error('[Error Logging]', errorEvent);
      return;
    }

    try {
      // In a real implementation, send to services like:
      // - Sentry
      // - LogRocket
      // - Datadog
      // - Custom logging endpoint
      
      // Example for custom endpoint:
      /*
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEvent),
      });
      */
      
      // Example for Google Analytics 4 (error events)
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: errorEvent.message,
          fatal: errorEvent.level === 'critical',
          custom_parameters: {
            error_id: errorEvent.id,
            level: errorEvent.level,
            fingerprint: errorEvent.fingerprint,
          },
        });
      }
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }

  /**
   * Log info level event
   */
  logInfo(message: string, context?: Partial<ErrorContext>): void {
    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      level: 'info',
      message,
      context: this.getContext(context),
      fingerprint: this.generateFingerprint(message),
      tags: { level: 'info' },
    };

    this.addError(errorEvent);
  }

  /**
   * Log warning level event
   */
  logWarning(message: string, context?: Partial<ErrorContext>): void {
    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      level: 'warning',
      message,
      context: this.getContext(context),
      fingerprint: this.generateFingerprint(message),
      tags: { level: 'warning' },
    };

    this.addError(errorEvent);
  }

  /**
   * Log error level event
   */
  logError(message: string, context?: Partial<ErrorContext> & { error?: Error }): void {
    const { error, ...restContext } = context || {};
    
    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      level: 'error',
      message,
      error,
      stack: error?.stack,
      context: this.getContext(restContext),
      fingerprint: this.generateFingerprint(message, error?.stack),
      tags: { level: 'error' },
      extra: { errorName: error?.name },
    };

    this.addError(errorEvent);
  }

  /**
   * Log critical level event
   */
  logCritical(message: string, context?: Partial<ErrorContext> & { error?: Error }): void {
    const { error, ...restContext } = context || {};
    
    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      level: 'critical',
      message,
      error,
      stack: error?.stack,
      context: this.getContext(restContext),
      fingerprint: this.generateFingerprint(message, error?.stack),
      tags: { level: 'critical' },
      extra: { errorName: error?.name },
    };

    this.addError(errorEvent);
  }

  /**
   * Log API error
   */
  logApiError(endpoint: string, status: number, response?: any, context?: Partial<ErrorContext>): void {
    this.logError(`API Error: ${endpoint}`, {
      ...context,
      endpoint,
      status,
      response: typeof response === 'string' ? response : JSON.stringify(response),
      tags: { type: 'api_error', endpoint, status: status.toString() },
    });
  }

  /**
   * Log performance issue
   */
  logPerformance(metric: string, value: number, threshold: number, context?: Partial<ErrorContext>): void {
    if (value > threshold) {
      this.logWarning(`Performance Issue: ${metric}`, {
        ...context,
        metric,
        value,
        threshold,
        tags: { type: 'performance', metric },
      });
    }
  }

  /**
   * Log user action for debugging
   */
  logUserAction(action: string, context?: Partial<ErrorContext>): void {
    this.logInfo(`User Action: ${action}`, {
      ...context,
      tags: { type: 'user_action', action },
    });
  }

  /**
   * Get filtered errors
   */
  getErrors(filter?: ErrorFilter): ErrorEvent[] {
    let filteredErrors = [...this.errors];

    if (filter?.level) {
      filteredErrors = filteredErrors.filter(error => 
        filter.level!.includes(error.level)
      );
    }

    if (filter?.timeRange) {
      filteredErrors = filteredErrors.filter(error => {
        const errorTime = new Date(error.context.timestamp!);
        return errorTime >= filter.timeRange!.start && errorTime <= filter.timeRange!.end;
      });
    }

    if (filter?.userId) {
      filteredErrors = filteredErrors.filter(error => 
        error.context.userId === filter.userId
      );
    }

    if (filter?.tags) {
      filteredErrors = filteredErrors.filter(error =>
        Object.entries(filter.tags!).every(([key, value]) =>
          error.tags?.[key] === value
        )
      );
    }

    return filteredErrors;
  }

  /**
   * Get error statistics
   */
  getStats(filter?: ErrorFilter): ErrorStats {
    const errors = this.getErrors(filter);
    
    const byLevel = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    };

    const errorCounts = new Map<string, number>();
    const userIds = new Set<string>();

    errors.forEach(error => {
      byLevel[error.level]++;
      
      const key = error.fingerprint || error.message;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
      
      if (error.context.userId) {
        userIds.add(error.context.userId);
      }
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({
        message,
        count,
        lastSeen: errors.find(e => (e.fingerprint || e.message) === message)?.context.timestamp || '',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalTimeHours = filter?.timeRange 
      ? (filter.timeRange.end.getTime() - filter.timeRange.start.getTime()) / (1000 * 60 * 60)
      : 24; // Default to last 24 hours

    return {
      total: errors.length,
      byLevel,
      topErrors,
      errorRate: errors.length / totalTimeHours,
      userAffected: userIds.size,
    };
  }

  /**
   * Clear all stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Export errors for analysis
   */
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'level', 'message', 'timestamp', 'url', 'userAgent'];
      const rows = this.errors.map(error => [
        error.id,
        error.level,
        error.message,
        error.context.timestamp,
        error.context.url,
        error.context.userAgent,
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.errors, null, 2);
  }
}

// Create singleton instance
export const errorLogger = new ErrorLoggingService();

// Convenience functions
export const logInfo = (message: string, context?: Partial<ErrorContext>) => 
  errorLogger.logInfo(message, context);

export const logWarning = (message: string, context?: Partial<ErrorContext>) => 
  errorLogger.logWarning(message, context);

export const logError = (message: string, context?: Partial<ErrorContext> & { error?: Error }) => 
  errorLogger.logError(message, context);

export const logCritical = (message: string, context?: Partial<ErrorContext> & { error?: Error }) => 
  errorLogger.logCritical(message, context);

export const logApiError = (endpoint: string, status: number, response?: any, context?: Partial<ErrorContext>) =>
  errorLogger.logApiError(endpoint, status, response, context);

export const logPerformance = (metric: string, value: number, threshold: number, context?: Partial<ErrorContext>) =>
  errorLogger.logPerformance(metric, value, threshold, context);

export const logUserAction = (action: string, context?: Partial<ErrorContext>) =>
  errorLogger.logUserAction(action, context);

// React hook for error logging
export function useErrorLogger() {
  return {
    logInfo,
    logWarning,
    logError,
    logCritical,
    logApiError,
    logPerformance,
    logUserAction,
    getErrors: (filter?: ErrorFilter) => errorLogger.getErrors(filter),
    getStats: (filter?: ErrorFilter) => errorLogger.getStats(filter),
  };
}

export default errorLogger;
