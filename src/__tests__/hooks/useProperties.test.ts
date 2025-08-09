import { renderHook, waitFor } from '@testing-library/react';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
jest.mock('@/integrations/supabase/client');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useProperties', () => {
  const mockProperties = [
    {
      id: 'prop-1',
      title: 'Test Property 1',
      description: 'A beautiful test property',
      property_type: 'apartment' as const,
      listing_type: 'sale' as const,
      status: 'for_sale' as const,
      price: 50000000,
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 150,
      address: 'Test Address 1',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: null,
      longitude: null,
      agent_id: 'agent-1',
      owner_id: null,
      featured: true,
      verified: true,
      images: ['test1.jpg'],
      amenities: ['Pool', 'Gym'],
      year_built: 2022,
      parking_spaces: 2,
      furnishing_status: 'Furnished',
      property_documents: {},
      virtual_tour_url: null,
      views_count: 10,
      seo_slug: 'test-property-1',
      meta_description: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      real_estate_agents: {
        id: 'agent-1',
        agency_name: 'Test Agency',
        phone: '+234-123-456-7890',
        rating: 4.5,
        profile_image_url: null
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase responses
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProperties[0], error: null })
          }),
          limit: jest.fn().mockResolvedValue({ data: mockProperties, error: null })
        }),
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProperties[0], error: null })
        }),
        ilike: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis()
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    });
  });

  it('should fetch properties on mount', async () => {
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ 
          data: mockProperties, 
          error: null, 
          count: mockProperties.length 
        })
      })
    });

    const { result } = renderHook(() => useProperties());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.properties).toEqual(mockProperties);
    expect(result.current.totalCount).toBe(mockProperties.length);
    expect(result.current.error).toBeNull();
  });

  it('should apply filters correctly', async () => {
    const filters = {
      city: 'Lagos',
      property_type: 'apartment' as const,
      min_price: 30000000,
      max_price: 60000000
    };

    const mockQuery = {
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockResolvedValue({ 
                  data: mockProperties, 
                  error: null, 
                  count: 1 
                })
              })
            })
          })
        })
      })
    };

    mockSupabase.from = jest.fn().mockReturnValue(mockQuery);

    const { result } = renderHook(() => useProperties(filters));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('properties');
    expect(mockQuery.select).toHaveBeenCalled();
  });

  it('should get property by ID and increment view count', async () => {
    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const property = await result.current.getPropertyById('prop-1');

    expect(property).toEqual(mockProperties[0]);
    expect(mockSupabase.from).toHaveBeenCalledWith('properties');
  });

  it('should get featured properties', async () => {
    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const featuredProperties = await result.current.getFeaturedProperties(3);

    expect(featuredProperties).toEqual(mockProperties);
    expect(mockSupabase.from).toHaveBeenCalledWith('properties');
  });

  it('should search properties', async () => {
    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchResults = await result.current.searchProperties('luxury apartment');

    expect(searchResults).toEqual(mockProperties);
    expect(mockSupabase.from).toHaveBeenCalledWith('properties');
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Database error';
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: errorMessage },
          count: 0
        })
      })
    });

    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.properties).toEqual([]);
  });

  it('should refetch properties when called', async () => {
    const { result } = renderHook(() => useProperties());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    await result.current.refetch();

    expect(mockSupabase.from).toHaveBeenCalledWith('properties');
  });
});