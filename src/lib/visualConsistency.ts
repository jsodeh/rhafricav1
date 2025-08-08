/**
 * Visual Consistency Validation and Utilities
 * 
 * This module provides utilities to ensure visual consistency across the application
 * by validating design system usage and providing consistent styling helpers.
 */

export interface ConsistencyReport {
  isConsistent: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Validate that all required design system CSS variables are available
 */
export const validateDesignSystem = (): ConsistencyReport => {
  const report: ConsistencyReport = {
    isConsistent: true,
    issues: [],
    recommendations: []
  };

  if (typeof window === 'undefined') {
    return report;
  }

  const requiredVariables = [
    // Colors
    '--color-primary',
    '--color-primary-50',
    '--color-primary-600',
    '--color-primary-700',
    '--color-secondary',
    '--color-gray-50',
    '--color-gray-100',
    '--color-gray-900',
    '--color-success',
    '--color-warning',
    '--color-error',
    
    // Spacing
    '--spacing-1',
    '--spacing-2',
    '--spacing-4',
    '--spacing-6',
    '--spacing-8',
    '--spacing-12',
    '--spacing-16',
    
    // Border radius
    '--radius-sm',
    '--radius-md',
    '--radius-lg',
    '--radius-xl',
    
    // Shadows
    '--shadow-card',
    '--shadow-card-hover',
    '--shadow-card-elevated',
    
    // Typography
    '--font-family-primary',
    '--font-size-base',
    '--font-size-sm',
    '--font-size-lg',
    '--font-weight-normal',
    '--font-weight-medium',
    '--font-weight-semibold',
    '--line-height-normal',
    '--line-height-tight',
    
    // Component heights
    '--button-height-sm',
    '--button-height-md',
    '--button-height-lg',
    '--input-height',
  ];

  const computedStyle = getComputedStyle(document.documentElement);

  requiredVariables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim();
    if (!value) {
      report.isConsistent = false;
      report.issues.push(`Missing CSS variable: ${variable}`);
    }
  });

  if (report.issues.length > 0) {
    report.recommendations.push('Ensure all design system CSS variables are properly defined in src/index.css');
  }

  return report;
};

/**
 * Validate consistent spacing usage across elements
 */
export const validateSpacing = (element: HTMLElement): ConsistencyReport => {
  const report: ConsistencyReport = {
    isConsistent: true,
    issues: [],
    recommendations: []
  };

  const computedStyle = getComputedStyle(element);
  const margin = computedStyle.margin;
  const padding = computedStyle.padding;

  // Check if spacing uses design system values
  const validSpacingValues = ['0px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '64px'];
  
  const marginValues = margin.split(' ').filter(v => v !== '0px');
  const paddingValues = padding.split(' ').filter(v => v !== '0px');

  [...marginValues, ...paddingValues].forEach(value => {
    if (!validSpacingValues.includes(value) && !value.includes('var(--spacing')) {
      report.isConsistent = false;
      report.issues.push(`Non-standard spacing value: ${value}`);
    }
  });

  if (report.issues.length > 0) {
    report.recommendations.push('Use design system spacing values (4px increments) or CSS custom properties');
  }

  return report;
};

/**
 * Validate consistent color usage
 */
export const validateColors = (element: HTMLElement): ConsistencyReport => {
  const report: ConsistencyReport = {
    isConsistent: true,
    issues: [],
    recommendations: []
  };

  const computedStyle = getComputedStyle(element);
  const color = computedStyle.color;
  const backgroundColor = computedStyle.backgroundColor;
  const borderColor = computedStyle.borderColor;

  // Check if colors use design system values
  const colorValues = [color, backgroundColor, borderColor].filter(c => c && c !== 'rgba(0, 0, 0, 0)');

  colorValues.forEach(colorValue => {
    // Allow transparent and inherit
    if (colorValue === 'transparent' || colorValue === 'inherit') return;
    
    // Check if color uses CSS custom properties or standard design system colors
    if (!colorValue.includes('var(--color') && !colorValue.includes('rgb(')) {
      report.isConsistent = false;
      report.issues.push(`Non-standard color value: ${colorValue}`);
    }
  });

  if (report.issues.length > 0) {
    report.recommendations.push('Use design system color variables or RGB values from the color palette');
  }

  return report;
};

/**
 * Validate consistent typography
 */
export const validateTypography = (element: HTMLElement): ConsistencyReport => {
  const report: ConsistencyReport = {
    isConsistent: true,
    issues: [],
    recommendations: []
  };

  const computedStyle = getComputedStyle(element);
  const fontFamily = computedStyle.fontFamily;
  const fontSize = computedStyle.fontSize;
  const fontWeight = computedStyle.fontWeight;
  const lineHeight = computedStyle.lineHeight;

  // Check font family
  if (!fontFamily.includes('Inter') && !fontFamily.includes('var(--font-family-primary)')) {
    report.isConsistent = false;
    report.issues.push(`Non-standard font family: ${fontFamily}`);
  }

  // Check font size (should be from design system scale)
  const validFontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
  if (!validFontSizes.includes(fontSize) && !fontSize.includes('var(--font-size')) {
    report.isConsistent = false;
    report.issues.push(`Non-standard font size: ${fontSize}`);
  }

  // Check font weight
  const validFontWeights = ['400', '500', '600', '700'];
  if (!validFontWeights.includes(fontWeight) && !fontWeight.includes('var(--font-weight')) {
    report.isConsistent = false;
    report.issues.push(`Non-standard font weight: ${fontWeight}`);
  }

  if (report.issues.length > 0) {
    report.recommendations.push('Use design system typography scale and font weights');
  }

  return report;
};

/**
 * Validate consistent border radius usage
 */
export const validateBorderRadius = (element: HTMLElement): ConsistencyReport => {
  const report: ConsistencyReport = {
    isConsistent: true,
    issues: [],
    recommendations: []
  };

  const computedStyle = getComputedStyle(element);
  const borderRadius = computedStyle.borderRadius;

  if (borderRadius && borderRadius !== '0px') {
    const validRadiusValues = ['4px', '8px', '12px', '16px', '9999px'];
    if (!validRadiusValues.includes(borderRadius) && !borderRadius.includes('var(--radius')) {
      report.isConsistent = false;
      report.issues.push(`Non-standard border radius: ${borderRadius}`);
    }
  }

  if (report.issues.length > 0) {
    report.recommendations.push('Use design system border radius values (4px, 8px, 12px, 16px, or full)');
  }

  return report;
};

/**
 * Validate consistent shadow usage
 */
export const validateShadows = (element: HTMLElement): ConsistencyReport => {
  const report: ConsistencyReport = {
    isConsistent: true,
    issues: [],
    recommendations: []
  };

  const computedStyle = getComputedStyle(element);
  const boxShadow = computedStyle.boxShadow;

  if (boxShadow && boxShadow !== 'none') {
    // Check if shadow uses design system values
    if (!boxShadow.includes('var(--shadow') && !boxShadow.includes('rgba(0, 0, 0, 0.1)')) {
      report.isConsistent = false;
      report.issues.push(`Non-standard box shadow: ${boxShadow}`);
    }
  }

  if (report.issues.length > 0) {
    report.recommendations.push('Use design system shadow variables for consistent elevation');
  }

  return report;
};

/**
 * Comprehensive consistency check for an element
 */
export const validateElementConsistency = (element: HTMLElement): ConsistencyReport => {
  const reports = [
    validateSpacing(element),
    validateColors(element),
    validateTypography(element),
    validateBorderRadius(element),
    validateShadows(element)
  ];

  const combinedReport: ConsistencyReport = {
    isConsistent: reports.every(r => r.isConsistent),
    issues: reports.flatMap(r => r.issues),
    recommendations: [...new Set(reports.flatMap(r => r.recommendations))]
  };

  return combinedReport;
};

/**
 * Scan entire page for consistency issues
 */
export const validatePageConsistency = (): ConsistencyReport => {
  const report: ConsistencyReport = {
    isConsistent: true,
    issues: [],
    recommendations: []
  };

  if (typeof window === 'undefined') {
    return report;
  }

  // First validate design system is loaded
  const designSystemReport = validateDesignSystem();
  if (!designSystemReport.isConsistent) {
    report.isConsistent = false;
    report.issues.push(...designSystemReport.issues);
    report.recommendations.push(...designSystemReport.recommendations);
  }

  // Validate key elements
  const keySelectors = [
    'button',
    '.card',
    '.btn',
    'input',
    'h1, h2, h3, h4, h5, h6',
    '.property-card',
    '.nav',
    '.modal'
  ];

  keySelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        const elementReport = validateElementConsistency(element);
        if (!elementReport.isConsistent) {
          report.isConsistent = false;
          report.issues.push(`${selector}: ${elementReport.issues.join(', ')}`);
          report.recommendations.push(...elementReport.recommendations);
        }
      }
    });
  });

  // Remove duplicate recommendations
  report.recommendations = [...new Set(report.recommendations)];

  return report;
};

/**
 * Apply consistent styling to an element
 */
export const applyConsistentStyling = (element: HTMLElement, type: 'button' | 'card' | 'input' | 'text'): void => {
  switch (type) {
    case 'button':
      element.classList.add('btn-modern-primary', 'focus-consistent');
      break;
    case 'card':
      element.classList.add('card-modern', 'hover-consistent');
      break;
    case 'input':
      element.classList.add('input-modern', 'focus-consistent');
      break;
    case 'text':
      element.classList.add('text-consistent-body');
      break;
  }
};

/**
 * Get consistent spacing value
 */
export const getConsistentSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
  const spacingMap = {
    xs: 'var(--spacing-2)',
    sm: 'var(--spacing-4)',
    md: 'var(--spacing-6)',
    lg: 'var(--spacing-8)',
    xl: 'var(--spacing-12)'
  };
  return spacingMap[size];
};

/**
 * Get consistent color value
 */
export const getConsistentColor = (color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray', shade?: number): string => {
  if (shade) {
    return `rgb(var(--color-${color}-${shade}))`;
  }
  return `rgb(var(--color-${color}))`;
};

/**
 * Development helper to highlight inconsistent elements
 */
export const highlightInconsistentElements = (): void => {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return;
  }

  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element instanceof HTMLElement) {
      const report = validateElementConsistency(element);
      if (!report.isConsistent) {
        element.style.outline = '2px solid red';
        element.title = `Consistency issues: ${report.issues.join(', ')}`;
      }
    }
  });
};

export default {
  validateDesignSystem,
  validateElementConsistency,
  validatePageConsistency,
  applyConsistentStyling,
  getConsistentSpacing,
  getConsistentColor,
  highlightInconsistentElements
};