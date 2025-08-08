import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompactPropertyCard from './CompactPropertyCard';
import { Property } from '@/hooks/useProperties';

interface PropertyCarouselProps {
  title: string;
  subtitle?: string;
  properties: Property[];
  viewAllLink?: string;
}

const PropertyCarousel = ({ title, subtitle, properties, viewAllLink }: PropertyCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const itemsPerView = 4; // Show 4 items at a time like Zillow
  const itemWidth = 280; // Width of each property card
  const gap = 16; // Gap between items

  useEffect(() => {
    const updateScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [properties]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = itemWidth + gap;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = itemWidth + gap;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {viewAllLink && (
          <Button variant="link" asChild className="text-blue-600 hover:text-blue-700">
            <a href={viewAllLink}>View all</a>
          </Button>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 h-10 w-10 p-0"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 h-10 w-10 p-0"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex-shrink-0"
              style={{ width: `${itemWidth}px` }}
            >
              <CompactPropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyCarousel;