import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorDisplay from '@/components/ErrorDisplay';

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | Error | any;
  onRetry?: () => void;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  loadingText = 'Loading...',
  children,
  className = ''
}) => {
  if (error) {
    return (
      <div className={className}>
        <ErrorDisplay 
          error={error} 
          onRetry={onRetry}
          showRetry={!!onRetry}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm">{loadingText}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingState;