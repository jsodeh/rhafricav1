import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  hexToRgb, 
  getLuminance, 
  getContrastRatio, 
  checkContrastCompliance,
  accessibleColors,
  getAccessibleColor,
  ensureAccessibleContrast
} from '../accessibility/contrast';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Color Contrast Utilities', () => {
  describe('hexToRgb', () => {
    it('should convert hex colors to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#1d4ed8')).toEqual({ r: 29, g: 78, b: 216 });
    });

    it('should handle hex colors without #', () => {
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
    });
  });

  describe('getLuminance', () => {
    it('should calculate correct luminance for white', () => {
      const luminance = getLuminance(255, 255, 255);
      expect(luminance).toBeCloseTo(1, 2);
    });

    it('should calculate correct luminance for black', () => {
      const luminance = getLuminance(0, 0, 0);
      expect(luminance).toBeCloseTo(0, 2);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratio for black on white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate correct contrast ratio for blue-800 on white', () => {
      const ratio = getContrastRatio('#1e40af', '#ffffff');
      expect(ratio).toBeGreaterThan(7); // Should meet AAA standard
    });

    it('should calculate correct contrast ratio for gray-600 on white', () => {
      const ratio = getContrastRatio('#4b5563', '#ffffff');
      expect(ratio).toBeGreaterThan(4.5); // Should meet AA standard
    });
  });

  describe('checkContrastCompliance', () => {
    it('should pass AAA for high contrast combinations', () => {
      const result = checkContrastCompliance('#000000', '#ffffff');
      expect(result.level).toBe('AAA');
      expect(result.ratio).toBeCloseTo(21, 0);
    });

    it('should pass AA for medium contrast combinations', () => {
      const result = checkContrastCompliance('#4b5563', '#ffffff'); // gray-600
      expect(result.level).toBe('AAA'); // This actually meets AAA
      expect(result.ratio).toBeGreaterThan(4.5);
    });

    it('should fail for low contrast combinations', () => {
      const result = checkContrastCompliance('#9ca3af', '#ffffff'); // gray-400
      expect(result.level).toBe('fail');
      expect(result.ratio).toBeLessThan(4.5);
    });

    it('should have different standards for large text', () => {
      const normalText = checkContrastCompliance('#6b7280', '#ffffff', false); // gray-500
      const largeText = checkContrastCompliance('#6b7280', '#ffffff', true);
      
      expect(normalText.level).toBe('AA'); // gray-500 actually passes AA
      expect(largeText.level).toBe('AAA'); // Large text gets AAA for gray-500
    });
  });

  describe('accessibleColors', () => {
    it('should have proper contrast ratios for primary colors', () => {
      const primaryContrast = getContrastRatio(accessibleColors.primary[700], '#ffffff');
      expect(primaryContrast).toBeGreaterThan(7); // AAA compliance
    });

    it('should have proper contrast ratios for gray colors', () => {
      const grayContrast = getContrastRatio(accessibleColors.gray[600], '#ffffff');
      expect(grayContrast).toBeGreaterThan(4.5); // AA compliance
    });

    it('should have proper contrast ratios for semantic colors', () => {
      const successContrast = getContrastRatio(accessibleColors.success[600], '#ffffff');
      const warningContrast = getContrastRatio(accessibleColors.warning[600], '#ffffff');
      const errorContrast = getContrastRatio(accessibleColors.error[600], '#ffffff');
      
      expect(successContrast).toBeGreaterThan(4.5);
      expect(warningContrast).toBeGreaterThan(4.5);
      expect(errorContrast).toBeGreaterThan(4.5);
    });
  });

  describe('getAccessibleColor', () => {
    it('should return appropriate colors for different intents', () => {
      const primaryColor = getAccessibleColor('primary');
      const successColor = getAccessibleColor('success');
      const errorColor = getAccessibleColor('error');
      
      expect(primaryColor).toBe(accessibleColors.primary[700]);
      expect(successColor).toBe(accessibleColors.success[700]);
      expect(errorColor).toBe(accessibleColors.error[700]);
    });

    it('should return lighter colors for large text', () => {
      const normalText = getAccessibleColor('primary', 'foreground', false);
      const largeText = getAccessibleColor('primary', 'foreground', true);
      
      expect(normalText).toBe(accessibleColors.primary[700]);
      expect(largeText).toBe(accessibleColors.primary[600]);
    });

    it('should return background colors when requested', () => {
      const backgroundColor = getAccessibleColor('primary', 'background');
      expect(backgroundColor).toBe(accessibleColors.primary[50]);
    });
  });

  describe('ensureAccessibleContrast', () => {
    it('should not modify compliant color combinations', () => {
      const result = ensureAccessibleContrast('#1d4ed8', '#ffffff');
      expect(result.fixed).toBe(false);
      expect(result.foreground).toBe('#1d4ed8');
      expect(result.background).toBe('#ffffff');
    });

    it('should fix non-compliant color combinations', () => {
      const result = ensureAccessibleContrast('#9ca3af', '#ffffff'); // gray-400 fails
      expect(result.fixed).toBe(true);
      expect(result.foreground).toBe(accessibleColors.gray[700]);
      expect(result.background).toBe('#ffffff');
    });
  });
});

describe('WCAG Compliance Tests', () => {
  const testColors = [
    { name: 'Primary Blue 700', color: '#1e40af', expectedLevel: 'AAA' },
    { name: 'Primary Blue 600', color: '#2563eb', expectedLevel: 'AA' },
    { name: 'Gray 700', color: '#374151', expectedLevel: 'AAA' },
    { name: 'Gray 600', color: '#4b5563', expectedLevel: 'AAA' }, // Actually meets AAA
    { name: 'Success Green 600', color: '#047857', expectedLevel: 'AA' },
    { name: 'Warning Yellow 600', color: '#a16207', expectedLevel: 'AA' },
    { name: 'Error Red 600', color: '#dc2626', expectedLevel: 'AA' },
  ];

  testColors.forEach(({ name, color, expectedLevel }) => {
    it(`${name} should meet ${expectedLevel} contrast standards on white background`, () => {
      const result = checkContrastCompliance(color, '#ffffff');
      expect(result.level).toBe(expectedLevel);
    });
  });

  it('should ensure all text colors meet minimum contrast requirements', () => {
    const textColors = [
      accessibleColors.gray[600], // Muted text
      accessibleColors.gray[700], // Subtle text
      accessibleColors.primary[700], // Link text
      accessibleColors.success[600], // Success text
      accessibleColors.warning[600], // Warning text
      accessibleColors.error[600], // Error text
    ];

    textColors.forEach(color => {
      const ratio = getContrastRatio(color, '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(4.5); // AA compliance minimum
    });
  });
});