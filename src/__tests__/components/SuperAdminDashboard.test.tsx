import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the hooks
jest.mock('@/hooks/useAdminOperations', () => ({
  useAdminOperations: () => ({
    isAdmin: true,
    isLoading: false,
    error: null,
    fetchPlatformStats: jest.fn().mockResolvedValue({
      totalUsers: 100,
      totalProperties: 50,
      totalAgents: 10,
      pendingVerifications: 5
    }),
    fetchSystemHealth: jest.fn().mockResolvedValue({
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
      responseTime: 200,
      activeUsers: 50,
      storageUsed: 45
    }),
    fetchUsers: jest.fn().mockResolvedValue([]),
    fetchPendingAgents: jest.fn().mockResolvedValue([]),
    fetchFlaggedProperties: jest.fn().mockResolvedValue([]),
    getRecentActivity: jest.fn().mockResolvedValue([]),
    verifyAgent: jest.fn(),
    banUser: jest.fn(),
    unbanUser: jest.fn(),
    deleteUser: jest.fn(),
    moderateProperty: jest.fn(),
    exportData: jest.fn(),
    enableMaintenanceMode: jest.fn(),
    performDatabaseBackup: jest.fn()
  })
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: '1', 
      email: 'admin@test.com', 
      accountType: 'admin' 
    },
    isAuthenticated: true,
    isLoading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard with all tabs', async () => {
    renderWithProviders(<SuperAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    });

    // Check all tabs are present
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('displays platform statistics', async () => {
    renderWithProviders(<SuperAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Properties')).toBeInTheDocument();
      expect(screen.getByText('Verified Agents')).toBeInTheDocument();
      expect(screen.getByText('Pending Verifications')).toBeInTheDocument();
    });
  });

  it('allows tab navigation', async () => {
    renderWithProviders(<SuperAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    });

    // Click on Users tab
    fireEvent.click(screen.getByText('Users'));
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    // Click on Agents tab
    fireEvent.click(screen.getByText('Agents'));
    await waitFor(() => {
      expect(screen.getByText('Agent Management')).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    renderWithProviders(<SuperAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh Data');
    fireEvent.click(refreshButton);
    
    // Should show refreshing state
    await waitFor(() => {
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });
  });

  it('displays system health information', async () => {
    renderWithProviders(<SuperAdminDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    // Should show system health indicators
    expect(screen.getByText('Database Status')).toBeInTheDocument();
    expect(screen.getByText('API Response')).toBeInTheDocument();
    expect(screen.getByText('Storage Usage')).toBeInTheDocument();
  });
});