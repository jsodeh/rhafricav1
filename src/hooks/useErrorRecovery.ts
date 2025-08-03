import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleError, ProcessedError, ErrorType, ErrorContext } from '@/lib/errorManager';
import { useScreenReader } from '@/lib/accessibility';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackRoute?: string;
  onError?: (error: ProcessedError) => void;
  onRetry?: (attempt: number) => void;
  onRecovery?: () => void;
}

interface ErrorRecoveryState {
  error: ProcessedError | null;
  isRetrying: boolean;
  retryCount: number;
  hasRecovered: boolean;
}

/**
 * Hook for handling error recovery with automatic retry logic
 */
export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    fallbackRoute = '/',
    onError,
    onRetry,
    onRecovery,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { announce } = useScreenReader();
  
  const [state, setState] = useState<ErrorRecoveryState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    hasRecovered: false,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const clearError = useCallback(() => {
    setState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      hasRecovered: false,
    });
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const reportError = useCallback((
    error: Error | unknown,
    context: Partial<ErrorContext> = {}
  ): ProcessedError => {
    const processedError = handleError(error, {
      ...context,
      route: location.pathname,
    });

    setState(prev => ({
      ...prev,
      error: processedError,
      hasRecovered: false,
    }));

    onError?.(processedError);
    
    return processedError;
  }, [location.pathname, onError]);

  const retry = useCallback(async (action: () => Promise<void> | void) => {
    if (state.retryCount >= maxRetries) {
      announce('Maximum retry attempts reached', 'assertive');
      return false;
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    onRetry?.(state.retryCount + 1);

    return new Promise<boolean>((resolve) => {
      retryTimeoutRef.current = setTimeout(async () => {
        try {
          await action();
          
          setState(prev => ({
            ...prev,
            error: null,
            isRetrying: false,
            hasRecovered: true,
          }));

          onRecovery?.();
          announce('Operation completed successfully', 'polite');
          resolve(true);
          
        } catch (retryError) {
          setState(prev => ({
            ...prev,
            isRetrying: false,
            error: handleError(retryError, {
              route: location.pathname,
              action: 'retry',
            }),
          }));
          
          resolve(false);
        }
      }, retryDelay * Math.pow(2, state.retryCount)); // Exponential backoff
    });
  }, [state.retryCount, maxRetries, retryDelay, onRetry, onRecovery, announce, location.pathname]);

  const fallback = useCallback(() => {
    clearError();
    navigate(fallbackRoute);
    announce(`Redirected to ${fallbackRoute}`, 'polite');
  }, [clearError, navigate, fallbackRoute, announce]);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    reportError,
    retry,
    clearError,
    fallback,
    reload,
    canRetry: state.retryCount < maxRetries,
  };
}

/**
 * Hook for handling async operations with automatic error recovery
 */
export function useAsyncErrorRecovery<T = any>(
  asyncOperation: () => Promise<T>,
  dependencies: any[] = [],
  options: ErrorRecoveryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const errorRecovery = useErrorRecovery(options);

  const execute = useCallback(async () => {
    setLoading(true);
    errorRecovery.clearError();

    try {
      const result = await asyncOperation();
      setData(result);
      return result;
    } catch (error) {
      errorRecovery.reportError(error, {
        component: 'AsyncOperation',
        action: 'execute',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncOperation, errorRecovery]);

  const retryOperation = useCallback(async () => {
    return errorRecovery.retry(async () => {
      const result = await execute();
      return result;
    });
  }, [errorRecovery, execute]);

  // Auto-execute on dependency changes
  useEffect(() => {
    execute();
  }, dependencies);

  return {
    data,
    loading,
    execute,
    retryOperation,
    ...errorRecovery,
  };
}

/**
 * Hook for form error handling with validation recovery
 */
export function useFormErrorRecovery() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<ProcessedError | null>(null);
  const { announce } = useScreenReader();

  const setFieldError = useCallback((field: string, error: string) => {
    setFormErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFormErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormErrors({});
    setSubmitError(null);
  }, []);

  const handleSubmitError = useCallback((error: Error | unknown) => {
    const processedError = handleError(error, {
      component: 'Form',
      action: 'submit',
    });

    setSubmitError(processedError);
    
    // Handle validation errors
    if (processedError.type === ErrorType.VALIDATION) {
      announce('Please correct the form errors', 'assertive');
    } else {
      announce(`Form submission failed: ${processedError.userMessage}`, 'assertive');
    }

    return processedError;
  }, [announce]);

  const retrySubmit = useCallback(async (submitFunction: () => Promise<void>) => {
    setSubmitError(null);
    
    try {
      await submitFunction();
      clearAllErrors();
      announce('Form submitted successfully', 'polite');
    } catch (error) {
      handleSubmitError(error);
    }
  }, [handleSubmitError, clearAllErrors, announce]);

  return {
    formErrors,
    submitError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleSubmitError,
    retrySubmit,
    hasErrors: Object.keys(formErrors).length > 0 || !!submitError,
  };
}

/**
 * Hook for handling network request errors with retry logic
 */
export function useNetworkErrorRecovery() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const errorRecovery = useErrorRecovery({
    maxRetries: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      errorRecovery.clearError();
    };

    const handleOffline = () => {
      setIsOnline(false);
      errorRecovery.reportError(new Error('Network connection lost'), {
        component: 'Network',
        action: 'connection_lost',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [errorRecovery]);

  const makeRequest = useCallback(async <T>(
    requestFunction: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<T> => {
    if (!isOnline) {
      throw errorRecovery.reportError(new Error('No network connection'), {
        ...context,
        component: 'Network',
        action: 'request_offline',
      });
    }

    try {
      const result = await requestFunction();
      errorRecovery.clearError();
      return result;
    } catch (error) {
      throw errorRecovery.reportError(error, {
        ...context,
        component: 'Network',
        action: 'request_failed',
      });
    }
  }, [isOnline, errorRecovery]);

  const retryRequest = useCallback(async <T>(
    requestFunction: () => Promise<T>
  ): Promise<T | null> => {
    const success = await errorRecovery.retry(async () => {
      return await requestFunction();
    });

    return success ? await requestFunction() : null;
  }, [errorRecovery]);

  return {
    isOnline,
    makeRequest,
    retryRequest,
    ...errorRecovery,
  };
}

export default useErrorRecovery;
