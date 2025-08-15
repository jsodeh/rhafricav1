import React, { forwardRef, useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  useKeyboardNavigation, 
  useScreenReader,
  KEYBOARD_CODES 
} from '@/lib/accessibility';

interface AccessibleButtonProps extends ButtonProps {
  /** Screen reader description */
  'aria-label'?: string;
  /** ID of element that describes this button */
  'aria-describedby'?: string;
  /** Whether button controls a popup/menu */
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /** Whether controlled element is expanded */
  'aria-expanded'?: boolean;
  /** Whether button is pressed (for toggle buttons) */
  'aria-pressed'?: boolean;
  /** Loading state with announcement */
  loading?: boolean;
  /** Success state with announcement */
  success?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Enhanced focus styles */
  focusRing?: 'default' | 'prominent' | 'none';
  /** Minimum touch target size compliance */
  touchTarget?: 'auto' | 'large' | 'xlarge';
  /** Announce action to screen readers */
  announceAction?: string;
  /** Confirm action before execution */
  requireConfirm?: boolean;
  /** Confirmation message */
  confirmMessage?: string;
  /** Keyboard shortcuts */
  shortcuts?: string[];
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    className,
    children,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-haspopup': ariaHaspopup,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
    loading = false,
    success = false,
    successMessage = 'Action completed',
    focusRing = 'default',
    touchTarget = 'auto',
    announceAction,
    requireConfirm = false,
    confirmMessage = 'Are you sure?',
    shortcuts = [],
    onClick,
    onKeyDown,
    disabled,
    variant,
    size,
    ...props
  }, ref) => {
    const { announce } = useScreenReader();
    const [isConfirming, setIsConfirming] = useState(false);
    const [hasBeenPressed, setHasBeenPressed] = useState(false);

    // Handle click with accessibility features
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      // Confirmation flow
      if (requireConfirm && !isConfirming) {
        setIsConfirming(true);
        announce(confirmMessage, 'assertive');
        setTimeout(() => setIsConfirming(false), 5000); // Auto-cancel after 5s
        return;
      }

      setIsConfirming(false);
      setHasBeenPressed(true);

      // Announce action
      if (announceAction) {
        announce(announceAction, 'polite');
      }

      // Call original click handler
      onClick?.(e);

      // Success announcement
      if (success) {
        setTimeout(() => {
          announce(successMessage, 'polite');
        }, 100);
      }

      // Reset pressed state
      setTimeout(() => setHasBeenPressed(false), 150);
    };

    // Enhanced keyboard navigation
    const { handleKeyDown: handleAccessibleKeyDown } = useKeyboardNavigation(
      () => {
        // Enter key - same as click
        const buttonElement = ref && 'current' in ref ? ref.current : null;
        if (buttonElement) {
          buttonElement.click();
        }
      },
      () => {
        // Space key - same as click
        const buttonElement = ref && 'current' in ref ? ref.current : null;
        if (buttonElement) {
          buttonElement.click();
        }
      },
      () => {
        // Escape key - cancel confirmation
        if (isConfirming) {
          setIsConfirming(false);
          announce('Action cancelled', 'polite');
        }
      }
    );

    const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle keyboard shortcuts
      if (shortcuts.length > 0) {
        const key = e.key.toLowerCase();
        const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
        
        shortcuts.forEach(shortcut => {
          const parts = shortcut?.toLowerCase()?.split('+') || [];
          const shortcutKey = parts[parts.length - 1];
          const needsCtrl = parts.includes('ctrl') || parts.includes('cmd');
          const needsAlt = parts.includes('alt');
          
          if (key === shortcutKey && 
              (!needsCtrl || e.ctrlKey || e.metaKey) && 
              (!needsAlt || e.altKey)) {
            e.preventDefault();
            handleClick(e as any);
          }
        });
      }

      handleAccessibleKeyDown(e);
      onKeyDown?.(e);
    };

    // Dynamic class names based on props
    const buttonClasses = cn(
      // Base accessibility classes
      'relative transition-all duration-200',
      
      // Focus ring styles
      focusRing === 'default' && 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      focusRing === 'prominent' && 'focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      focusRing === 'none' && 'focus-visible:outline-none',
      
      // Touch target sizes
      touchTarget === 'large' && 'min-h-[44px] min-w-[44px]',
      touchTarget === 'xlarge' && 'min-h-[48px] min-w-[48px]',
      
      // State-based styles
      hasBeenPressed && 'scale-95',
      isConfirming && 'ring-4 ring-orange-300 bg-orange-50 border-orange-300',
      success && 'ring-2 ring-green-500',
      loading && 'cursor-wait',
      
      className
    );

    // Button content with loading and success states
    const buttonContent = () => {
      if (loading) {
        return (
          <>
            <div 
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" 
              aria-hidden="true"
            />
            <span className="sr-only">Loading, </span>
            {children}
          </>
        );
      }

      if (success) {
        return (
          <>
            <svg 
              className="w-4 h-4 mr-2 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <span className="sr-only">Success, </span>
            {children}
          </>
        );
      }

      if (isConfirming) {
        return (
          <>
            <svg 
              className="w-4 h-4 mr-2 text-orange-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <span className="sr-only">Confirmation required, </span>
            Click to confirm
          </>
        );
      }

      return children;
    };

    // Generate accessible attributes
    const accessibleProps = {
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'aria-haspopup': ariaHaspopup,
      'aria-expanded': ariaExpanded,
      'aria-pressed': ariaPressed,
      'aria-busy': loading,
      'aria-disabled': disabled || loading,
      ...(shortcuts.length > 0 && {
        'data-shortcuts': shortcuts.join(', '),
        title: `Keyboard shortcuts: ${shortcuts.join(', ')}`
      }),
    };

    return (
      <Button
        ref={ref}
        className={buttonClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDownEvent}
        disabled={disabled || loading}
        variant={isConfirming ? 'outline' : variant}
        size={size}
        {...accessibleProps}
        {...props}
      >
        {buttonContent()}
        
        {/* Hidden description for shortcuts */}
        {shortcuts.length > 0 && (
          <span className="sr-only">
            Keyboard shortcuts available: {shortcuts.join(', ')}
          </span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
