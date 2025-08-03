/**
 * Security utilities for Real Estate Hotspot
 * Provides input validation, sanitization, and security helpers
 */

import DOMPurify from 'isomorphic-dompurify';

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  address: /^[a-zA-Z0-9\s,.-]{5,200}$/,
  zipCode: /^[0-9]{3,10}$/,
  price: /^\d{1,12}(\.\d{0,2})?$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noHtml: /^[^<>]*$/,
} as const;

// Common XSS attack patterns to detect
export const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
] as const;

// SQL injection patterns
export const SQL_INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
  /(;|\s)(--|\#|\/\*)/gi,
  /('|(\\')|(;)|(\\";))/gi,
  /(\b(or|and)\b\s*\w*\s*(=|like|>|<))/gi,
] as const;

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Input sanitization
 */
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  }

  /**
   * Strip all HTML tags
   */
  static stripHtml(input: string): string {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSql(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  /**
   * Escape special characters for safe output
   */
  static escapeSpecialChars(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Normalize whitespace and trim
   */
  static normalizeText(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }
}

/**
 * Input validation
 */
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION_PATTERNS.email.test(email) && email.length <= 254;
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return VALIDATION_PATTERNS.phone.test(cleaned) && cleaned.length >= 10;
  }

  /**
   * Validate name (person, company, etc.)
   */
  static isValidName(name: string): boolean {
    return VALIDATION_PATTERNS.name.test(name) && name.length <= 100;
  }

  /**
   * Validate address
   */
  static isValidAddress(address: string): boolean {
    return VALIDATION_PATTERNS.address.test(address) && address.length <= 500;
  }

  /**
   * Validate price
   */
  static isValidPrice(price: string): boolean {
    return VALIDATION_PATTERNS.price.test(price) && parseFloat(price) >= 0;
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    return VALIDATION_PATTERNS.url.test(url) && url.length <= 2048;
  }

  /**
   * Check for XSS patterns
   */
  static containsXSS(input: string): boolean {
    return XSS_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Check for SQL injection patterns
   */
  static containsSQLInjection(input: string): boolean {
    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Comprehensive security check
   */
  static isSafeInput(input: string): boolean {
    return !this.containsXSS(input) && !this.containsSQLInjection(input);
  }

  /**
   * Validate file upload
   */
  static isValidFile(file: File, allowedTypes: string[], maxSize: number): boolean {
    if (file.size > maxSize) return false;
    if (!allowedTypes.includes(file.type)) return false;
    
    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1]);
    
    return extension ? allowedExtensions.includes(extension) : false;
  }
}

/**
 * Rate limiting functionality
 */
export class RateLimiter {
  /**
   * Check if request should be rate limited
   */
  static isRateLimited(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): boolean {
    const now = Date.now();
    const key = `${identifier}_${Math.floor(now / windowMs)}`;
    
    const current = rateLimitStore.get(key);
    
    if (!current) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (current.count >= maxRequests) {
      return true;
    }
    
    current.count++;
    return false;
  }

  /**
   * Get rate limit info
   */
  static getRateLimitInfo(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): { remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `${identifier}_${Math.floor(now / windowMs)}`;
    
    const current = rateLimitStore.get(key);
    
    if (!current) {
      return { remaining: maxRequests - 1, resetTime: now + windowMs };
    }
    
    return {
      remaining: Math.max(0, maxRequests - current.count),
      resetTime: current.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://www.google-analytics.com", "https://js.paystack.co"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "https:", "blob:"],
    'connect-src': ["'self'", "https://api.paystack.co", "https://*.supabase.co", "https://api.mapbox.com"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  },
  
  // Other security headers
  HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  },
} as const;

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  const directives = Object.entries(SECURITY_HEADERS.CSP)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
    
  return directives;
}

/**
 * CORS configuration
 */
export const CORS_CONFIG = {
  origin: [
    'https://realestatehotspot.com',
    'https://www.realestatehotspot.com',
    'http://localhost:3000',
    'http://localhost:8080',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
} as const;

/**
 * Security middleware configuration
 */
export const SECURITY_CONFIG = {
  rateLimit: {
    api: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 auth attempts per 15 minutes
    contact: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 contact forms per hour
    search: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 searches per minute
  },
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    httpOnly: true,
    sameSite: 'strict' as const,
  },
} as const;
