import React from 'react';
import { AlertCircle, Wifi, RefreshCw, Mail, LogIn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { translateError, isRecoverableError, type UserFriendlyError } from '@/lib/errorHandling';

interface ErrorDisplayProps {
  error: string | Error | any;
  onRetry?: () => void;
  onAction?: () => void;
  className?: string;
  showRetry?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onAction,
  className = '',
  showRetry = true
}) => {
  const friendlyError: UserFriendlyError = translateError(error);
  const canRetry = isRecoverableError(error);

  const getIcon = () => {
    switch (friendlyError.type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getActionIcon = () => {
    const action = friendlyError.action?.toLowerCase() || '';
    
    if (action.includes('retry') || action.includes('try again')) {
      return <RefreshCw className="h-4 w-4" />;
    } else if (action.includes('sign in') || action.includes('login')) {
      return <LogIn className="h-4 w-4" />;
    } else if (action.includes('email')) {
      return <Mail className="h-4 w-4" />;
    } else if (action.includes('settings') || action.includes('profile')) {
      return <Settings className="h-4 w-4" />;
    } else if (action.includes('connection') || action.includes('network')) {
      return <Wifi className="h-4 w-4" />;
    }
    
    return null;
  };

  const getAlertVariant = () => {
    switch (friendlyError.type) {
      case 'warning':
        return 'default'; // Amber styling
      case 'info':
        return 'default'; // Blue styling  
      default:
        return 'destructive'; // Red styling
    }
  };

  return (
    <Alert variant={getAlertVariant()} className={`${className}`}>
      {getIcon()}
      <AlertTitle className="font-semibold">
        {friendlyError.title}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">{friendlyError.message}</p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Primary action button */}
          {friendlyError.action && (
            <Button
              onClick={onAction}
              variant={friendlyError.type === 'error' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              {getActionIcon()}
              {friendlyError.action}
            </Button>
          )}
          
          {/* Retry button for recoverable errors */}
          {showRetry && canRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;