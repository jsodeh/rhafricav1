import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useActivity } from '@/hooks/useActivity';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useUserProfile');
jest.mock('@/hooks/useActivity');
jest.mock('@/components/StickyNavigation', () => {
  return function MockStickyNavigation() {
    return <div data-testid="sticky-navigation">Navigation</div>;
  };
});
jest.mock('@/components/ProfileSetupProgress', () => {
  return function MockProfileSetupProgress({ isOpen, onClose }: any) {
    return isOpen ? <div data-testid="profile-setup">Profile Setup</div> : null;
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUserProfile = useUserProfile as jest.MockedFunction<typeof useUserProfile>;
const mockUseActivity = useActivity as jest.MockedFunction<typeof useActivity>;

const mockUser = {
  id: 'test-user-id',
  name: 'John Doe',
  email: 'john@example.com',
  accountType: 'Premium Buyer',
  emailVerified: true,
  profilePhoto: 'https://example.com/photo.jpg'
};

const mockProfile = {
  id: 'profile-id',
  user_id: 'test-user-id',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+234-123-456-7890',
  avatar_url: 'https://example.com/photo.jpg',
  account_type: 'buyer' as const,
  bio: 'Test bio',
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
      title: 'Luxury Apartment',
      price: 50000000,
      address: 'Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      images: ['test.jpg'],
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 150,
      property_type: 'apartment' as const,
      listing_type: 'sale' as const,
      status: 'for_sale' as const
    }
  }
];

const mockActivities = [
  {
    id: 'activity-1',
    type: 'property_saved' as const,
    title: 'Saved Luxury Apartment to favorites',
    time: '2 hours ago',
    icon: () => <div>Heart Icon</div>
  }
];

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
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

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      savedProperties: mockSavedProperties,
      savedSearches: [],
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      addToFavorites: jest.fn(),
      removeFromFavorites: jest.fn(),
      saveSearch: jest.fn(),
      refetch: jest.fn()
    });

    mockUseActivity.mockReturnValue({
      activities: mockActivities,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      addActivity: jest.fn()
    });
  });

  it('should render dashboard with user information', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });

    expect(screen.getByText('Premium Buyer')).toBeInTheDocument();
    expect(screen.getByText('Member since')).toBeInTheDocument();
  });

  it('should display user statistics', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Saved Properties')).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument(); // Saved properties count
    expect(screen.getByText('Saved Searches')).toBeInTheDocument();
    expect(screen.getByText('Profile Complete')).toBeInTheDocument();
  });

  it('should display saved properties', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recently Saved')).toBeInTheDocument();
    });

    expect(screen.getByText('Luxury Apartment')).toBeInTheDocument();
    expect(screen.getByText('Victoria Island, Lagos')).toBeInTheDocument();
  });

  it('should display recent activities', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    expect(screen.getByText('Saved Luxury Apartment to favorites')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseUserProfile.mockReturnValue({
      profile: null,
      savedProperties: [],
      savedSearches: [],
      isLoading: true,
      error: null,
      updateProfile: jest.fn(),
      addToFavorites: jest.fn(),
      removeFromFavorites: jest.fn(),
      saveSearch: jest.fn(),
      refetch: jest.fn()
    });

    renderDashboard();

    expect(screen.getAllByText('Loading...')[0]).toBeInTheDocument();
  });

  it('should handle empty states', async () => {
    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      savedProperties: [],
      savedSearches: [],
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      addToFavorites: jest.fn(),
      removeFromFavorites: jest.fn(),
      saveSearch: jest.fn(),
      refetch: jest.fn()
    });

    mockUseActivity.mockReturnValue({
      activities: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      addActivity: jest.fn()
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No saved properties yet')).toBeInTheDocument();
    });

    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('should display quick actions', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    expect(screen.getByText('Search Properties')).toBeInTheDocument();
    expect(screen.getByText('Map Search')).toBeInTheDocument();
    expect(screen.getByText('Find Agents')).toBeInTheDocument();
    expect(screen.getByText('List Property')).toBeInTheDocument();
  });

  it('should calculate profile completion percentage', async () => {
    renderDashboard();

    await waitFor(() => {
      // Profile has full_name, phone, location, avatar_url = 4/4 = 100%
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('should show email verification status', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });
});