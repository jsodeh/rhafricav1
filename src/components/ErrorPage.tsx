import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Clock, Wifi, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ProcessedError, ErrorType, ErrorSeverity, ErrorRecoveryAction } from '@/lib/errorManager';
import { useScreenReader } from '@/lib/accessibility';

interface ErrorPageProps {
  error: ProcessedError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showTechnicalDetails?: boolean;
  className?: string;
}

const ErrorIcon: React.FC<{ type: ErrorType; className?: string }> = ({ type, className }) => {
  const iconProps = { className: cn('h-6 w-6', className) };
  
  switch (type) {
    case ErrorType.NETWORK:
      return <Wifi {...iconProps} />;
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return <Shield {...iconProps} />;
    case ErrorType.PAYMENT:
      return <CreditCard {...iconProps} />;
    case ErrorType.TIMEOUT:
      return <Clock {...iconProps} />;
    default:
      return <AlertTriangle {...iconProps} />;
  }
};

const SeverityBadge: React.FC<{ severity: ErrorSeverity }> = ({ severity }) => {
  const variants = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <Badge variant="secondary" className={variants[severity]}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

const RecoveryActionButton: React.FC<{
  action: ErrorRecoveryAction;
  onExecute: () => void;
  disabled?: boolean;
}> = ({ action, onExecute, disabled = false }) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleClick = async () => {
    setIsExecuting(true);
    try {
      await action.action();
      onExecute();
    } catch (error) {
      console.error('Recovery action failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const variant = action.priority === 'primary' ? 'default' : 'outline';
  
  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={disabled || isExecuting}
      className={cn(
        'min-w-[120px]',
        action.priority === 'primary' && 'font-semibold'
      )}
    >
      {isExecuting ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Working...
        </>
      ) : (
        action.label
      )}
    </Button>
  );
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  onRetry,
  onDismiss,
  showTechnicalDetails = false,
  className,
}) => {
  const { announce } = useScreenReader();
  const [showDetails, setShowDetails] = useState(false);
  const [actionExecuted, setActionExecuted] = useState(false);

  useEffect(() => {
    // Announce error to screen readers
    announce(`Error occurred: ${error.userMessage}`, 'assertive');
  }, [error.userMessage, announce]);

  const handleActionExecute = () => {
    setActionExecuted(true);
    onRetry?.();
  };

  const getErrorTypeDescription = (type: ErrorType): string => {
    const descriptions: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Connection Issue',
      [ErrorType.AUTHENTICATION]: 'Authentication Required',
      [ErrorType.AUTHORIZATION]: 'Access Denied',
      [ErrorType.VALIDATION]: 'Invalid Input',
      [ErrorType.NOT_FOUND]: 'Not Found',
      [ErrorType.SERVER_ERROR]: 'Server Error',
      [ErrorType.CLIENT_ERROR]: 'Request Error',
      [ErrorType.PAYMENT]: 'Payment Issue',
      [ErrorType.UPLOAD]: 'Upload Failed',
      [ErrorType.TIMEOUT]: 'Request Timeout',
      [ErrorType.QUOTA_EXCEEDED]: 'Rate Limit Exceeded',
      [ErrorType.MAINTENANCE]: 'Service Maintenance',
      [ErrorType.UNKNOWN]: 'Unexpected Error',
    };
    
    return descriptions[type] || descriptions[ErrorType.UNKNOWN];
  };

  const getBackgroundColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200';
      case ErrorSeverity.HIGH:
        return 'bg-orange-50 border-orange-200';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getIconColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'text-red-600';
      case ErrorSeverity.HIGH:
        return 'text-orange-600';
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={cn('flex items-center justify-center min-h-[50vh] p-4', className)}>
      <Card className={cn('w-full max-w-2xl', getBackgroundColor(error.severity))}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mx-auto',
              getBackgroundColor(error.severity).replace('50', '100')
            )}>
              <ErrorIcon 
                type={error.type} 
                className={cn('h-8 w-8', getIconColor(error.severity))}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-xl">
              {getErrorTypeDescription(error.type)}
            </CardTitle>
            <SeverityBadge severity={error.severity} />
          </div>
          
          <p className="text-gray-600">
            {error.userMessage}
          </p>

          {error.context.timestamp && (
            <p className="text-sm text-gray-500 mt-2">
              Occurred at {new Date(error.context.timestamp).toLocaleString()}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Recovery Actions */}
          {error.recoveryActions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What would you like to do?</h3>
              <div className="flex flex-wrap gap-3">
                {error.recoveryActions.map((action, index) => (
                  <RecoveryActionButton
                    key={index}
                    action={action}
                    onExecute={handleActionExecute}
                    disabled={actionExecuted}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Details */}
          {(showTechnicalDetails || process.env.NODE_ENV === 'development') && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Bug className="h-4 w-4" />
                    Technical Details
                  </span>
                  <ArrowLeft className={cn(
                    'h-4 w-4 transition-transform',
                    showDetails && 'rotate-90'
                  )} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="bg-gray-100 rounded-lg p-4 space-y-2 text-sm font-mono">
                  <div>
                    <strong>Error ID:</strong> {error.id}
                  </div>
                  <div>
                    <strong>Type:</strong> {error.type}
                  </div>
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.context.route && (
                    <div>
                      <strong>Route:</strong> {error.context.route}
                    </div>
                  )}
                  {error.context.component && (
                    <div>
                      <strong>Component:</strong> {error.context.component}
                    </div>
                  )}
                  {error.context.action && (
                    <div>
                      <strong>Action:</strong> {error.context.action}
                    </div>
                  )}
                  {error.technicalDetails && (
                    <div>
                      <strong>Details:</strong>
                      <pre className="mt-1 text-xs overflow-auto">
                        {error.technicalDetails}
                      </pre>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Help Text */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Need more help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              If this problem persists, you can:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Try refreshing the page or clearing your browser cache</li>
              <li>• Check your internet connection</li>
              <li>• Contact our support team with error ID: <code className="bg-gray-100 px-1 rounded">{error.id}</code></li>
            </ul>
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/help" className="flex items-center gap-1">
                  Help Center
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/contact" className="flex items-center gap-1">
                  Contact Support
                </a>
              </Button>
            </div>
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <div className="text-center">
              <Button variant="ghost" onClick={onDismiss} className="text-gray-500">
                Dismiss this error
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
