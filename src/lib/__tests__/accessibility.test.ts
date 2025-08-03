import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ScreenReaderUtils,
  FocusManager,
  ColorContrastUtils,
  InputValidator,
  InputSanitizer,
  AccessibilityValidator,
} from '../accessibility';

describe('ScreenReaderUtils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should announce messages to screen readers', () => {
    ScreenReaderUtils.announce('Test message');
    
    const announcement = document.querySelector('[aria-live="polite"]');
    expect(announcement).toBeTruthy();
    expect(announcement?.textContent).toBe('Test message');
  });

  it('should announce with assertive priority', () => {
    ScreenReaderUtils.announce('Urgent message', 'assertive');
    
    const announcement = document.querySelector('[aria-live="assertive"]');
    expect(announcement).toBeTruthy();
    expect(announcement?.textContent).toBe('Urgent message');
  });

  it('should create screen reader only text', () => {
    const element = ScreenReaderUtils.createSROnlyText('Hidden text');
    
    expect(element.className).toBe('sr-only');
    expect(element.textContent).toBe('Hidden text');
  });
});

describe('FocusManager', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <button id="btn1">Button 1</button>
        <input id="input1" type="text" />
        <a href="#" id="link1">Link 1</a>
        <button id="btn2" disabled>Disabled Button</button>
        <div id="div1" tabindex="0">Focusable Div</div>
      </div>
    `;
  });

  it('should get focusable elements', () => {
    const container = document.getElementById('container')!;
    const focusableElements = FocusManager.getFocusableElements(container);
    
    expect(focusableElements).toHaveLength(4); // btn1, input1, link1, div1 (not disabled button)
    expect(focusableElements.map(el => el.id)).toEqual(['btn1', 'input1', 'link1', 'div1']);
  });

  it('should set focus on element', () => {
    const button = document.getElementById('btn1')!;
    FocusManager.setFocus(button);
    
    expect(document.activeElement).toBe(button);
  });

  it('should manage focus stack', () => {
    const button1 = document.getElementById('btn1')!;
    const button2 = document.getElementById('input1')!;
    
    button1.focus();
    FocusManager.setFocus(button2, true);
    expect(document.activeElement).toBe(button2);
    
    FocusManager.returnFocus();
    expect(document.activeElement).toBe(button1);
  });

  it('should trap focus within container', () => {
    const container = document.getElementById('container')!;
    const cleanup = FocusManager.trapFocus(container);
    
    // Focus should be set to first focusable element
    expect(document.activeElement?.id).toBe('btn1');
    
    cleanup();
  });
});

describe('ColorContrastUtils', () => {
  it('should calculate relative luminance', () => {
    const whiteLuminance = ColorContrastUtils.getRelativeLuminance('#ffffff');
    const blackLuminance = ColorContrastUtils.getRelativeLuminance('#000000');
    
    expect(whiteLuminance).toBeCloseTo(1, 1);
    expect(blackLuminance).toBeCloseTo(0, 1);
  });

  it('should calculate contrast ratio', () => {
    const ratio = ColorContrastUtils.getContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeCloseTo(21, 0); // Maximum contrast ratio
  });

  it('should check WCAG compliance', () => {
    // High contrast - should pass AA
    expect(ColorContrastUtils.meetsWCAGStandards('#000000', '#ffffff', 'AA', 'normal')).toBe(true);
    
    // Low contrast - should fail AA
    expect(ColorContrastUtils.meetsWCAGStandards('#888888', '#999999', 'AA', 'normal')).toBe(false);
    
    // Medium contrast - should pass AA for large text
    expect(ColorContrastUtils.meetsWCAGStandards('#666666', '#ffffff', 'AA', 'large')).toBe(true);
  });
});

describe('InputValidator', () => {
  it('should validate email addresses', () => {
    expect(InputValidator.isValidEmail('test@example.com')).toBe(true);
    expect(InputValidator.isValidEmail('invalid-email')).toBe(false);
    expect(InputValidator.isValidEmail('user+tag@domain.co.uk')).toBe(true);
    expect(InputValidator.isValidEmail('')).toBe(false);
  });

  it('should validate phone numbers', () => {
    expect(InputValidator.isValidPhone('+234-123-456-7890')).toBe(true);
    expect(InputValidator.isValidPhone('(234) 123-456-7890')).toBe(true);
    expect(InputValidator.isValidPhone('234 123 456 7890')).toBe(true);
    expect(InputValidator.isValidPhone('123')).toBe(false);
    expect(InputValidator.isValidPhone('abc-def-ghij')).toBe(false);
  });

  it('should validate names', () => {
    expect(InputValidator.isValidName('John Doe')).toBe(true);
    expect(InputValidator.isValidName("Mary O'Connor")).toBe(true);
    expect(InputValidator.isValidName('Jean-Pierre')).toBe(true);
    expect(InputValidator.isValidName('123 Invalid')).toBe(false);
    expect(InputValidator.isValidName('J')).toBe(false);
  });

  it('should validate prices', () => {
    expect(InputValidator.isValidPrice('100')).toBe(true);
    expect(InputValidator.isValidPrice('100.50')).toBe(true);
    expect(InputValidator.isValidPrice('0')).toBe(true);
    expect(InputValidator.isValidPrice('-100')).toBe(false);
    expect(InputValidator.isValidPrice('abc')).toBe(false);
  });

  it('should detect XSS patterns', () => {
    expect(InputValidator.containsXSS('<script>alert("xss")</script>')).toBe(true);
    expect(InputValidator.containsXSS('javascript:alert("xss")')).toBe(true);
    expect(InputValidator.containsXSS('onclick="alert(1)"')).toBe(true);
    expect(InputValidator.containsXSS('Normal text content')).toBe(false);
  });

  it('should detect SQL injection patterns', () => {
    expect(InputValidator.containsSQLInjection("'; DROP TABLE users; --")).toBe(true);
    expect(InputValidator.containsSQLInjection('1 OR 1=1')).toBe(true);
    expect(InputValidator.containsSQLInjection('UNION SELECT * FROM users')).toBe(true);
    expect(InputValidator.containsSQLInjection('Normal search term')).toBe(false);
  });

  it('should validate file uploads', () => {
    const validImageFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const invalidFile = new File([''], 'test.exe', { type: 'application/x-executable' });
    const oversizedFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    
    expect(InputValidator.isValidFile(validImageFile, ['image/jpeg'], 5 * 1024 * 1024)).toBe(true);
    expect(InputValidator.isValidFile(invalidFile, ['image/jpeg'], 5 * 1024 * 1024)).toBe(false);
    expect(InputValidator.isValidFile(oversizedFile, ['image/jpeg'], 5 * 1024 * 1024)).toBe(false);
  });
});

describe('InputSanitizer', () => {
  it('should sanitize HTML content', () => {
    const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
    const sanitized = InputSanitizer.sanitizeHtml(maliciousHtml);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Safe content</p>');
  });

  it('should strip all HTML tags', () => {
    const htmlContent = '<p>Hello <strong>world</strong>!</p>';
    const stripped = InputSanitizer.stripHtml(htmlContent);
    
    expect(stripped).toBe('Hello world!');
  });

  it('should escape special characters', () => {
    const text = '<script>alert("test")</script>';
    const escaped = InputSanitizer.escapeSpecialChars(text);
    
    expect(escaped).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;&#x2F;script&gt;');
  });

  it('should normalize whitespace', () => {
    const text = '  Multiple   spaces\n\nand   newlines  ';
    const normalized = InputSanitizer.normalizeText(text);
    
    expect(normalized).toBe('Multiple spaces and newlines');
  });
});

describe('AccessibilityValidator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should validate form accessibility', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <label for="input1">Name</label>
        <input id="input1" type="text" required />
        <input id="input2" type="email" />
        <button type="submit">Submit</button>
      </form>
    `;
    
    const form = document.getElementById('test-form') as HTMLFormElement;
    const issues = AccessibilityValidator.validateForm(form);
    
    expect(issues).toContain('Input 2 is missing a label');
    expect(issues).toContain('Required input 1 should have error message support');
  });

  it('should validate image accessibility', () => {
    document.body.innerHTML = `
      <div id="container">
        <img src="test1.jpg" alt="Description" />
        <img src="test2.jpg" />
        <img src="test3.jpg" aria-hidden="true" />
      </div>
    `;
    
    const container = document.getElementById('container')!;
    const issues = AccessibilityValidator.validateImages(container);
    
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('Image 2 is missing alt text');
  });

  it('should validate heading structure', () => {
    document.body.innerHTML = `
      <div id="container">
        <h2>Starting with h2</h2>
        <h4>Skipping h3</h4>
        <h3>Back to h3</h3>
      </div>
    `;
    
    const container = document.getElementById('container')!;
    const issues = AccessibilityValidator.validateHeadings(container);
    
    expect(issues).toContain('Page should start with h1');
    expect(issues).toContain('Heading level skipped: H4 after h2');
  });
});

// Mock implementations for browser APIs
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn((input, options) => {
      if (options?.ALLOWED_TAGS?.length === 0) {
        return input.replace(/<[^>]*>/g, '');
      }
      return input.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }),
  },
}));
