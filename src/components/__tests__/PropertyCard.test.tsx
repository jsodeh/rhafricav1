import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PropertyCard from '../PropertyCard';
import { Property } from '@/hooks/useProperties';

const mockProperty: Property = {
  id: '1',
  title: 'Beautiful Modern Apartment',
  description: 'A stunning modern apartment in the heart of Lagos',
  property_type: 'apartment',
  listing_type: 'sale',
  status: 'for_sale',
  price: 50000000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqm: 120,
  address: '123 Victoria Island',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  featured: true,
  verified: true,
  images: ['/test-image.jpg'],
  amenities: null,
  year_built: null,
  parking_spaces: null,
  furnishing_status: null,
  views_count: null,
  created_at: '2024-01-01T00:00:00Z',
  agent_id: 'agent-1',
  real_estate_agents: {
    agency_name: 'Premium Properties',
    phone: '+234-123-456-7890',
    rating: 4.5
  }
};

const renderPropertyCard = (props = {}) => {
  return render(
    <BrowserRouter>
      <PropertyCard property={mockProperty} {...props} />
    </BrowserRouter>
  );
};

describe('PropertyCard', () => {
  it('renders property card with modern styling', () => {
    renderPropertyCard();
    
    // Check if the card is rendered
    expect(screen.getByText('Beautiful Modern Apartment')).toBeInTheDocument();
    expect(screen.getByText('₦50,000,000')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders with compact variant', () => {
    renderPropertyCard({ variant: 'compact' });
    
    expect(screen.getByText('Beautiful Modern Apartment')).toBeInTheDocument();
  });

  it('renders with elevated variant', () => {
    renderPropertyCard({ variant: 'featured' });
    
    expect(screen.getByText('Beautiful Modern Apartment')).toBeInTheDocument();
  });

  it('renders with different aspect ratios', () => {
    renderPropertyCard({ aspectRatio: '4:3' });
    
    expect(screen.getByText('Beautiful Modern Apartment')).toBeInTheDocument();
  });

  it('displays property features correctly', () => {
    renderPropertyCard();
    
    expect(screen.getByText('3')).toBeInTheDocument(); // bedrooms
    expect(screen.getByText('2')).toBeInTheDocument(); // bathrooms
    expect(screen.getByText('120 sqm')).toBeInTheDocument(); // area
  });

  it('displays location correctly', () => {
    renderPropertyCard();
    
    expect(screen.getByText('123 Victoria Island, Lagos, Lagos')).toBeInTheDocument();
  });

  it('displays agent information', () => {
    renderPropertyCard();
    
    expect(screen.getByText('Listed by')).toBeInTheDocument();
    expect(screen.getByText('Premium Properties')).toBeInTheDocument();
  });

  it('has view details button', () => {
    renderPropertyCard();
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });
});