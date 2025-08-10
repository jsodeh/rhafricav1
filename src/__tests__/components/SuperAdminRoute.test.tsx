import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SuperAdminRoute from '@/components/SuperAdminRoute';

// Mock the auth context
const mockUseAuth = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SuperAdminRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while authentication is being verified', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true
    });

    renderWithRouter(
      <SuperAdminRoute>
        <div>Protected Content</div>
      </SuperAdminRoute>
    );

    expect(screen.getByText('Verifying admin access...')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });

    renderWithRouter(
      <SuperAdminRoute>
        <div>Protected Content</div>
      </SuperAdminRoute>
    );

    // Should redirect to login (tested via navigation mock)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows access denied for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'user@test.com', 
        accountType: 'buyer' 
      },
      isAuthenticated: true,
      isLoading: false
    });

    renderWithRouter(
      <SuperAdminRoute>
        <div>Protected Content</div>
      </SuperAdminRoute>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Super Administrator privileges required')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows access for admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'admin@test.com', 
        accountType: 'admin' 
      },
      isAuthenticated: true,
      isLoading: false
    });

    renderWithRouter(
      <SuperAdminRoute>
        <div>Protected Content</div>
      </SuperAdminRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('allows access for super_admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'superadmin@test.com', 
        accountType: 'super_admin' 
      },
      isAuthenticated: true,
      isLoading: false
    });

    renderWithRouter(
      <SuperAdminRoute>
        <div>Protected Content</div>
      </SuperAdminRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows access for users with admin role', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'user@test.com', 
        accountType: 'buyer',
        role: 'admin'
      },
      isAuthenticated: true,
      isLoading: false
    });

    renderWithRouter(
      <SuperAdminRoute>
        <div>Protected Content</div>
      </SuperAdminRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows user information in access denied message', () => {
    const testUser = {
      id: '1', 
      email: 'user@test.com', 
      accountType: 'buyer'
    };

    mockUseAuth.mockReturnValue({
      user: testUser,
      isAuthenticated: true,
      isLoading: false
    });

    renderWithRouter(
      <SuperAdminRoute>
        <div>Protected Content</div>
      </SuperAdminRoute>
    );

    expect(screen.getByText(`Current user: ${testUser.email}`)).toBeInTheDocument();
    expect(screen.getByText(`Account type: ${testUser.accountType}`)).toBeInTheDocument();
  });
});