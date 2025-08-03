import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to analytics/monitoring service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real application, send to error tracking service like Sentry
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        level: this.props.level || 'component',
      };

      // For now, just log to console
      console.error('Error logged:', errorData);

      // You would send this to your error tracking service:
      // errorTrackingService.captureException(error, { extra: errorData });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorLevel = () => {
    return this.props.level || 'component';
  };

  private renderFallback = () => {
    const { fallback } = this.props;
    const { error, retryCount } = this.state;
    const level = this.getErrorLevel();

    if (fallback) {
      return fallback;
    }

    // Component-level error (less severe)
    if (level === 'component') {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              Component Error
            </span>
          </div>
          <p className="text-sm text-red-600 mb-3">
            Something went wrong with this component. Please try refreshing.
          </p>
          {retryCount < this.maxRetries && (
            <Button
              size="sm"
              variant="outline"
              onClick={this.handleRetry}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      );
    }

    // Page-level error (more severe)
    if (level === 'page') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Page Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                We encountered an error while loading this page. 
                This might be a temporary issue.
              </p>
              
              <div className="space-y-2">
                {retryCount < this.maxRetries ? (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Maximum retry attempts reached.
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="text-left mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    <Bug className="h-3 w-3 inline mr-1" />
                    Debug Information
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Critical system error (most severe)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
        <Card className="max-w-lg w-full border-red-200">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-900">
              Critical System Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700">
              A critical error has occurred that prevents the application from functioning properly.
              Our team has been automatically notified.
            </p>
            
            <div className="bg-red-100 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error ID:</strong> {Date.now().toString(36)}
              </p>
              <p className="text-sm text-red-800">
                <strong>Time:</strong> {new Date().toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Application
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </div>

            <p className="text-xs text-red-600">
              If this problem persists, please contact support at support@realestatehotspot.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

// Convenience components for different error levels
export const ComponentErrorBoundary: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ErrorBoundary level="component" fallback={fallback}>
    {children}
  </ErrorBoundary>
);

export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">
    {children}
  </ErrorBoundary>
);

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical">
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
