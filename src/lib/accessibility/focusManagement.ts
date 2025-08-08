/**
 * Focus Management Utilities for Keyboard Navigation
 * 
 * This module provides utilities for managing focus, tab order,
 * and focus trapping for modals and overlays.
 */

export interface FocusableElement extends HTMLElement {
  focus(): void;
  blur(): void;
}

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): FocusableElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'iframe',
    'object',
    'embed',
    'area[href]',
    'summary',
    '[role="button"]:not([disabled])',
    '[role="checkbox"]:not([disabled])',
    '[role="radio"]:not([disabled])',
    '[role="menuitem"]:not([disabled])',
    '[role="tab"]:not([disabled])',
    '[role="link"]:not([disabled])',
  ].join(',');

  const elements = Array.from(container.querySelectorAll(focusableSelectors)) as FocusableElement[];
  
  return elements.filter(element => {
    // Check if element is visible and not hidden
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      !element.hasAttribute('aria-hidden')
    );
  });
};

/**
 * Focus trap class for modals and overlays
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: FocusableElement[] = [];
  private firstFocusableElement: FocusableElement | null = null;
  private lastFocusableElement: FocusableElement | null = null;
  private previouslyFocusedElement: Element | null = null;
  private isActive = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    this.focusableElements = getFocusableElements(this.container);
    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    // Update focusable elements in case DOM changed
    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (this.focusableElements.length === 1) {
      event.preventDefault();
      this.firstFocusableElement?.focus();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab (forward)
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };

  /**
   * Activate the focus trap
   */
  activate(): void {
    if (this.isActive) return;

    this.previouslyFocusedElement = document.activeElement;
    this.updateFocusableElements();
    
    // Focus the first focusable element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    // Add event listener for tab key
    document.addEventListener('keydown', this.handleKeyDown);
    this.isActive = true;
  }

  /**
   * Deactivate the focus trap
   */
  deactivate(): void {
    if (!this.isActive) return;

    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Return focus to previously focused element
    if (this.previouslyFocusedElement && 'focus' in this.previouslyFocusedElement) {
      (this.previouslyFocusedElement as HTMLElement).focus();
    }

    this.isActive = false;
  }

  /**
   * Check if focus trap is active
   */
  isActivated(): boolean {
    return this.isActive;
  }
}

/**
 * Create and manage a focus trap for an element
 */
export const createFocusTrap = (container: HTMLElement): FocusTrap => {
  return new FocusTrap(container);
};

/**
 * Ensure proper tab order for elements
 */
export const setTabOrder = (elements: HTMLElement[], startIndex = 0): void => {
  elements.forEach((element, index) => {
    element.setAttribute('tabindex', (startIndex + index).toString());
  });
};

/**
 * Remove element from tab order
 */
export const removeFromTabOrder = (element: HTMLElement): void => {
  element.setAttribute('tabindex', '-1');
};

/**
 * Add element to tab order
 */
export const addToTabOrder = (element: HTMLElement, tabIndex = 0): void => {
  element.setAttribute('tabindex', tabIndex.toString());
};

/**
 * Focus management for skip links
 */
export const createSkipLink = (targetId: string, text: string): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.setAttribute('aria-label', `Skip to ${text.toLowerCase()}`);
  
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return skipLink;
};

/**
 * Announce focus changes to screen readers
 */
export const announceFocusChange = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
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
};

/**
 * Manage focus for route changes
 */
export const handleRouteChange = (pageTitle: string): void => {
  // Update document title
  document.title = pageTitle;
  
  // Find main content area or h1
  const mainContent = document.querySelector('main') || 
                     document.querySelector('[role="main"]') || 
                     document.querySelector('h1');
  
  if (mainContent) {
    // Make it focusable if it isn't already
    if (!mainContent.hasAttribute('tabindex')) {
      mainContent.setAttribute('tabindex', '-1');
    }
    
    // Focus the main content
    (mainContent as HTMLElement).focus();
    
    // Announce page change
    announceFocusChange(`Navigated to ${pageTitle}`, 'assertive');
  }
};

/**
 * Enhanced focus visible management
 */
export class FocusVisibleManager {
  private isKeyboardUser = false;
  private lastInteractionWasKeyboard = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Track keyboard usage
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('pointerdown', this.handlePointerDown);
    
    // Apply focus-visible polyfill behavior
    this.applyFocusVisible();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      this.isKeyboardUser = true;
      this.lastInteractionWasKeyboard = true;
      document.body.classList.add('keyboard-user');
    }
  };

  private handleMouseDown = (): void => {
    this.lastInteractionWasKeyboard = false;
    document.body.classList.remove('keyboard-user');
  };

  private handlePointerDown = (): void => {
    this.lastInteractionWasKeyboard = false;
    document.body.classList.remove('keyboard-user');
  };

  private applyFocusVisible(): void {
    // Add focus-visible class to elements when appropriate
    document.addEventListener('focusin', (event) => {
      if (this.lastInteractionWasKeyboard && event.target instanceof HTMLElement) {
        event.target.classList.add('focus-visible');
      }
    });

    document.addEventListener('focusout', (event) => {
      if (event.target instanceof HTMLElement) {
        event.target.classList.remove('focus-visible');
      }
    });
  }

  public isUsingKeyboard(): boolean {
    return this.isKeyboardUser;
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('pointerdown', this.handlePointerDown);
  }
}

// Global focus visible manager instance
export const focusVisibleManager = new FocusVisibleManager();