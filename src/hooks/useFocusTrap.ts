import { useEffect, useRef } from 'react';
import { FocusTrap, createFocusTrap } from '@/lib/accessibility/focusManagement';

interface UseFocusTrapOptions {
  isActive: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

/**
 * React hook for managing focus traps in modals and overlays
 */
export const useFocusTrap = (options: UseFocusTrapOptions) => {
  const { isActive, autoFocus = true, restoreFocus = true } = options;
  const containerRef = useRef<HTMLElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create focus trap if it doesn't exist
    if (!focusTrapRef.current) {
      focusTrapRef.current = createFocusTrap(containerRef.current);
    }

    if (isActive && autoFocus) {
      focusTrapRef.current.activate();
    } else if (!isActive && focusTrapRef.current.isActivated()) {
      focusTrapRef.current.deactivate();
    }

    // Cleanup on unmount
    return () => {
      if (focusTrapRef.current && focusTrapRef.current.isActivated()) {
        focusTrapRef.current.deactivate();
      }
    };
  }, [isActive, autoFocus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (focusTrapRef.current && focusTrapRef.current.isActivated()) {
        focusTrapRef.current.deactivate();
      }
    };
  }, []);

  return containerRef;
};

/**
 * Hook for managing focus on route changes
 */
export const useRouteAnnouncement = (pageTitle: string) => {
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
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
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Navigated to ${pageTitle}`;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
          }
        }, 1000);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pageTitle]);
};

/**
 * Hook for managing keyboard navigation state
 */
export const useKeyboardNavigation = () => {
  const isKeyboardUserRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
        isKeyboardUserRef.current = true;
        document.body.classList.add('keyboard-user');
      }
    };

    const handleMouseDown = () => {
      isKeyboardUserRef.current = false;
      document.body.classList.remove('keyboard-user');
    };

    const handlePointerDown = () => {
      isKeyboardUserRef.current = false;
      document.body.classList.remove('keyboard-user');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return {
    isKeyboardUser: () => isKeyboardUserRef.current,
  };
};