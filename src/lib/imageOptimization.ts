// Image optimization utilities for Real Estate Hotspot

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Optimizes image URLs using modern CDN services like Cloudinary or ImageKit
 * Falls back to original URL if optimization service is not configured
 */
export function optimizeImageUrl(
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  // If it's already an optimized URL or not a valid image URL, return as-is
  if (!originalUrl || originalUrl.includes('cloudinary.com') || originalUrl.includes('imagekit.io')) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover'
  } = options;

  // For Unsplash images (commonly used in the app), add optimization parameters
  if (originalUrl.includes('unsplash.com')) {
    const url = new URL(originalUrl);
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality) url.searchParams.set('q', quality.toString());
    if (format === 'webp') url.searchParams.set('fm', 'webp');
    if (fit) url.searchParams.set('fit', fit);
    
    return url.toString();
  }

  // For other external images, return as-is
  // In production, you might want to proxy through your own optimization service
  return originalUrl;
}

/**
 * Generates multiple image sizes for responsive images
 */
export function generateResponsiveImageSizes(
  originalUrl: string,
  baseSizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): Array<{ url: string; width: number }> {
  return baseSizes.map(width => ({
    url: optimizeImageUrl(originalUrl, { width, quality: 85 }),
    width
  }));
}

/**
 * Creates responsive image props for img elements
 */
export function createResponsiveImageProps(
  originalUrl: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) {
  const { width, height } = options;
  const sizes = generateResponsiveImageSizes(originalUrl);
  
  return {
    src: optimizeImageUrl(originalUrl, options),
    srcSet: sizes.map(({ url, width }) => `${url} ${width}w`).join(', '),
    sizes: `
      (max-width: 640px) 100vw,
      (max-width: 768px) 50vw,
      (max-width: 1024px) 33vw,
      25vw
    `,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height })
  };
}

/**
 * Preloads critical images for better performance
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Preloads multiple images
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(preloadImage);
  await Promise.all(promises);
}

/**
 * Lazy loads images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private images: Set<HTMLImageElement> = new Set();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          this.observer.unobserve(img);
          this.images.delete(img);
        }
      }
    });
  }

  observe(img: HTMLImageElement) {
    this.images.add(img);
    this.observer.observe(img);
  }

  unobserve(img: HTMLImageElement) {
    this.images.delete(img);
    this.observer.unobserve(img);
  }

  disconnect() {
    this.observer.disconnect();
    this.images.clear();
  }
}

// Global lazy image loader instance
export const globalLazyLoader = new LazyImageLoader();

/**
 * Image format detection and WebP support
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Calculates optimal image dimensions while maintaining aspect ratio
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = Math.min(originalWidth, maxWidth);
  let height = width / aspectRatio;
  
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Converts file size to appropriate format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
