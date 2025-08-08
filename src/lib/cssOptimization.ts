/**
 * CSS Optimization Utilities
 * 
 * This module provides utilities for optimizing CSS performance and bundle size
 * by identifying unused styles and providing efficient loading strategies.
 */

export interface CSSOptimizationReport {
  unusedSelectors: string[];
  duplicateRules: string[];
  optimizationSuggestions: string[];
  estimatedSavings: string;
}

/**
 * Analyze CSS usage and identify optimization opportunities
 */
export const analyzeCSSUsage = (): CSSOptimizationReport => {
  const report: CSSOptimizationReport = {
    unusedSelectors: [],
    duplicateRules: [],
    optimizationSuggestions: [],
    estimatedSavings: '0KB'
  };

  if (typeof window === 'undefined') {
    return report;
  }

  try {
    const styleSheets = Array.from(document.styleSheets);
    const usedSelectors = new Set<string>();
    const allSelectors = new Set<string>();
    const ruleMap = new Map<string, number>();

    // Analyze all CSS rules
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            allSelectors.add(selector);
            
            // Count rule occurrences for duplicate detection
            const ruleText = rule.cssText;
            ruleMap.set(ruleText, (ruleMap.get(ruleText) || 0) + 1);
            
            // Check if selector is used in DOM
            try {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                usedSelectors.add(selector);
              }
            } catch (e) {
              // Invalid selector, skip
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    });

    // Find unused selectors
    allSelectors.forEach(selector => {
      if (!usedSelectors.has(selector)) {
        report.unusedSelectors.push(selector);
      }
    });

    // Find duplicate rules
    ruleMap.forEach((count, rule) => {
      if (count > 1) {
        report.duplicateRules.push(`${rule} (${count} times)`);
      }
    });

    // Generate optimization suggestions
    if (report.unusedSelectors.length > 0) {
      report.optimizationSuggestions.push(
        `Remove ${report.unusedSelectors.length} unused CSS selectors`
      );
    }

    if (report.duplicateRules.length > 0) {
      report.optimizationSuggestions.push(
        `Consolidate ${report.duplicateRules.length} duplicate CSS rules`
      );
    }

    // Estimate potential savings
    const totalUnusedRules = report.unusedSelectors.length + report.duplicateRules.length;
    const estimatedSavingsKB = Math.round(totalUnusedRules * 0.1); // Rough estimate
    report.estimatedSavings = `${estimatedSavingsKB}KB`;

    // Additional optimization suggestions
    report.optimizationSuggestions.push(
      'Use CSS custom properties for consistent theming',
      'Minimize CSS specificity conflicts',
      'Use efficient selectors (avoid deep nesting)',
      'Consider CSS-in-JS for component-specific styles'
    );

  } catch (error) {
    console.warn('CSS analysis failed:', error);
  }

  return report;
};

/**
 * Critical CSS extraction for above-the-fold content
 */
export const extractCriticalCSS = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const criticalSelectors = [
    // Navigation
    'nav',
    '.nav-modern',
    '.nav-modern-transparent',
    
    // Hero section
    '.hero-consistent',
    'h1',
    'h2',
    
    // Buttons (above fold)
    '.btn-modern-primary',
    '.btn-modern-secondary',
    'button',
    
    // Cards (visible immediately)
    '.card-modern',
    '.property-grid',
    
    // Layout
    '.page-container',
    '.page-content',
    '.container',
    
    // Typography
    'body',
    'p',
    
    // Forms (if visible)
    '.input-modern',
    'input',
    
    // Loading states
    '.loading-spinner',
    '.skeleton'
  ];

  let criticalCSS = '';

  try {
    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            
            // Check if selector is critical
            const isCritical = criticalSelectors.some(criticalSelector => 
              selector.includes(criticalSelector) || 
              document.querySelector(selector)
            );
            
            if (isCritical) {
              criticalCSS += rule.cssText + '\n';
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    });
  } catch (error) {
    console.warn('Critical CSS extraction failed:', error);
  }

  return criticalCSS;
};

/**
 * Optimize CSS custom properties usage
 */
export const optimizeCustomProperties = (): string[] => {
  const optimizations: string[] = [];

  if (typeof window === 'undefined') {
    return optimizations;
  }

  const computedStyle = getComputedStyle(document.documentElement);
  const customProperties = Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch {
        return [];
      }
    })
    .filter(rule => rule instanceof CSSStyleRule)
    .flatMap(rule => {
      const text = (rule as CSSStyleRule).cssText;
      const matches = text.match(/--[\w-]+/g) || [];
      return matches;
    });

  const uniqueProperties = [...new Set(customProperties)];
  
  // Check for unused custom properties
  const unusedProperties = uniqueProperties.filter(prop => {
    const value = computedStyle.getPropertyValue(prop);
    return !value;
  });

  if (unusedProperties.length > 0) {
    optimizations.push(`Remove ${unusedProperties.length} unused CSS custom properties`);
  }

  // Check for properties that could be consolidated
  const colorProperties = uniqueProperties.filter(prop => prop.includes('color'));
  const spacingProperties = uniqueProperties.filter(prop => prop.includes('spacing'));
  
  if (colorProperties.length > 50) {
    optimizations.push('Consider consolidating color custom properties');
  }
  
  if (spacingProperties.length > 20) {
    optimizations.push('Consider consolidating spacing custom properties');
  }

  return optimizations;
};

/**
 * Generate optimized CSS bundle
 */
export const generateOptimizedCSS = (): string => {
  const criticalCSS = extractCriticalCSS();
  const customPropertyOptimizations = optimizeCustomProperties();
  
  let optimizedCSS = `
/* Optimized CSS Bundle - Generated automatically */
/* Critical above-the-fold styles */
${criticalCSS}

/* Design System Variables - Optimized */
:root {
  /* Core Colors - Only essential values */
  --color-primary: 29 78 216;
  --color-primary-50: 239 246 255;
  --color-primary-600: 37 99 235;
  --color-primary-700: 29 78 216;
  
  --color-white: 255 255 255;
  --color-gray-50: 249 250 251;
  --color-gray-100: 243 244 246;
  --color-gray-600: 75 85 99;
  --color-gray-700: 55 65 81;
  --color-gray-900: 17 24 39;
  
  /* Essential Spacing */
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  /* Essential Radius */
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Essential Shadows */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-card-hover: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  
  /* Typography */
  --font-family-primary: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}

/* Essential Component Styles */
.card-modern {
  background: rgb(var(--color-white));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid rgb(var(--color-gray-100));
  transition: all 0.2s ease;
}

.card-modern:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.btn-modern-primary {
  background: rgb(var(--color-primary-600));
  color: rgb(var(--color-white));
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-6);
  font-weight: var(--font-weight-medium);
  transition: all 0.15s ease;
  cursor: pointer;
}

.btn-modern-primary:hover {
  background: rgb(var(--color-primary-700));
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
  grid-auto-rows: 1fr;
}

/* Responsive optimizations */
@media (min-width: 768px) {
  .property-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}
`;

  return optimizedCSS;
};

/**
 * Performance monitoring for CSS
 */
export const monitorCSSPerformance = (): void => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return;
  }

  // Monitor CSS loading performance
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.name.includes('.css')) {
        console.log(`CSS loaded: ${entry.name} in ${entry.duration}ms`);
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });

  // Monitor layout shifts caused by CSS
  if ('LayoutShift' in window) {
    const layoutShiftObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if ((entry as any).value > 0.1) {
          console.warn('Large layout shift detected:', entry);
        }
      });
    });

    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

/**
 * Lazy load non-critical CSS
 */
export const lazyLoadCSS = (href: string, media = 'all'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print'; // Load as print first to avoid render blocking
    link.onload = () => {
      link.media = media; // Switch to target media
      resolve();
    };
    link.onerror = reject;
    
    document.head.appendChild(link);
  });
};

export default {
  analyzeCSSUsage,
  extractCriticalCSS,
  optimizeCustomProperties,
  generateOptimizedCSS,
  monitorCSSPerformance,
  lazyLoadCSS
};