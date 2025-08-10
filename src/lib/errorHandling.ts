// User-friendly error handling system
export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  type: 'error' | 'warning' | 'info';
}

// Common error patterns and their user-friendly translations
const errorTranslations: Record<string, UserFriendlyError> = {
  // Authentication errors
  'Invalid login credentials': {
    title: 'Sign In Failed',
    message: 'The email or password you entered is incorrect. Please check and try again.',
    action: 'Try Again',
    type: 'error'
  },
  'User not found': {
    title: 'Account Not Found',
    message: 'We couldn\'t find an account with this email address. Would you like to create one?',
    action: 'Sign Up Instead',
    type: 'info'
  },
  'Email not confirmed': {
    title: 'Email Verification Required',
    message: 'Please check your email and click the verification link before signing in.',
    action: 'Resend Email',
    type: 'warning'
  },
  'User already registered': {
    title: 'Account Already Exists',
    message: 'An account with this email already exists. Try signing in instead.',
    action: 'Sign In',
    type: 'info'
  },
  'Password should be at least 6 characters': {
    title: 'Password Too Short',
    message: 'Your password needs to be at least 6 characters long for security.',
    action: 'Try Again',
    type: 'error'
  },
  'Invalid email': {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
    action: 'Try Again',
    type: 'error'
  },
  'Email rate limit exceeded': {
    title: 'Too Many Requests',
    message: 'Please wait a few minutes before requesting another verification email.',
    action: 'Wait and Try Again',
    type: 'warning'
  },

  // Database/API errors
  'Failed to fetch': {
    title: 'Connection Problem',
    message: 'We\'re having trouble connecting to our servers. Please check your internet connection.',
    action: 'Try Again',
    type: 'error'
  },
  'Network request failed': {
    title: 'Network Error',
    message: 'Please check your internet connection and try again.',
    action: 'Retry',
    type: 'error'
  },
  'Internal server error': {
    title: 'Something Went Wrong',
    message: 'We\'re experiencing technical difficulties. Our team has been notified.',
    action: 'Try Again Later',
    type: 'error'
  },
  'Service temporarily unavailable': {
    title: 'Service Unavailable',
    message: 'Our service is temporarily down for maintenance. Please try again in a few minutes.',
    action: 'Try Again Later',
    type: 'warning'
  },

  // Profile/Data errors
  'Profile not found': {
    title: 'Profile Setup Required',
    message: 'Let\'s set up your profile to get the most out of Real Estate Hotspot.',
    action: 'Complete Profile',
    type: 'info'
  },
  'Unauthorized': {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this feature. Please sign in or contact support.',
    action: 'Sign In',
    type: 'error'
  },
  'Session expired': {
    title: 'Session Expired',
    message: 'Your session has expired for security reasons. Please sign in again.',
    action: 'Sign In',
    type: 'warning'
  },

  // Property/Search errors
  'Property not found': {
    title: 'Property Not Available',
    message: 'This property is no longer available or has been removed.',
    action: 'Browse Properties',
    type: 'info'
  },
  'Search failed': {
    title: 'Search Error',
    message: 'We couldn\'t complete your search right now. Please try with different criteria.',
    action: 'Try Different Search',
    type: 'error'
  },

  // File upload errors
  'File too large': {
    title: 'File Too Large',
    message: 'Please choose an image smaller than 5MB.',
    action: 'Choose Different Image',
    type: 'error'
  },
  'Invalid file type': {
    title: 'Invalid File Type',
    message: 'Please upload a valid image file (JPG, PNG, or WebP).',
    action: 'Choose Different File',
    type: 'error'
  },

  // Payment errors
  'Payment failed': {
    title: 'Payment Failed',
    message: 'We couldn\'t process your payment. Please check your payment details and try again.',
    action: 'Try Again',
    type: 'error'
  },
  'Card declined': {
    title: 'Card Declined',
    message: 'Your card was declined. Please try a different payment method.',
    action: 'Try Different Card',
    type: 'error'
  }
};

// Function to translate technical errors to user-friendly messages
export const translateError = (error: string | Error | any): UserFriendlyError => {
  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error_description) {
    errorMessage = error.error_description;
  } else if (error?.details) {
    errorMessage = error.details;
  } else {
    errorMessage = 'An unexpected error occurred';
  }

  // Check for exact matches first
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

  // Check for partial matches
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return translation;
    }
  }

  // Default fallback for unknown errors
  return {
    title: 'Oops! Something Went Wrong',
    message: 'We encountered an unexpected issue. Don\'t worry, our team has been notified and we\'re working on it.',
    action: 'Try Again',
    type: 'error'
  };
};

// Helper function to determine if an error is recoverable
export const isRecoverableError = (error: string | Error | any): boolean => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  const recoverablePatterns = [
    'network',
    'connection',
    'timeout',
    'rate limit',
    'temporarily unavailable',
    'service unavailable'
  ];

  return recoverablePatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern)
  );
};

// Helper function to get retry delay based on error type
export const getRetryDelay = (error: string | Error | any): number => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  if (errorMessage.includes('rate limit')) {
    return 60000; // 1 minute for rate limits
  } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 3000; // 3 seconds for network issues
  } else {
    return 1000; // 1 second default
  }
};