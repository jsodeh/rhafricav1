/**
 * Modern Design System Utilities
 * 
 * This module provides utilities to work with the modern design system
 * CSS custom properties and ensures consistent usage across components.
 */

export interface DesignTokens {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    neutral: Record<string, string>;
    semantic: {
      success: Record<string, string>;
      warning: Record<string, string>;
      error: Record<string, string>;
    };
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  typography: {
    fontSizes: Record<string, string>;
    fontWeights: Record<string, string>;
    lineHeights: Record<string, string>;
  };
}

/**
 * Get CSS custom property value
 */
export const getCSSCustomProperty = (property: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
};

/**
 * Set CSS custom property value
 */
export const setCSSCustomProperty = (property: string, value: string): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(property, value);
};

/**
 * Design system validation utilities
 */
export const validateDesignSystem = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const requiredProperties = [
    '--color-primary',
    '--color-secondary',
    '--spacing-4',
    '--radius-md',
    '--shadow-card',
    '--font-family-primary',
    '--font-size-base',
  ];
  
  return requiredProperties.every(property => {
    const value = getCSSCustomProperty(property);
    return value !== '';
  });
};

/**
 * Get modern color with RGB format
 */
export const getModernColor = (colorVar: string): string => {
  return `rgb(var(${colorVar}))`;
};

/**
 * Get modern color with alpha
 */
export const getModernColorWithAlpha = (colorVar: string, alpha: number): string => {
  return `rgb(var(${colorVar}) / ${alpha})`;
};

/**
 * Modern design system class names
 */
export const modernClasses = {
  // Cards
  card: 'card-modern',
  cardCompact: 'card-modern-compact',
  cardElevated: 'card-modern-elevated',
  
  // Buttons
  buttonPrimary: 'btn-modern-primary',
  buttonSecondary: 'btn-modern-secondary',
  
  // Inputs
  input: 'input-modern',
  
  // Navigation
  nav: 'nav-modern',
  navTransparent: 'nav-modern-transparent',
  
  // Modals
  modalBackdrop: 'modal-backdrop',
  modalContent: 'modal-content',
  
  // Typography
  heading: 'text-modern-heading',
  body: 'text-modern-body',
  caption: 'text-modern-caption',
  
  // Spacing
  spacingXs: 'spacing-modern-xs',
  spacingSm: 'spacing-modern-sm',
  spacingMd: 'spacing-modern-md',
  spacingLg: 'spacing-modern-lg',
  spacingXl: 'spacing-modern-xl',
  
  // Animations
  fadeIn: 'animate-modern-fade-in',
  slideUp: 'animate-modern-slide-up',
  scaleIn: 'animate-modern-scale-in',
  
  // Container
  container: 'container-modern',
} as const;

/**
 * Modern design system breakpoints
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Modern design system z-index values
 */
export const zIndex = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

/**
 * Modern design system transition durations
 */
export const transitions = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
} as const;

export default {
  getCSSCustomProperty,
  setCSSCustomProperty,
  validateDesignSystem,
  getModernColor,
  getModernColorWithAlpha,
  modernClasses,
  breakpoints,
  zIndex,
  transitions,
};