/**
 * Advanced Error Management System
 * Provides centralized error handling, categorization, and recovery
 */

import { logError, logCritical, logWarning } from './errorLogging';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  timestamp?: string;
  userAgent?: string;
  buildVersion?: string;
  [key: string]: any;
}

export interface ErrorRecoveryAction {
  type: 'retry' | 'reload' | 'redirect' | 'fallback' | 'custom';
  label: string;
  action: () => void | Promise<void>;
  priority: 'primary' | 'secondary';
}

export interface ProcessedError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  recoveryActions: ErrorRecoveryAction[];
  context: ErrorContext;
  timestamp: string;
  fingerprint: string;
}

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  CLIENT_ERROR = 'client_error',
  PAYMENT = 'payment',
  UPLOAD = 'upload',
  TIMEOUT = 'timeout',
  QUOTA_EXCEEDED = 'quota_exceeded',
  MAINTENANCE = 'maintenance',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

class ErrorManager {
  private static instance: ErrorManager;
  private errorQueue: ProcessedError[] = [];
  private maxQueueSize = 100;
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;
  private errorDeduplication = new Map<string, number>();
  private deduplicationWindow = 5000; // 5 seconds

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        component: 'Global',
        action: 'unhandledrejection',
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        component: 'Global',
        action: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle fetch errors
    this.interceptFetchErrors();
  }

  /**
   * Intercept fetch errors for better error handling
   */
  private interceptFetchErrors(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const url = args[0]?.toString() || '';
          const isHealthCheck = url.includes('api.mapbox.com') || url.includes('api.paystack.co');

          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          (error as any).response = response;
          (error as any).status = response.status;

          // Don't show user notifications for health check failures
          if (!isHealthCheck) {
            this.handleError(error, {
              component: 'Fetch',
              action: 'http_request',
              url,
              status: response.status,
            });
          }
        }
        
        return response;
      } catch (error) {
        this.handleError(error, {
          component: 'Fetch',
          action: 'network_error',
          url: args[0]?.toString(),
        });
        throw error;
      }
    };
  }

  /**
   * Main error handling method
   */
  handleError(error: Error | unknown, context: Partial<ErrorContext> = {}): ProcessedError {
    const processedError = this.processError(error, context);

    // Check for duplicate errors to prevent notification spam
    const errorKey = `${processedError.type}_${processedError.message}_${context.url || ''}`;
    const now = Date.now();
    const lastOccurrence = this.errorDeduplication.get(errorKey);

    if (lastOccurrence && (now - lastOccurrence) < this.deduplicationWindow) {
      // Skip notification for duplicate error within time window
      return processedError;
    }

    this.errorDeduplication.set(errorKey, now);

    // Clean up old entries
    for (const [key, timestamp] of this.errorDeduplication.entries()) {
      if (now - timestamp > this.deduplicationWindow) {
        this.errorDeduplication.delete(key);
      }
    }

    // Add to queue
    this.addToQueue(processedError);

    // Log to external services
    this.logError(processedError);

    // Trigger recovery if applicable
    this.triggerAutoRecovery(processedError);

    return processedError;
  }

  /**
   * Process raw error into structured format
   */
  private processError(error: Error | unknown, context: Partial<ErrorContext>): ProcessedError {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorType = this.categorizeError(errorObj, context);
    const severity = this.determineSeverity(errorType, errorObj);
    
    const processedError: ProcessedError = {
      id: this.generateErrorId(),
      type: errorType,
      severity,
      message: errorObj.message,
      userMessage: this.generateUserMessage(errorType, errorObj),
      technicalDetails: this.extractTechnicalDetails(errorObj),
      recoveryActions: this.generateRecoveryActions(errorType, errorObj, context),
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        route: window.location.pathname,
        buildVersion: import.meta.env.VITE_APP_VERSION || 'development',
      },
      timestamp: new Date().toISOString(),
      fingerprint: this.generateFingerprint(errorObj, context),
    };

    return processedError;
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: Error, context: Partial<ErrorContext>): ErrorType {
    const message = error.message.toLowerCase();
    const status = (error as any).status;

    // Network errors
    if (message.includes('fetch') || message.includes('network') || status === 0) {
      return ErrorType.NETWORK;
    }

    // HTTP status codes
    if (status) {
      if (status === 401) return ErrorType.AUTHENTICATION;
      if (status === 403) return ErrorType.AUTHORIZATION;
      if (status === 404) return ErrorType.NOT_FOUND;
      if (status === 408 || status === 504) return ErrorType.TIMEOUT;
      if (status === 429) return ErrorType.QUOTA_EXCEEDED;
      if (status === 503) return ErrorType.MAINTENANCE;
      if (status >= 400 && status < 500) return ErrorType.CLIENT_ERROR;
      if (status >= 500) return ErrorType.SERVER_ERROR;
    }

    // Payment errors
    if (message.includes('payment') || message.includes('paystack') || context.component?.includes('payment')) {
      return ErrorType.PAYMENT;
    }

    // Upload errors
    if (message.includes('upload') || message.includes('file')) {
      return ErrorType.UPLOAD;
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorType.VALIDATION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(type: ErrorType, error: Error): ErrorSeverity {
    // Critical errors
    if ([ErrorType.SERVER_ERROR, ErrorType.MAINTENANCE].includes(type)) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if ([ErrorType.AUTHENTICATION, ErrorType.AUTHORIZATION, ErrorType.PAYMENT].includes(type)) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if ([ErrorType.NETWORK, ErrorType.NOT_FOUND, ErrorType.TIMEOUT].includes(type)) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors
    return ErrorSeverity.LOW;
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(type: ErrorType, error: Error): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: "We're having trouble connecting. Please check your internet connection and try again.",
      [ErrorType.AUTHENTICATION]: "Please log in to continue. Your session may have expired.",
      [ErrorType.AUTHORIZATION]: "You don't have permission to access this resource.",
      [ErrorType.VALIDATION]: "Please check your input and try again.",
      [ErrorType.NOT_FOUND]: "The requested page or resource was not found.",
      [ErrorType.SERVER_ERROR]: "We're experiencing technical difficulties. Please try again later.",
      [ErrorType.CLIENT_ERROR]: "There was an issue with your request. Please try again.",
      [ErrorType.PAYMENT]: "There was an issue processing your payment. Please check your details and try again.",
      [ErrorType.UPLOAD]: "There was an issue uploading your file. Please try again with a different file.",
      [ErrorType.TIMEOUT]: "The request timed out. Please try again.",
      [ErrorType.QUOTA_EXCEEDED]: "You've exceeded the rate limit. Please wait a moment and try again.",
      [ErrorType.MAINTENANCE]: "The service is temporarily unavailable for maintenance. Please try again later.",
      [ErrorType.UNKNOWN]: "An unexpected error occurred. Please try again.",
    };

    return messages[type] || messages[ErrorType.UNKNOWN];
  }

  /**
   * Extract technical details from error
   */
  private extractTechnicalDetails(error: Error): string {
    const details: string[] = [];
    
    if (error.name) details.push(`Type: ${error.name}`);
    if (error.stack) details.push(`Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    if ((error as any).status) details.push(`Status: ${(error as any).status}`);
    if ((error as any).code) details.push(`Code: ${(error as any).code}`);
    
    return details.join('\n');
  }

  /**
   * Generate recovery actions
   */
  private generateRecoveryActions(
    type: ErrorType, 
    error: Error, 
    context: Partial<ErrorContext>
  ): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    switch (type) {
      case ErrorType.NETWORK:
        actions.push({
          type: 'retry',
          label: 'Try Again',
          action: () => {/* noop to avoid reload loops */},
          priority: 'primary',
        });
        break;

      case ErrorType.AUTHENTICATION:
        actions.push({
          type: 'redirect',
          label: 'Sign In',
          action: () => { window.location.href = '/login'; },
          priority: 'primary',
        });
        break;

      case ErrorType.NOT_FOUND:
        actions.push({
          type: 'redirect',
          label: 'Go Home',
          action: () => { window.location.href = '/'; },
          priority: 'primary',
        });
        break;

      case ErrorType.SERVER_ERROR:
      case ErrorType.TIMEOUT:
        actions.push({
          type: 'retry',
          label: 'Retry',
          action: () => this.retryLastAction(error),
          priority: 'primary',
        });
        // Avoid auto-refresh loops; keep manual navigation only
        break;

      case ErrorType.PAYMENT:
        actions.push({
          type: 'retry',
          label: 'Try Payment Again',
          action: () => this.retryPayment(context),
          priority: 'primary',
        });
        actions.push({
          type: 'redirect',
          label: 'Contact Support',
          action: () => { window.location.href = '/help'; },
          priority: 'secondary',
        });
        break;

      default:
        actions.push({
          type: 'reload',
          label: 'Refresh',
          action: () => window.location.reload(),
          priority: 'primary',
        });
    }

    // Always add go home option
    if (!actions.some(a => a.type === 'redirect' && a.label.includes('Home'))) {
      actions.push({
        type: 'redirect',
        label: 'Go to Homepage',
        action: () => { window.location.href = '/'; },
        priority: 'secondary',
      });
    }

    return actions;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate error fingerprint for deduplication
   */
  private generateFingerprint(error: Error, context: Partial<ErrorContext>): string {
    const components = [
      error.name,
      error.message,
      context.component,
      context.action,
    ].filter(Boolean);
    
    return btoa(components.join('|')).substr(0, 16);
  }

  /**
   * Add error to queue
   */
  private addToQueue(error: ProcessedError): void {
    this.errorQueue.unshift(error);
    
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize);
    }
  }

  /**
   * Log error to external services
   */
  private logError(error: ProcessedError): void {
    const logFunction = error.severity === ErrorSeverity.CRITICAL ? logCritical : logError;
    
    logFunction(error.message, {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      context: error.context,
      technicalDetails: error.technicalDetails,
      fingerprint: error.fingerprint,
    });
  }

  /**
   * Trigger automatic recovery
   */
  private triggerAutoRecovery(error: ProcessedError): void {
    // Auto-retry for network errors
    if (error.type === ErrorType.NETWORK && this.shouldRetry(error.fingerprint)) {
      setTimeout(() => {
        const retryAction = error.recoveryActions.find(a => a.type === 'retry');
        if (retryAction) {
          retryAction.action();
        }
      }, this.getRetryDelay(error.fingerprint));
    }

    // Auto-refresh for critical errors
    if (error.severity === ErrorSeverity.CRITICAL) {
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  }

  /**
   * Check if should retry
   */
  private shouldRetry(fingerprint: string): boolean {
    const attempts = this.retryAttempts.get(fingerprint) || 0;
    return attempts < this.maxRetries;
  }

  /**
   * Get retry delay with exponential backoff
   */
  private getRetryDelay(fingerprint: string): number {
    const attempts = this.retryAttempts.get(fingerprint) || 0;
    this.retryAttempts.set(fingerprint, attempts + 1);
    
    return Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30 seconds
  }

  /**
   * Retry last action
   */
  private async retryLastAction(error: Error): Promise<void> {
    // Implementation depends on context
    window.location.reload();
  }

  /**
   * Retry payment
   */
  private async retryPayment(context: Partial<ErrorContext>): Promise<void> {
    // Implementation would trigger payment retry
    console.log('Retrying payment...', context);
  }

  /**
   * Get error queue
   */
  getErrorQueue(): ProcessedError[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Get error by ID
   */
  getErrorById(id: string): ProcessedError | undefined {
    return this.errorQueue.find(error => error.id === id);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): ProcessedError[] {
    return this.errorQueue.filter(error => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ProcessedError[] {
    return this.errorQueue.filter(error => error.severity === severity);
  }

  /**
   * Mark error as resolved
   */
  markErrorResolved(id: string): void {
    const index = this.errorQueue.findIndex(error => error.id === id);
    if (index !== -1) {
      this.errorQueue.splice(index, 1);
    }
  }
}

// Export singleton instance
export const errorManager = ErrorManager.getInstance();

// Convenience functions
export const handleError = (error: Error | unknown, context?: Partial<ErrorContext>) => {
  return errorManager.handleError(error, context);
};

export const getErrorQueue = () => errorManager.getErrorQueue();
export const clearErrors = () => errorManager.clearErrorQueue();
export const getErrorById = (id: string) => errorManager.getErrorById(id);

export default errorManager;
