import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isReducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  focusVisible: boolean;
  setFocusVisible: (visible: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [focusVisible, setFocusVisible] = useState(false);

  // Check for system preferences on mount
  useEffect(() => {
    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(highContrastQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'normal' | 'large' | 'extra-large';
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    if (savedHighContrast) {
      setIsHighContrast(true);
    }

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Apply accessibility classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (isHighContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }
    
    // Reduced motion
    if (isReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${fontSize}`);
    
    // Focus visible
    if (focusVisible) {
      root.classList.add('focus-visible-enabled');
    } else {
      root.classList.remove('focus-visible-enabled');
    }
  }, [isHighContrast, isReducedMotion, fontSize, focusVisible]);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
  };

  const handleSetFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    setFontSize(size);
    localStorage.setItem('accessibility-font-size', size);
  };

  const value: AccessibilityContextType = {
    isHighContrast,
    toggleHighContrast,
    isReducedMotion,
    fontSize,
    setFontSize: handleSetFontSize,
    focusVisible,
    setFocusVisible,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};