/**
 * Accessibility utilities and helpers for WCAG 2.1 AA compliance
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ARIA role definitions
export const ARIA_ROLES = {
  // Landmark roles
  banner: 'banner',
  contentinfo: 'contentinfo',
  main: 'main',
  navigation: 'navigation',
  region: 'region',
  search: 'search',
  complementary: 'complementary',
  
  // Widget roles
  button: 'button',
  checkbox: 'checkbox',
  dialog: 'dialog',
  gridcell: 'gridcell',
  link: 'link',
  menuitem: 'menuitem',
  option: 'option',
  progressbar: 'progressbar',
  radio: 'radio',
  slider: 'slider',
  spinbutton: 'spinbutton',
  tab: 'tab',
  tabpanel: 'tabpanel',
  textbox: 'textbox',
  tooltip: 'tooltip',
  
  // Document roles
  article: 'article',
  document: 'document',
  img: 'img',
  list: 'list',
  listitem: 'listitem',
  heading: 'heading',
} as const;

// ARIA properties
export const ARIA_PROPS = {
  describedBy: 'aria-describedby',
  labelledBy: 'aria-labelledby',
  label: 'aria-label',
  expanded: 'aria-expanded',
  hidden: 'aria-hidden',
  pressed: 'aria-pressed',
  selected: 'aria-selected',
  disabled: 'aria-disabled',
  required: 'aria-required',
  invalid: 'aria-invalid',
  live: 'aria-live',
  atomic: 'aria-atomic',
  busy: 'aria-busy',
  controls: 'aria-controls',
  owns: 'aria-owns',
  hasPopup: 'aria-haspopup',
  multiselectable: 'aria-multiselectable',
  orientation: 'aria-orientation',
  valuemin: 'aria-valuemin',
  valuemax: 'aria-valuemax',
  valuenow: 'aria-valuenow',
  valuetext: 'aria-valuetext',
  level: 'aria-level',
  setsize: 'aria-setsize',
  posinset: 'aria-posinset',
  rowindex: 'aria-rowindex',
  colindex: 'aria-colindex',
} as const;

// Keyboard event codes
export const KEYBOARD_CODES = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Screen reader utilities
export class ScreenReaderUtils {
  /**
   * Announce text to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Create visually hidden text for screen readers
   */
  static createSROnlyText(text: string): HTMLElement {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  }

  /**
   * Check if screen reader is likely active
   */
  static isScreenReaderActive(): boolean {
    // This is a heuristic - not 100% reliable
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking ||
           document.querySelector('[aria-live]') !== null;
  }
}

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Set focus to element and add to stack
   */
  static setFocus(element: HTMLElement | null, addToStack = true): void {
    if (!element) return;
    
    if (addToStack && document.activeElement instanceof HTMLElement) {
      this.focusStack.push(document.activeElement);
    }
    
    element.focus();
  }

  /**
   * Return focus to previous element in stack
   */
  static returnFocus(): void {
    const previousElement = this.focusStack.pop();
    if (previousElement && previousElement.isConnected) {
      previousElement.focus();
    }
  }

  /**
   * Trap focus within container
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== KEYBOARD_CODES.TAB) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Set initial focus
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Get all focusable elements within container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        return element instanceof HTMLElement && 
               this.isVisible(element) && 
               !this.isInert(element);
      }) as HTMLElement[];
  }

  /**
   * Check if element is visible
   */
  private static isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * Check if element is inert (non-interactive)
   */
  private static isInert(element: HTMLElement): boolean {
    return element.hasAttribute('inert') || 
           element.closest('[inert]') !== null;
  }
}

// Color contrast utilities
export class ColorContrastUtils {
  /**
   * Calculate relative luminance of a color
   */
  static getRelativeLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color combination meets WCAG standards
   */
  static meetsWCAGStandards(
    foreground: string, 
    background: string, 
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }
    
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }
}

// React hooks for accessibility

/**
 * Hook for managing focus
 */
export function useFocusManagement() {
  const setFocus = useCallback((element: HTMLElement | null, addToStack = true) => {
    FocusManager.setFocus(element, addToStack);
  }, []);

  const returnFocus = useCallback(() => {
    FocusManager.returnFocus();
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    return FocusManager.trapFocus(container);
  }, []);

  return { setFocus, returnFocus, trapFocus };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case KEYBOARD_CODES.ENTER:
        onEnter?.();
        break;
      case KEYBOARD_CODES.SPACE:
        event.preventDefault();
        onSpace?.();
        break;
      case KEYBOARD_CODES.ESCAPE:
        onEscape?.();
        break;
      case KEYBOARD_CODES.ARROW_UP:
        onArrowKeys?.('up');
        break;
      case KEYBOARD_CODES.ARROW_DOWN:
        onArrowKeys?.('down');
        break;
      case KEYBOARD_CODES.ARROW_LEFT:
        onArrowKeys?.('left');
        break;
      case KEYBOARD_CODES.ARROW_RIGHT:
        onArrowKeys?.('right');
        break;
    }
  }, [onEnter, onSpace, onEscape, onArrowKeys]);

  return { handleKeyDown };
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ScreenReaderUtils.announce(message, priority);
  }, []);

  return { announce };
}

/**
 * Hook for managing ARIA attributes
 */
export function useARIA() {
  const [ariaAttributes, setAriaAttributes] = useState<Record<string, string>>({});

  const updateAria = useCallback((updates: Record<string, string | boolean | number>) => {
    setAriaAttributes(prev => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(updates).map(([key, value]) => [key, String(value)])
      ),
    }));
  }, []);

  const clearAria = useCallback(() => {
    setAriaAttributes({});
  }, []);

  return { ariaAttributes, updateAria, clearAria };
}

/**
 * Hook for focus trap (useful for modals, dropdowns)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = FocusManager.trapFocus(containerRef.current);
    return cleanup;
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for reduced motion preference
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for high contrast preference
 */
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(
    window.matchMedia('(prefers-contrast: high)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handler = (e: MediaQueryListEvent) => setPrefersHighContrast(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersHighContrast;
}

// Accessibility validation utilities
export class AccessibilityValidator {
  /**
   * Validate form accessibility
   */
  static validateForm(form: HTMLFormElement): string[] {
    const issues: string[] = [];
    
    // Check for proper labels
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      form.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        issues.push(`Input ${index + 1} is missing a label`);
      }
    });

    // Check for error messages
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach((input, index) => {
      const hasErrorMessage = input.getAttribute('aria-describedby') ||
                             input.getAttribute('aria-invalid');
      
      if (!hasErrorMessage) {
        issues.push(`Required input ${index + 1} should have error message support`);
      }
    });

    return issues;
  }

  /**
   * Validate image accessibility
   */
  static validateImages(container: HTMLElement): string[] {
    const issues: string[] = [];
    const images = container.querySelectorAll('img');
    
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push(`Image ${index + 1} is missing alt text`);
      }
    });

    return issues;
  }

  /**
   * Validate heading structure
   */
  static validateHeadings(container: HTMLElement): string[] {
    const issues: string[] = [];
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push('Page should start with h1');
      }
      
      if (level > previousLevel + 1) {
        issues.push(`Heading level skipped: ${heading.tagName} after h${previousLevel}`);
      }
      
      previousLevel = level;
    });

    return issues;
  }
}

// Export default accessibility configuration
export const ACCESSIBILITY_CONFIG = {
  focusVisibleClass: 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  srOnlyClass: 'sr-only',
  skipLinkClass: 'skip-link',
  highContrastClass: 'high-contrast',
  reducedMotionClass: 'reduce-motion',
} as const;
