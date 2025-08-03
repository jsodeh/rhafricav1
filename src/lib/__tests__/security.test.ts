import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  InputValidator,
  InputSanitizer,
  RateLimiter,
  generateCSPHeader,
  VALIDATION_PATTERNS,
  XSS_PATTERNS,
  SQL_INJECTION_PATTERNS,
} from '../security';

describe('InputValidator', () => {
  it('should validate email addresses correctly', () => {
    expect(InputValidator.isValidEmail('test@example.com')).toBe(true);
    expect(InputValidator.isValidEmail('user+tag@domain.co.uk')).toBe(true);
    expect(InputValidator.isValidEmail('invalid-email')).toBe(false);
    expect(InputValidator.isValidEmail('test@')).toBe(false);
    expect(InputValidator.isValidEmail('@example.com')).toBe(false);
    expect(InputValidator.isValidEmail('')).toBe(false);
    
    // Test length limit (254 characters)
    const longEmail = 'a'.repeat(250) + '@test.com';
    expect(InputValidator.isValidEmail(longEmail)).toBe(false);
  });

  it('should validate phone numbers correctly', () => {
    expect(InputValidator.isValidPhone('+234-123-456-7890')).toBe(true);
    expect(InputValidator.isValidPhone('(234) 123 456 7890')).toBe(true);
    expect(InputValidator.isValidPhone('234.123.456.7890')).toBe(true);
    expect(InputValidator.isValidPhone('12345678901')).toBe(true);
    expect(InputValidator.isValidPhone('123')).toBe(false); // Too short
    expect(InputValidator.isValidPhone('abc-def-ghij')).toBe(false);
    expect(InputValidator.isValidPhone('')).toBe(false);
  });

  it('should validate names correctly', () => {
    expect(InputValidator.isValidName('John Doe')).toBe(true);
    expect(InputValidator.isValidName("Mary O'Connor")).toBe(true);
    expect(InputValidator.isValidName('Jean-Pierre')).toBe(true);
    expect(InputValidator.isValidName('José María')).toBe(true);
    expect(InputValidator.isValidName('J')).toBe(false); // Too short
    expect(InputValidator.isValidName('123 Name')).toBe(false);
    expect(InputValidator.isValidName('Name@123')).toBe(false);
    expect(InputValidator.isValidName('A'.repeat(101))).toBe(false); // Too long
  });

  it('should validate addresses correctly', () => {
    expect(InputValidator.isValidAddress('123 Main St, City, State')).toBe(true);
    expect(InputValidator.isValidAddress('Apt 4B, 567 Oak Avenue')).toBe(true);
    expect(InputValidator.isValidAddress('Rural Route 1, Box 123')).toBe(true);
    expect(InputValidator.isValidAddress('123')).toBe(false); // Too short
    expect(InputValidator.isValidAddress('A'.repeat(501))).toBe(false); // Too long
  });

  it('should validate prices correctly', () => {
    expect(InputValidator.isValidPrice('100')).toBe(true);
    expect(InputValidator.isValidPrice('100.50')).toBe(true);
    expect(InputValidator.isValidPrice('0')).toBe(true);
    expect(InputValidator.isValidPrice('999999999999')).toBe(true);
    expect(InputValidator.isValidPrice('-100')).toBe(false);
    expect(InputValidator.isValidPrice('abc')).toBe(false);
    expect(InputValidator.isValidPrice('100.123')).toBe(false); // Too many decimals
    expect(InputValidator.isValidPrice('')).toBe(false);
  });

  it('should validate URLs correctly', () => {
    expect(InputValidator.isValidUrl('https://example.com')).toBe(true);
    expect(InputValidator.isValidUrl('http://test.org/path?query=1')).toBe(true);
    expect(InputValidator.isValidUrl('https://sub.domain.com:8080/path')).toBe(true);
    expect(InputValidator.isValidUrl('ftp://example.com')).toBe(false);
    expect(InputValidator.isValidUrl('not-a-url')).toBe(false);
    expect(InputValidator.isValidUrl('')).toBe(false);
    
    // Test length limit
    const longUrl = 'https://' + 'a'.repeat(2050) + '.com';
    expect(InputValidator.isValidUrl(longUrl)).toBe(false);
  });

  it('should detect XSS patterns', () => {
    expect(InputValidator.containsXSS('<script>alert("xss")</script>')).toBe(true);
    expect(InputValidator.containsXSS('javascript:alert("xss")')).toBe(true);
    expect(InputValidator.containsXSS('<img src=x onerror=alert(1)>')).toBe(true);
    expect(InputValidator.containsXSS('<iframe src="evil.com"></iframe>')).toBe(true);
    expect(InputValidator.containsXSS('<object data="evil.swf"></object>')).toBe(true);
    expect(InputValidator.containsXSS('<form action="evil.com"></form>')).toBe(true);
    expect(InputValidator.containsXSS('Normal text content')).toBe(false);
    expect(InputValidator.containsXSS('Text with <b>bold</b> tags')).toBe(false);
  });

  it('should detect SQL injection patterns', () => {
    expect(InputValidator.containsSQLInjection("'; DROP TABLE users; --")).toBe(true);
    expect(InputValidator.containsSQLInjection('1 OR 1=1')).toBe(true);
    expect(InputValidator.containsSQLInjection('UNION SELECT * FROM users')).toBe(true);
    expect(InputValidator.containsSQLInjection('admin\' --')).toBe(true);
    expect(InputValidator.containsSQLInjection('1; INSERT INTO')).toBe(true);
    expect(InputValidator.containsSQLInjection('Normal search term')).toBe(false);
    expect(InputValidator.containsSQLInjection('Search for "quotes"')).toBe(false);
  });

  it('should perform comprehensive security checks', () => {
    expect(InputValidator.isSafeInput('Normal input text')).toBe(true);
    expect(InputValidator.isSafeInput('<script>alert(1)</script>')).toBe(false);
    expect(InputValidator.isSafeInput("'; DROP TABLE users")).toBe(false);
    expect(InputValidator.isSafeInput('Safe text with numbers 123')).toBe(true);
  });

  it('should validate file uploads', () => {
    const validImage = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
    const validPdf = new File(['pdf data'], 'document.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['exe data'], 'virus.exe', { type: 'application/x-executable' });
    const oversizedFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    expect(InputValidator.isValidFile(validImage, allowedTypes, maxSize)).toBe(true);
    expect(InputValidator.isValidFile(validPdf, allowedTypes, maxSize)).toBe(true);
    expect(InputValidator.isValidFile(invalidFile, allowedTypes, maxSize)).toBe(false);
    expect(InputValidator.isValidFile(oversizedFile, allowedTypes, maxSize)).toBe(false);
  });
});

describe('InputSanitizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize HTML content', () => {
    const mockSanitize = vi.fn().mockReturnValue('<p>Safe content</p>');
    vi.doMock('isomorphic-dompurify', () => ({
      default: { sanitize: mockSanitize }
    }));
    
    const result = InputSanitizer.sanitizeHtml('<script>alert("xss")</script><p>Safe content</p>');
    expect(mockSanitize).toHaveBeenCalled();
  });

  it('should strip all HTML tags', () => {
    const htmlContent = '<p>Hello <strong>world</strong>!</p><script>alert(1)</script>';
    const result = InputSanitizer.stripHtml(htmlContent);
    
    // Should remove all tags
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('should sanitize SQL input', () => {
    const sqlInput = "test'; DROP TABLE users; --";
    const sanitized = InputSanitizer.sanitizeSql(sqlInput);
    
    expect(sanitized).not.toContain(';');
    expect(sanitized).not.toContain('--');
    expect(sanitized).toContain("test''"); // Single quotes should be escaped
  });

  it('should escape special characters', () => {
    const text = '<script>alert("test")</script>';
    const escaped = InputSanitizer.escapeSpecialChars(text);
    
    expect(escaped).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;&#x2F;script&gt;');
    expect(escaped).not.toContain('<');
    expect(escaped).not.toContain('>');
    expect(escaped).not.toContain('"');
  });

  it('should normalize whitespace and trim', () => {
    const text = '  Multiple   spaces\n\nand\ttabs  ';
    const normalized = InputSanitizer.normalizeText(text);
    
    expect(normalized).toBe('Multiple spaces and tabs');
    expect(normalized).not.toMatch(/\s{2,}/); // No multiple spaces
    expect(normalized.trim()).toBe(normalized); // No leading/trailing spaces
  });
});

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear rate limit store
    RateLimiter.cleanup();
  });

  afterEach(() => {
    RateLimiter.cleanup();
  });

  it('should allow requests within limit', () => {
    const identifier = 'test-user';
    const maxRequests = 5;
    const windowMs = 60000; // 1 minute
    
    // First 5 requests should be allowed
    for (let i = 0; i < maxRequests; i++) {
      expect(RateLimiter.isRateLimited(identifier, maxRequests, windowMs)).toBe(false);
    }
    
    // 6th request should be rate limited
    expect(RateLimiter.isRateLimited(identifier, maxRequests, windowMs)).toBe(true);
  });

  it('should provide rate limit info', () => {
    const identifier = 'test-user';
    const maxRequests = 3;
    const windowMs = 60000;
    
    // Make 2 requests
    RateLimiter.isRateLimited(identifier, maxRequests, windowMs);
    RateLimiter.isRateLimited(identifier, maxRequests, windowMs);
    
    const info = RateLimiter.getRateLimitInfo(identifier, maxRequests, windowMs);
    expect(info.remaining).toBe(1);
    expect(info.resetTime).toBeGreaterThan(Date.now());
  });

  it('should reset limits after time window', () => {
    const identifier = 'test-user';
    const maxRequests = 2;
    const windowMs = 100; // Very short window for testing
    
    // Exhaust the limit
    expect(RateLimiter.isRateLimited(identifier, maxRequests, windowMs)).toBe(false);
    expect(RateLimiter.isRateLimited(identifier, maxRequests, windowMs)).toBe(false);
    expect(RateLimiter.isRateLimited(identifier, maxRequests, windowMs)).toBe(true);
    
    // Wait for window to reset
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(RateLimiter.isRateLimited(identifier, maxRequests, windowMs)).toBe(false);
        resolve();
      }, windowMs + 10);
    });
  });

  it('should handle different identifiers separately', () => {
    const maxRequests = 2;
    const windowMs = 60000;
    
    // Exhaust limit for user1
    expect(RateLimiter.isRateLimited('user1', maxRequests, windowMs)).toBe(false);
    expect(RateLimiter.isRateLimited('user1', maxRequests, windowMs)).toBe(false);
    expect(RateLimiter.isRateLimited('user1', maxRequests, windowMs)).toBe(true);
    
    // user2 should still have full limit
    expect(RateLimiter.isRateLimited('user2', maxRequests, windowMs)).toBe(false);
    expect(RateLimiter.isRateLimited('user2', maxRequests, windowMs)).toBe(false);
  });

  it('should cleanup expired entries', () => {
    const identifier = 'test-user';
    const maxRequests = 1;
    const windowMs = 50;
    
    // Make a request
    RateLimiter.isRateLimited(identifier, maxRequests, windowMs);
    
    // Wait for expiration and cleanup
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        RateLimiter.cleanup();
        // Should be able to make request again after cleanup
        expect(RateLimiter.isRateLimited(identifier, maxRequests, windowMs)).toBe(false);
        resolve();
      }, windowMs + 10);
    });
  });
});

describe('generateCSPHeader', () => {
  it('should generate valid CSP header string', () => {
    const csp = generateCSPHeader();
    
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: https: blob:");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it('should include all required directives', () => {
    const csp = generateCSPHeader();
    
    const requiredDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'font-src',
      'img-src',
      'connect-src',
      'frame-src',
      'object-src',
      'base-uri',
      'form-action',
      'frame-ancestors',
      'upgrade-insecure-requests'
    ];
    
    requiredDirectives.forEach(directive => {
      expect(csp).toContain(directive);
    });
  });
});

describe('VALIDATION_PATTERNS', () => {
  it('should have correct regex patterns', () => {
    expect(VALIDATION_PATTERNS.email.test('test@example.com')).toBe(true);
    expect(VALIDATION_PATTERNS.email.test('invalid-email')).toBe(false);
    
    expect(VALIDATION_PATTERNS.phone.test('+1234567890')).toBe(true);
    expect(VALIDATION_PATTERNS.phone.test('abc')).toBe(false);
    
    expect(VALIDATION_PATTERNS.name.test('John Doe')).toBe(true);
    expect(VALIDATION_PATTERNS.name.test('123')).toBe(false);
    
    expect(VALIDATION_PATTERNS.price.test('100.50')).toBe(true);
    expect(VALIDATION_PATTERNS.price.test('-100')).toBe(false);
    
    expect(VALIDATION_PATTERNS.url.test('https://example.com')).toBe(true);
    expect(VALIDATION_PATTERNS.url.test('not-a-url')).toBe(false);
    
    expect(VALIDATION_PATTERNS.uuid.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(VALIDATION_PATTERNS.uuid.test('not-a-uuid')).toBe(false);
  });
});

describe('XSS_PATTERNS', () => {
  it('should detect common XSS patterns', () => {
    const xssTests = [
      '<script>alert(1)</script>',
      'javascript:alert(1)',
      '<img onerror=alert(1) src=x>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<object data="evil.swf"></object>',
      '<embed src="evil.swf">',
      '<form action="evil.com"></form>'
    ];
    
    xssTests.forEach(test => {
      const isDetected = XSS_PATTERNS.some(pattern => pattern.test(test));
      expect(isDetected).toBe(true);
    });
    
    // Safe content should not be detected
    expect(XSS_PATTERNS.some(pattern => pattern.test('Safe content'))).toBe(false);
  });
});

describe('SQL_INJECTION_PATTERNS', () => {
  it('should detect common SQL injection patterns', () => {
    const sqlTests = [
      "'; DROP TABLE users; --",
      '1 OR 1=1',
      'UNION SELECT * FROM users',
      'admin\' --',
      '1; INSERT INTO users'
    ];
    
    sqlTests.forEach(test => {
      const isDetected = SQL_INJECTION_PATTERNS.some(pattern => pattern.test(test));
      expect(isDetected).toBe(true);
    });
    
    // Safe content should not be detected
    expect(SQL_INJECTION_PATTERNS.some(pattern => pattern.test('Normal search'))).toBe(false);
  });
});

// Mock DOMPurify
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn((input: string, options?: any) => {
      if (options?.ALLOWED_TAGS?.length === 0) {
        return input.replace(/<[^>]*>/g, '');
      }
      // Basic sanitization for testing
      return input.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }),
  },
}));
