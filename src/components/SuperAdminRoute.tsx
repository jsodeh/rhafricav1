import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while authentication is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/super-admin' }} />;
  }

  // Multi-layer admin privilege checks
  const isAdmin = checkAdminPrivileges(user);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Super Administrator privileges required</p>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Insufficient Permissions</strong>
              <br />
              You need Super Administrator privileges to access this area.
              <br />
              <br />
              If you believe this is an error, please contact the system administrator.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Current user: {user?.email}</p>
            <p>Account type: {user?.accountType || 'Not specified'}</p>
          </div>
        </div>
      </div>
    );
  }

  // User has admin privileges, render the protected content
  return <>{children}</>;
};

/**
 * Multi-layer admin privilege verification
 * Checks multiple criteria to determine if user has admin access
 */
function checkAdminPrivileges(user: any): boolean {
  if (!user) return false;

  // Check 1: Account type verification
  const accountType = user.accountType?.toLowerCase();
  const isAdminAccountType = accountType === 'admin' || accountType === 'super_admin';

  // Check 2: Role-based verification
  const userRole = user.role?.toLowerCase();
  const isAdminRole = userRole === 'admin' || userRole === 'super_admin';

  // Check 3: Email domain verification (additional security layer)
  const email = user.email?.toLowerCase() || '';
  const isAdminEmail = email.includes('admin@') || 
                      email.endsWith('@admin.com') || 
                      email.endsWith('@realestate-admin.com');

  // Check 4: Custom admin flag (if implemented in user metadata)
  const hasAdminFlag = user.user_metadata?.is_admin === true || 
                      user.app_metadata?.is_admin === true;

  // Check 5: Specific admin user IDs (fallback for initial setup)
  const adminUserIds = [
    // Add specific admin user IDs here if needed for initial setup
  ];
  const isAdminUserId = adminUserIds.includes(user.id);

  // User must pass at least one primary check (account type or role)
  // Plus optionally additional verification layers
  const hasPrimaryAdminAccess = isAdminAccountType || isAdminRole;
  const hasSecondaryVerification = isAdminEmail || hasAdminFlag || isAdminUserId;

  // For maximum security, require primary access
  // Secondary verification can be used as additional confirmation
  return hasPrimaryAdminAccess;
}

export default SuperAdminRoute;