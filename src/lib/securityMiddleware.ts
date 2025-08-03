/**
 * Security middleware for form validation and request protection
 */

import { InputValidator, InputSanitizer, RateLimiter, SECURITY_CONFIG } from './security';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: Record<string, any>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Form validation middleware
 */
export class FormSecurityMiddleware {
  /**
   * Validate contact form data
   */
  static validateContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    // Validate and sanitize name
    if (!data.name || !InputValidator.isValidName(data.name)) {
      errors.push('Invalid name format');
    } else {
      sanitizedData.name = InputSanitizer.normalizeText(
        InputSanitizer.stripHtml(data.name)
      );
    }

    // Validate and sanitize email
    if (!data.email || !InputValidator.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    } else {
      sanitizedData.email = data.email.toLowerCase().trim();
    }

    // Validate and sanitize phone (optional)
    if (data.phone) {
      if (!InputValidator.isValidPhone(data.phone)) {
        errors.push('Invalid phone number format');
      } else {
        sanitizedData.phone = data.phone.replace(/[\s\-\(\)]/g, '');
      }
    }

    // Validate and sanitize message
    if (!data.message || data.message.length < 10 || data.message.length > 1000) {
      errors.push('Message must be between 10 and 1000 characters');
    } else if (!InputValidator.isSafeInput(data.message)) {
      errors.push('Message contains potentially harmful content');
    } else {
      sanitizedData.message = InputSanitizer.normalizeText(
        InputSanitizer.stripHtml(data.message)
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
    };
  }

  /**
   * Validate property search form
   */
  static validateSearchForm(data: {
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    propertyType?: string;
    bedrooms?: string;
    bathrooms?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    // Validate location
    if (data.location) {
      if (data.location.length > 100 || !InputValidator.isSafeInput(data.location)) {
        errors.push('Invalid location format');
      } else {
        sanitizedData.location = InputSanitizer.normalizeText(
          InputSanitizer.stripHtml(data.location)
        );
      }
    }

    // Validate price ranges
    if (data.minPrice) {
      if (!InputValidator.isValidPrice(data.minPrice)) {
        errors.push('Invalid minimum price format');
      } else {
        sanitizedData.minPrice = parseFloat(data.minPrice);
      }
    }

    if (data.maxPrice) {
      if (!InputValidator.isValidPrice(data.maxPrice)) {
        errors.push('Invalid maximum price format');
      } else {
        sanitizedData.maxPrice = parseFloat(data.maxPrice);
      }
    }

    // Validate property type
    if (data.propertyType) {
      const allowedTypes = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial'];
      if (!allowedTypes.includes(data.propertyType)) {
        errors.push('Invalid property type');
      } else {
        sanitizedData.propertyType = data.propertyType;
      }
    }

    // Validate bedrooms/bathrooms
    if (data.bedrooms) {
      const bedrooms = parseInt(data.bedrooms, 10);
      if (isNaN(bedrooms) || bedrooms < 0 || bedrooms > 20) {
        errors.push('Invalid bedroom count');
      } else {
        sanitizedData.bedrooms = bedrooms;
      }
    }

    if (data.bathrooms) {
      const bathrooms = parseInt(data.bathrooms, 10);
      if (isNaN(bathrooms) || bathrooms < 0 || bathrooms > 20) {
        errors.push('Invalid bathroom count');
      } else {
        sanitizedData.bathrooms = bathrooms;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
    };
  }

  /**
   * Validate agent registration form
   */
  static validateAgentRegistration(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    license: string;
    company?: string;
    bio?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    // Validate first name
    if (!data.firstName || !InputValidator.isValidName(data.firstName)) {
      errors.push('Invalid first name format');
    } else {
      sanitizedData.firstName = InputSanitizer.normalizeText(
        InputSanitizer.stripHtml(data.firstName)
      );
    }

    // Validate last name
    if (!data.lastName || !InputValidator.isValidName(data.lastName)) {
      errors.push('Invalid last name format');
    } else {
      sanitizedData.lastName = InputSanitizer.normalizeText(
        InputSanitizer.stripHtml(data.lastName)
      );
    }

    // Validate email
    if (!data.email || !InputValidator.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    } else {
      sanitizedData.email = data.email.toLowerCase().trim();
    }

    // Validate phone
    if (!data.phone || !InputValidator.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    } else {
      sanitizedData.phone = data.phone.replace(/[\s\-\(\)]/g, '');
    }

    // Validate license number
    if (!data.license || !/^[A-Z0-9]{5,20}$/i.test(data.license)) {
      errors.push('Invalid license number format');
    } else {
      sanitizedData.license = data.license.toUpperCase().trim();
    }

    // Validate company (optional)
    if (data.company) {
      if (data.company.length > 100 || !InputValidator.isSafeInput(data.company)) {
        errors.push('Invalid company name format');
      } else {
        sanitizedData.company = InputSanitizer.normalizeText(
          InputSanitizer.stripHtml(data.company)
        );
      }
    }

    // Validate bio (optional)
    if (data.bio) {
      if (data.bio.length > 500 || !InputValidator.isSafeInput(data.bio)) {
        errors.push('Bio must be under 500 characters and contain safe content');
      } else {
        sanitizedData.bio = InputSanitizer.normalizeText(
          InputSanitizer.stripHtml(data.bio)
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
    };
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File, context: 'profile' | 'property' | 'document'): ValidationResult {
    const errors: string[] = [];
    
    const contextLimits = {
      profile: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
      property: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
      document: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      },
    };

    const limits = contextLimits[context];

    if (!InputValidator.isValidFile(file, limits.allowedTypes, limits.maxSize)) {
      if (file.size > limits.maxSize) {
        errors.push(`File size exceeds ${limits.maxSize / 1024 / 1024}MB limit`);
      }
      if (!limits.allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} not allowed`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Rate limiting middleware
 */
export class RateLimitMiddleware {
  /**
   * Check API rate limit
   */
  static checkApiLimit(identifier: string): RateLimitResult {
    const config = SECURITY_CONFIG.rateLimit.api;
    const isLimited = RateLimiter.isRateLimited(identifier, config.maxRequests, config.windowMs);
    const info = RateLimiter.getRateLimitInfo(identifier, config.maxRequests, config.windowMs);

    return {
      allowed: !isLimited,
      remaining: info.remaining,
      resetTime: info.resetTime,
    };
  }

  /**
   * Check authentication rate limit
   */
  static checkAuthLimit(identifier: string): RateLimitResult {
    const config = SECURITY_CONFIG.rateLimit.auth;
    const isLimited = RateLimiter.isRateLimited(identifier, config.maxRequests, config.windowMs);
    const info = RateLimiter.getRateLimitInfo(identifier, config.maxRequests, config.windowMs);

    return {
      allowed: !isLimited,
      remaining: info.remaining,
      resetTime: info.resetTime,
    };
  }

  /**
   * Check contact form rate limit
   */
  static checkContactLimit(identifier: string): RateLimitResult {
    const config = SECURITY_CONFIG.rateLimit.contact;
    const isLimited = RateLimiter.isRateLimited(identifier, config.maxRequests, config.windowMs);
    const info = RateLimiter.getRateLimitInfo(identifier, config.maxRequests, config.windowMs);

    return {
      allowed: !isLimited,
      remaining: info.remaining,
      resetTime: info.resetTime,
    };
  }

  /**
   * Check search rate limit
   */
  static checkSearchLimit(identifier: string): RateLimitResult {
    const config = SECURITY_CONFIG.rateLimit.search;
    const isLimited = RateLimiter.isRateLimited(identifier, config.maxRequests, config.windowMs);
    const info = RateLimiter.getRateLimitInfo(identifier, config.maxRequests, config.windowMs);

    return {
      allowed: !isLimited,
      remaining: info.remaining,
      resetTime: info.resetTime,
    };
  }
}

/**
 * Security response helpers
 */
export class SecurityResponse {
  /**
   * Create rate limit error response
   */
  static rateLimitError(resetTime: number): { error: string; retryAfter: number } {
    return {
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    };
  }

  /**
   * Create validation error response
   */
  static validationError(errors: string[]): { error: string; details: string[] } {
    return {
      error: 'Validation failed',
      details: errors,
    };
  }

  /**
   * Create security error response
   */
  static securityError(message: string = 'Security violation detected'): { error: string } {
    return {
      error: message,
    };
  }
}

/**
 * Hook for using security middleware in components
 */
export function useSecurityMiddleware() {
  const validateContactForm = (data: Parameters<typeof FormSecurityMiddleware.validateContactForm>[0]) => {
    return FormSecurityMiddleware.validateContactForm(data);
  };

  const validateSearchForm = (data: Parameters<typeof FormSecurityMiddleware.validateSearchForm>[0]) => {
    return FormSecurityMiddleware.validateSearchForm(data);
  };

  const validateAgentRegistration = (data: Parameters<typeof FormSecurityMiddleware.validateAgentRegistration>[0]) => {
    return FormSecurityMiddleware.validateAgentRegistration(data);
  };

  const validateFileUpload = (file: File, context: 'profile' | 'property' | 'document') => {
    return FormSecurityMiddleware.validateFileUpload(file, context);
  };

  const checkRateLimit = (type: 'api' | 'auth' | 'contact' | 'search', identifier: string) => {
    switch (type) {
      case 'api':
        return RateLimitMiddleware.checkApiLimit(identifier);
      case 'auth':
        return RateLimitMiddleware.checkAuthLimit(identifier);
      case 'contact':
        return RateLimitMiddleware.checkContactLimit(identifier);
      case 'search':
        return RateLimitMiddleware.checkSearchLimit(identifier);
      default:
        throw new Error('Invalid rate limit type');
    }
  };

  return {
    validateContactForm,
    validateSearchForm,
    validateAgentRegistration,
    validateFileUpload,
    checkRateLimit,
  };
}
