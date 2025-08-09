import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/integrations/supabase/client');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useUserProfile', () => {
  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    accountType: 'buyer',
    emailVerified: true
  };

  const mockProfile = {
    id: 'profile-id',
    user_id: 'test-user-id',
    full_name: 'Test User',
    email: 'test@example.com',
    phone: '+234-123-456-7890',
    avatar_url: null,
    account_type: 'buyer' as const,
    bio: null,
    location: 'Lagos, Nigeria',
    preferences: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockSavedProperties = [
    {
      id: 'fav-1',
      property_id: 'prop-1',
      created_at: '2024-01-01T00:00:00Z',
      properties: {
        id: 'prop-1',
        title: 'Test Property',
        price: 50000000,
        address: 'Test Address',
        city: 'Lagos',
        state: 'Lagos',
        images: ['test-image.jpg'],
        bedrooms: 3,
        bathrooms: 2,
        area_sqm: 150,
        property_type: 'apartment' as const,
        listing_type: 'sale' as const,
        status: 'for_sale' as const
      }
    }
  ];

  const mockSavedSearches = [
    {
      id: 'search-1',
      name: 'Test Search',
      search_criteria: { city: 'Lagos', bedrooms: 3 },
      email_alerts: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
      updateProfile: jest.fn(),
      resetPassword: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerification: jest.fn()
    });

    // Mock Supabase responses
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: mockSavedProperties, error: null })
          })
        }),
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: mockSavedSearches, error: null })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
        })
      }),
      upsert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null })
        })
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })
    });
  });

  it('should fetch user profile data on mount', async () => {
    const { result } = renderHook(() => useUserProfile());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.savedProperties).toEqual(mockSavedProperties);
    expect(result.current.savedSearches).toEqual(mockSavedSearches);
    expect(result.current.error).toBeNull();
  });

  it('should handle profile update', async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updateData = { full_name: 'Updated Name' };
    const updateResult = await result.current.updateProfile(updateData);

    expect(updateResult.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
  });

  it('should handle adding property to favorites', async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const addResult = await result.current.addToFavorites('test-property-id');

    expect(addResult.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('property_favorites');
  });

  it('should handle removing property from favorites', async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const removeResult = await result.current.removeFromFavorites('test-property-id');

    expect(removeResult.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('property_favorites');
  });

  it('should handle saving a search', async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchCriteria = { city: 'Lagos', bedrooms: 3 };
    const saveResult = await result.current.saveSearch('Test Search', searchCriteria, true);

    expect(saveResult.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('saved_searches');
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Database error';
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: errorMessage } })
        })
      })
    });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.profile).toBeNull();
  });

  it('should not fetch data when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
      updateProfile: jest.fn(),
      resetPassword: jest.fn(),
      verifyEmail: jest.fn(),
      resendVerification: jest.fn()
    });

    const { result } = renderHook(() => useUserProfile());

    expect(result.current.isLoading).toBe(true);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
});