import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, X, RefreshCw, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProcessedError, ErrorSeverity, ErrorType, errorManager } from '@/lib/errorManager';
import { useScreenReader } from '@/lib/accessibility';

interface ErrorNotificationProps {
  error: ProcessedError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  error, 
  onRetry, 
  onDismiss 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { announce } = useScreenReader();

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const retryAction = error.recoveryActions.find(action => action.type === 'retry');
      if (retryAction) {
        await retryAction.action();
        onRetry?.();
        toast.success('Action completed successfully');
      }
    } catch (retryError) {
      toast.error('Retry failed. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case ErrorSeverity.HIGH:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case ErrorSeverity.MEDIUM:
        return <Info className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'border-red-200 bg-red-50';
      case ErrorSeverity.HIGH:
        return 'border-orange-200 bg-orange-50';
      case ErrorSeverity.MEDIUM:
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  useEffect(() => {
    // Announce error to screen readers
    announce(`Error: ${error.userMessage}`, error.severity === ErrorSeverity.CRITICAL ? 'assertive' : 'polite');
  }, [error, announce]);

  return (
    <div className={cn(
      'p-4 rounded-lg border max-w-md',
      getSeverityColor()
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900">
              {error.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <Badge variant="secondary" className="text-xs">
              {error.severity}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {error.userMessage}
          </p>
          
          <div className="flex items-center gap-2">
            {error.recoveryActions.some(action => action.type === 'retry') && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-7 text-xs"
              >
                {isRetrying ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Retry
              </Button>
            )}
            
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                className="h-7 text-xs text-gray-500"
              >
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ErrorNotificationSystemProps {
  maxNotifications?: number;
  autoHideDelay?: number;
  showLowSeverity?: boolean;
}

export const ErrorNotificationSystem: React.FC<ErrorNotificationSystemProps> = ({
  maxNotifications = 3,
  autoHideDelay = 5000,
  showLowSeverity = false,
}) => {
  const [activeErrors, setActiveErrors] = useState<ProcessedError[]>([]);
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  // Listen for new errors
  useEffect(() => {
    const checkForNewErrors = () => {
      const allErrors = errorManager.getErrorQueue();
      const newErrors = allErrors.filter(error => {
        // Filter out dismissed errors
        if (dismissedErrors.has(error.id)) return false;
        
        // Filter by severity if needed
        if (!showLowSeverity && error.severity === ErrorSeverity.LOW) return false;
        
        // Check if already active
        return !activeErrors.some(activeError => activeError.id === error.id);
      });

      if (newErrors.length > 0) {
        setActiveErrors(prev => {
          const updated = [...newErrors, ...prev];
          return updated.slice(0, maxNotifications);
        });

        // Show toast notifications for new errors
        newErrors.forEach(error => {
          showToastNotification(error);
        });
      }
    };

    // Check immediately
    checkForNewErrors();

    // Set up polling for new errors
    const interval = setInterval(checkForNewErrors, 1000);

    return () => clearInterval(interval);
  }, [activeErrors, dismissedErrors, maxNotifications, showLowSeverity]);

  const showToastNotification = useCallback((error: ProcessedError) => {
    const toastId = `error-${error.id}`;
    
    const toastOptions = {
      id: toastId,
      duration: error.severity === ErrorSeverity.LOW ? autoHideDelay : Infinity,
      action: error.recoveryActions.length > 0 ? {
        label: 'Fix',
        onClick: () => {
          const primaryAction = error.recoveryActions.find(a => a.priority === 'primary');
          if (primaryAction) {
            primaryAction.action();
          }
        },
      } : undefined,
      onDismiss: () => {
        handleDismissError(error.id);
      },
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.HIGH:
        toast.error(error.userMessage, toastOptions);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(error.userMessage, toastOptions);
        break;
      default:
        toast.info(error.userMessage, toastOptions);
    }
  }, [autoHideDelay]);

  const handleRetryError = useCallback((errorId: string) => {
    const error = activeErrors.find(e => e.id === errorId);
    if (error) {
      // Remove from active errors
      setActiveErrors(prev => prev.filter(e => e.id !== errorId));
      
      // Mark as resolved in error manager
      errorManager.markErrorResolved(errorId);
      
      // Show success toast
      toast.success('Action completed successfully', {
        duration: 3000,
      });
    }
  }, [activeErrors]);

  const handleDismissError = useCallback((errorId: string) => {
    setActiveErrors(prev => prev.filter(e => e.id !== errorId));
    setDismissedErrors(prev => new Set([...prev, errorId]));
    
    // Mark as resolved in error manager
    errorManager.markErrorResolved(errorId);
  }, []);

  const handleDismissAll = useCallback(() => {
    const errorIds = activeErrors.map(e => e.id);
    setActiveErrors([]);
    setDismissedErrors(prev => new Set([...prev, ...errorIds]));
    
    // Mark all as resolved
    errorIds.forEach(id => errorManager.markErrorResolved(id));
    
    toast.success('All errors dismissed');
  }, [activeErrors]);

  // Auto-hide low severity errors
  useEffect(() => {
    if (autoHideDelay > 0) {
      const timeouts = activeErrors
        .filter(error => error.severity === ErrorSeverity.LOW)
        .map(error => 
          setTimeout(() => handleDismissError(error.id), autoHideDelay)
        );

      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [activeErrors, autoHideDelay, handleDismissError]);

  // Render persistent error notifications (for high/critical errors)
  const persistentErrors = activeErrors.filter(error => 
    error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL
  );

  if (persistentErrors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {persistentErrors.length > 1 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismissAll}
            className="text-xs"
          >
            Dismiss All ({persistentErrors.length})
          </Button>
        </div>
      )}
      
      {persistentErrors.map(error => (
        <ErrorNotification
          key={error.id}
          error={error}
          onRetry={() => handleRetryError(error.id)}
          onDismiss={() => handleDismissError(error.id)}
        />
      ))}
    </div>
  );
};

export default ErrorNotificationSystem;
