/**
 * Specialized error handlers for common use cases
 */

import { toast } from 'sonner';
import { handleError, ErrorType, ErrorContext } from './errorManager';

/**
 * API Error Handler
 */
export class ApiErrorHandler {
  static async handleResponse(response: Response, context: Partial<ErrorContext> = {}) {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData: any = null;

      try {
        errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Use default HTTP error message
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).response = response;
      (error as any).data = errorData;

      throw handleError(error, {
        ...context,
        component: 'API',
        action: 'http_request',
        url: response.url,
        status: response.status,
      });
    }

    return response;
  }

  static async handleFetch(
    url: string, 
    options: RequestInit = {}, 
    context: Partial<ErrorContext> = {}
  ) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      return await this.handleResponse(response, {
        ...context,
        url: url.toString(),
        method: options.method || 'GET',
      });
    } catch (error) {
      throw handleError(error, {
        ...context,
        component: 'API',
        action: 'fetch_error',
        url: url.toString(),
        method: options.method || 'GET',
      });
    }
  }

  static async get(url: string, context: Partial<ErrorContext> = {}) {
    return this.handleFetch(url, { method: 'GET' }, context);
  }

  static async post(url: string, data: any, context: Partial<ErrorContext> = {}) {
    return this.handleFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }, context);
  }

  static async put(url: string, data: any, context: Partial<ErrorContext> = {}) {
    return this.handleFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, context);
  }

  static async delete(url: string, context: Partial<ErrorContext> = {}) {
    return this.handleFetch(url, { method: 'DELETE' }, context);
  }
}

/**
 * Form Error Handler
 */
export class FormErrorHandler {
  static handleValidationError(
    fieldErrors: Record<string, string[]>,
    context: Partial<ErrorContext> = {}
  ) {
    const errorMessages = Object.entries(fieldErrors)
      .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
      .join('; ');

    const error = new Error(`Validation failed: ${errorMessages}`);
    (error as any).fieldErrors = fieldErrors;

    return handleError(error, {
      ...context,
      component: 'Form',
      action: 'validation',
      type: ErrorType.VALIDATION,
    });
  }

  static handleSubmissionError(
    error: Error | unknown,
    formData: Record<string, any>,
    context: Partial<ErrorContext> = {}
  ) {
    return handleError(error, {
      ...context,
      component: 'Form',
      action: 'submission',
      formFields: Object.keys(formData),
    });
  }

  static async handleAsyncSubmission<T>(
    submitFunction: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<T> {
    try {
      const result = await submitFunction();
      toast.success('Form submitted successfully');
      return result;
    } catch (error) {
      const processedError = this.handleSubmissionError(error, {}, context);
      toast.error(processedError.userMessage);
      throw processedError;
    }
  }
}

/**
 * Authentication Error Handler
 */
export class AuthErrorHandler {
  static handleAuthenticationError(
    error: Error | unknown,
    context: Partial<ErrorContext> = {}
  ) {
    const processedError = handleError(error, {
      ...context,
      component: 'Auth',
      action: 'authentication',
      type: ErrorType.AUTHENTICATION,
    });

    // Redirect to login on auth errors
    if (processedError.type === ErrorType.AUTHENTICATION) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    return processedError;
  }

  static handleSignInError(error: Error | unknown) {
    return this.handleAuthenticationError(error, {
      action: 'sign_in',
    });
  }

  static handleSignUpError(error: Error | unknown) {
    return this.handleAuthenticationError(error, {
      action: 'sign_up',
    });
  }

  static handlePasswordResetError(error: Error | unknown) {
    return this.handleAuthenticationError(error, {
      action: 'password_reset',
    });
  }
}

/**
 * Payment Error Handler
 */
export class PaymentErrorHandler {
  static handlePaymentError(
    error: Error | unknown,
    paymentData: Record<string, any> = {},
    context: Partial<ErrorContext> = {}
  ) {
    const processedError = handleError(error, {
      ...context,
      component: 'Payment',
      action: 'payment_processing',
      type: ErrorType.PAYMENT,
      paymentMethod: paymentData.method,
      amount: paymentData.amount,
    });

    // Show payment-specific error messages
    toast.error(processedError.userMessage, {
      action: {
        label: 'Contact Support',
        onClick: () => {
          window.open('/contact', '_blank');
        },
      },
    });

    return processedError;
  }

  static handlePaystackError(error: any) {
    const errorMessage = error.message || 'Payment processing failed';
    const processedError = new Error(errorMessage);
    (processedError as any).paystackError = error;

    return this.handlePaymentError(processedError, {
      method: 'paystack',
      reference: error.reference,
    });
  }
}

/**
 * File Upload Error Handler
 */
export class FileUploadErrorHandler {
  static handleUploadError(
    error: Error | unknown,
    file: File,
    context: Partial<ErrorContext> = {}
  ) {
    return handleError(error, {
      ...context,
      component: 'FileUpload',
      action: 'upload',
      type: ErrorType.UPLOAD,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  }

  static handleFileSizeError(file: File, maxSize: number) {
    const error = new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`);
    return this.handleUploadError(error, file, {
      action: 'size_validation',
    });
  }

  static handleFileTypeError(file: File, allowedTypes: string[]) {
    const error = new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    return this.handleUploadError(error, file, {
      action: 'type_validation',
    });
  }
}

/**
 * Navigation Error Handler
 */
export class NavigationErrorHandler {
  static handleRouteError(
    error: Error | unknown,
    route: string,
    context: Partial<ErrorContext> = {}
  ) {
    return handleError(error, {
      ...context,
      component: 'Router',
      action: 'navigation',
      route,
    });
  }

  static handleNotFoundError(path: string) {
    const error = new Error(`Route not found: ${path}`);
    return handleError(error, {
      component: 'Router',
      action: 'not_found',
      type: ErrorType.NOT_FOUND,
      route: path,
    });
  }
}

/**
 * Generic Error Handler with toast notifications
 */
export class ToastErrorHandler {
  static handleWithToast(
    error: Error | unknown,
    context: Partial<ErrorContext> = {},
    showToast = true
  ) {
    const processedError = handleError(error, context);

    if (showToast) {
      const hasRetryAction = processedError.recoveryActions.some(
        action => action.type === 'retry'
      );

      toast.error(processedError.userMessage, {
        duration: processedError.severity === 'critical' ? Infinity : 5000,
        action: hasRetryAction ? {
          label: 'Retry',
          onClick: () => {
            const retryAction = processedError.recoveryActions.find(
              action => action.type === 'retry'
            );
            retryAction?.action();
          },
        } : undefined,
      });
    }

    return processedError;
  }

  static success(message: string, duration = 3000) {
    toast.success(message, { duration });
  }

  static warning(message: string, duration = 4000) {
    toast.warning(message, { duration });
  }

  static info(message: string, duration = 3000) {
    toast.info(message, { duration });
  }
}

// Convenience exports
export const apiError = ApiErrorHandler;
export const formError = FormErrorHandler;
export const authError = AuthErrorHandler;
export const paymentError = PaymentErrorHandler;
export const uploadError = FileUploadErrorHandler;
export const navError = NavigationErrorHandler;
export const toastError = ToastErrorHandler;

// Default export for common usage
export default {
  api: ApiErrorHandler,
  form: FormErrorHandler,
  auth: AuthErrorHandler,
  payment: PaymentErrorHandler,
  upload: FileUploadErrorHandler,
  navigation: NavigationErrorHandler,
  toast: ToastErrorHandler,
};
