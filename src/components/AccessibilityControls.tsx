import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Eye, Type, Contrast, Settings } from 'lucide-react';

interface AccessibilityControlsProps {
  className?: string;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ className }) => {
  const { 
    isHighContrast, 
    toggleHighContrast, 
    fontSize, 
    setFontSize,
    focusVisible,
    setFocusVisible 
  } = useAccessibility();

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Contrast className="h-4 w-4" />
            <span className="text-sm font-medium">High Contrast</span>
          </div>
          <Button
            variant={isHighContrast ? "default" : "outline"}
            size="sm"
            onClick={toggleHighContrast}
            aria-pressed={isHighContrast}
            aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
          >
            {isHighContrast ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Font Size Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="text-sm font-medium">Font Size</span>
          </div>
          <div className="flex gap-2">
            {(['normal', 'large', 'extra-large'] as const).map((size) => (
              <Button
                key={size}
                variant={fontSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => setFontSize(size)}
                aria-pressed={fontSize === size}
                className="capitalize"
              >
                {size === 'extra-large' ? 'XL' : size}
              </Button>
            ))}
          </div>
        </div>

        {/* Focus Visible Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Enhanced Focus</span>
          </div>
          <Button
            variant={focusVisible ? "default" : "outline"}
            size="sm"
            onClick={() => setFocusVisible(!focusVisible)}
            aria-pressed={focusVisible}
            aria-label={`${focusVisible ? 'Disable' : 'Enable'} enhanced focus indicators`}
          >
            {focusVisible ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Current Status */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted mb-2">Current Settings:</p>
          <div className="flex flex-wrap gap-1">
            {isHighContrast && (
              <Badge variant="secondary" className="text-xs">
                High Contrast
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {fontSize} Text
            </Badge>
            {focusVisible && (
              <Badge variant="secondary" className="text-xs">
                Enhanced Focus
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityControls;