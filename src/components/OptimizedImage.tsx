import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { optimizeImageUrl, createResponsiveImageProps, ImageOptimizationOptions } from '@/lib/imageOptimization';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  optimization?: ImageOptimizationOptions;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc,
  placeholder = 'empty',
  blurDataURL,
  optimization = {},
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  const responsiveProps = createResponsiveImageProps(currentSrc, alt, optimization);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  // Generate placeholder styles
  const placeholderStyles: React.CSSProperties = {};
  if (placeholder === 'blur' && blurDataURL) {
    placeholderStyles.backgroundImage = `url(${blurDataURL})`;
    placeholderStyles.backgroundSize = 'cover';
    placeholderStyles.backgroundPosition = 'center';
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gray-100",
        className
      )}
      style={!isLoaded ? placeholderStyles : undefined}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          {placeholder === 'blur' ? (
            <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300" />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
          <svg 
            className="w-8 h-8 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <span className="text-sm">Image not available</span>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <img
          ref={imgRef}
          {...responsiveProps}
          {...props}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            "w-full h-full object-cover"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

// Higher-order component for property images with standard optimization
export const PropertyImage: React.FC<Omit<OptimizedImageProps, 'optimization'> & {
  size?: 'thumbnail' | 'card' | 'hero' | 'gallery';
}> = ({ size = 'card', ...props }) => {
  const optimizationMap = {
    thumbnail: { width: 150, height: 150, quality: 70 },
    card: { width: 400, height: 300, quality: 80 },
    hero: { width: 1200, height: 600, quality: 85 },
    gallery: { width: 800, height: 600, quality: 90 }
  };

  return (
    <OptimizedImage
      optimization={optimizationMap[size]}
      placeholder="blur"
      {...props}
    />
  );
};

// Component for agent/user avatars
export const AvatarImage: React.FC<Omit<OptimizedImageProps, 'optimization'> & {
  size?: number;
}> = ({ size = 40, className, ...props }) => {
  return (
    <OptimizedImage
      optimization={{ width: size * 2, height: size * 2, quality: 80 }}
      className={cn(`w-${size/4} h-${size/4} rounded-full`, className)}
      placeholder="blur"
      {...props}
    />
  );
};
