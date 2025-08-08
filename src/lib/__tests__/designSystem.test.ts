import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getCSSCustomProperty, 
  setCSSCustomProperty, 
  validateDesignSystem,
  getModernColor,
  getModernColorWithAlpha,
  modernClasses,
  breakpoints,
  zIndex,
  transitions
} from '../designSystem';

// Mock DOM environment
const mockGetComputedStyle = (element: Element) => ({
  getPropertyValue: (property: string) => {
    const mockValues: Record<string, string> = {
      '--color-primary': '29 78 216',
      '--color-secondary': '245 158 11',
      '--spacing-4': '1rem',
      '--radius-md': '0.5rem',
      '--shadow-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '--font-family-primary': 'Inter, sans-serif',
      '--font-size-base': '1rem',
    };
    return mockValues[property] || '';
  }
});

// Mock document and window
Object.defineProperty(global, 'window', {
  value: {
    getComputedStyle: mockGetComputedStyle,
  },
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    documentElement: {
      style: {
        setProperty: (property: string, value: string) => {
          // Mock implementation
        }
      }
    }
  },
  writable: true,
});

describe('Design System Utilities', () => {
  describe('getCSSCustomProperty', () => {
    it('should return CSS custom property value', () => {
      const value = getCSSCustomProperty('--color-primary');
      expect(value).toBe('29 78 216');
    });

    it('should return empty string for non-existent property', () => {
      const value = getCSSCustomProperty('--non-existent');
      expect(value).toBe('');
    });
  });

  describe('getModernColor', () => {
    it('should return RGB color format', () => {
      const color = getModernColor('--color-primary');
      expect(color).toBe('rgb(var(--color-primary))');
    });
  });

  describe('getModernColorWithAlpha', () => {
    it('should return RGB color with alpha', () => {
      const color = getModernColorWithAlpha('--color-primary', 0.5);
      expect(color).toBe('rgb(var(--color-primary) / 0.5)');
    });
  });

  describe('validateDesignSystem', () => {
    it('should validate that required CSS properties exist', () => {
      const isValid = validateDesignSystem();
      expect(isValid).toBe(true);
    });
  });

  describe('modernClasses', () => {
    it('should provide correct class names', () => {
      expect(modernClasses.card).toBe('card-modern');
      expect(modernClasses.buttonPrimary).toBe('btn-modern-primary');
      expect(modernClasses.input).toBe('input-modern');
    });
  });

  describe('breakpoints', () => {
    it('should provide correct breakpoint values', () => {
      expect(breakpoints.sm).toBe('640px');
      expect(breakpoints.md).toBe('768px');
      expect(breakpoints.lg).toBe('1024px');
    });
  });

  describe('zIndex', () => {
    it('should provide correct z-index values', () => {
      expect(zIndex.dropdown).toBe(10);
      expect(zIndex.modal).toBe(50);
      expect(zIndex.tooltip).toBe(70);
    });
  });

  describe('transitions', () => {
    it('should provide correct transition durations', () => {
      expect(transitions.fast).toBe('150ms');
      expect(transitions.normal).toBe('250ms');
      expect(transitions.slow).toBe('350ms');
    });
  });
});