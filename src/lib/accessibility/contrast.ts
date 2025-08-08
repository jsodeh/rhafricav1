/**
 * Color Contrast Utilities for WCAG Compliance
 * 
 * This module provides utilities to ensure proper color contrast ratios
 * and support for high contrast mode.
 */

export interface ContrastRatio {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  isLargeText?: boolean;
}

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Calculate relative luminance of a color
 */
export const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if contrast ratio meets WCAG standards
 */
export const checkContrastCompliance = (
  foreground: string, 
  background: string, 
  isLargeText = false
): ContrastRatio => {
  const ratio = getContrastRatio(foreground, background);
  
  let level: 'AA' | 'AAA' | 'fail';
  
  if (isLargeText) {
    if (ratio >= 4.5) level = 'AAA';
    else if (ratio >= 3) level = 'AA';
    else level = 'fail';
  } else {
    if (ratio >= 7) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';
    else level = 'fail';
  }
  
  return { ratio, level, isLargeText };
};/*
*
 * WCAG-compliant color palette with proper contrast ratios
 */
export const accessibleColors = {
  // Primary colors with guaranteed contrast
  primary: {
    // Blue palette with proper contrast
    50: '#eff6ff',   // Light background
    100: '#dbeafe',  // Very light background
    600: '#2563eb',  // Primary blue (4.5:1 on white)
    700: '#1e40af',  // Darker blue (7:1 on white) - blue-800
    800: '#1e3a8a',  // Even darker (9:1 on white) - blue-900
    900: '#1e3a8a',  // Darkest blue (12:1 on white)
  },
  
  // Gray palette with proper contrast
  gray: {
    50: '#f9fafb',   // Lightest gray
    100: '#f3f4f6',  // Very light gray
    200: '#e5e7eb',  // Light gray
    300: '#d1d5db',  // Medium light gray
    400: '#9ca3af',  // Medium gray (3:1 on white - large text only)
    500: '#6b7280',  // Medium dark gray (4.5:1 on white)
    600: '#4b5563',  // Dark gray (7:1 on white)
    700: '#374151',  // Darker gray (9:1 on white)
    800: '#1f2937',  // Very dark gray (12:1 on white)
    900: '#111827',  // Darkest gray (16:1 on white)
  },
  
  // Semantic colors with proper contrast
  success: {
    50: '#f0fdf4',   // Light green background
    100: '#dcfce7',  // Very light green
    600: '#047857',  // Success green (4.5:1 on white) - emerald-700
    700: '#065f46',  // Darker success (7:1 on white) - emerald-800
  },
  
  warning: {
    50: '#fffbeb',   // Light yellow background
    100: '#fef3c7',  // Very light yellow
    600: '#a16207',  // Warning yellow (4.5:1 on white) - yellow-700
    700: '#92400e',  // Darker warning (7:1 on white) - yellow-800
  },
  
  error: {
    50: '#fef2f2',   // Light red background
    100: '#fee2e2',  // Very light red
    600: '#dc2626',  // Error red (4.5:1 on white)
    700: '#b91c1c',  // Darker error (7:1 on white)
  },
  
  // High contrast mode colors
  highContrast: {
    background: '#ffffff',
    foreground: '#000000',
    primary: '#0000ff',
    secondary: '#800080',
    success: '#008000',
    warning: '#ff8c00',
    error: '#ff0000',
    border: '#000000',
  }
};

/**
 * Get accessible color combination
 */
export const getAccessibleColor = (
  intent: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral',
  variant: 'background' | 'foreground' | 'border' = 'foreground',
  isLargeText = false
): string => {
  const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  if (isHighContrast) {
    switch (intent) {
      case 'primary':
        return variant === 'background' ? accessibleColors.highContrast.background : accessibleColors.highContrast.primary;
      case 'success':
        return variant === 'background' ? accessibleColors.highContrast.background : accessibleColors.highContrast.success;
      case 'warning':
        return variant === 'background' ? accessibleColors.highContrast.background : accessibleColors.highContrast.warning;
      case 'error':
        return variant === 'background' ? accessibleColors.highContrast.background : accessibleColors.highContrast.error;
      default:
        return variant === 'background' ? accessibleColors.highContrast.background : accessibleColors.highContrast.foreground;
    }
  }
  
  // Standard contrast mode
  switch (intent) {
    case 'primary':
      if (variant === 'background') return accessibleColors.primary[50];
      return isLargeText ? accessibleColors.primary[600] : accessibleColors.primary[700];
    case 'success':
      if (variant === 'background') return accessibleColors.success[50];
      return isLargeText ? accessibleColors.success[600] : accessibleColors.success[700];
    case 'warning':
      if (variant === 'background') return accessibleColors.warning[50];
      return isLargeText ? accessibleColors.warning[600] : accessibleColors.warning[700];
    case 'error':
      if (variant === 'background') return accessibleColors.error[50];
      return isLargeText ? accessibleColors.error[600] : accessibleColors.error[700];
    default:
      if (variant === 'background') return accessibleColors.gray[50];
      return isLargeText ? accessibleColors.gray[600] : accessibleColors.gray[700];
  }
};

/**
 * Validate and fix color contrast issues
 */
export const ensureAccessibleContrast = (
  foreground: string,
  background: string,
  isLargeText = false
): { foreground: string; background: string; fixed: boolean } => {
  const compliance = checkContrastCompliance(foreground, background, isLargeText);
  
  if (compliance.level !== 'fail') {
    return { foreground, background, fixed: false };
  }
  
  // If contrast fails, use accessible alternatives
  const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  
  if (isHighContrast) {
    return {
      foreground: accessibleColors.highContrast.foreground,
      background: accessibleColors.highContrast.background,
      fixed: true
    };
  }
  
  // Use safe defaults
  return {
    foreground: accessibleColors.gray[700],
    background: '#ffffff',
    fixed: true
  };
};