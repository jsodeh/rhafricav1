import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'buyer' | 'renter' | 'agent' | 'owner' | 'professional' | 'admin';
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login',
}) => {
  const { user, isAuthenticated, isLoading, roleReady, resolvedRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading || !roleReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const userRole = resolvedRole;
    const hasRequiredRole = checkUserRole(userRole, requiredRole);

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = getDashboardPath(userRole);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

// Helper function to check if user has required role
const checkUserRole = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    admin: ['admin'],
    agent: ['agent', 'admin'],
    owner: ['owner', 'admin'],
    professional: ['professional', 'admin'],
    buyer: ['buyer', 'renter', 'agent', 'owner', 'professional', 'admin'],
    renter: ['renter', 'buyer', 'agent', 'owner', 'professional', 'admin'],
  };

  const allowedRoles = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || [];
  return allowedRoles.includes(userRole as any);
};

// Helper function to get dashboard path based on user role
const getDashboardPath = (userRole: string): string => {
  if (userRole === 'admin') {
    return '/admin-dashboard';
  } else if (userRole === 'agent') {
    return '/agent-dashboard';
  } else if (userRole === 'owner') {
    return '/owner-dashboard';
  } else if (userRole === 'professional') {
    return '/service-dashboard';
  } else {
    return '/dashboard'; // Default dashboard for buyers/renters
  }
};

// Higher-order component for admin-only routes
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin" fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  );
};

// Higher-order component for agent-only routes
export const AgentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="agent" fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  );
};

// Higher-order component for owner-only routes
export const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="owner" fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  );
};

// Higher-order component for professional-only routes
export const ProfessionalRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="professional" fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  );
};

// Higher-order component for authenticated users only
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute fallbackPath="/login">
      {children}
    </ProtectedRoute>
  );
}; 