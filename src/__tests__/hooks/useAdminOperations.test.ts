import { renderHook, waitFor } from '@testing-library/react';
import { useAdminOperations } from '@/hooks/useAdminOperations';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: '1', 
      email: 'admin@test.com', 
      accountType: 'admin' 
    },
    isAuthenticated: true,
    isLoading: false
  })
}));

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          count: 10
        })),
        gte: jest.fn(() => ({
          count: 5
        })),
        in: jest.fn(() => ({
          count: 8
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: [],
            error: null
          }))
        })),
        limit: jest.fn(() => ({
          data: [],
          error: null
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null
        }))
      }))
    }))
  }
}));

describe('useAdminOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should identify admin user correctly', () => {
    const { result } = renderHook(() => useAdminOperations());
    
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch platform statistics', async () => {
    const { result } = renderHook(() => useAdminOperations());
    
    const stats = await result.current.fetchPlatformStats();
    
    expect(stats).toBeDefined();
    expect(typeof stats?.totalUsers).toBe('number');
    expect(typeof stats?.totalProperties).toBe('number');
    expect(typeof stats?.totalAgents).toBe('number');
  });

  it('should fetch system health', async () => {
    const { result } = renderHook(() => useAdminOperations());
    
    const health = await result.current.fetchSystemHealth();
    
    expect(health).toBeDefined();
    expect(health?.database).toBeDefined();
    expect(health?.api).toBeDefined();
    expect(typeof health?.responseTime).toBe('number');
  });

  it('should handle user management operations', async () => {
    const { result } = renderHook(() => useAdminOperations());
    
    // Test ban user
    const banResult = await result.current.banUser('user123', 30, 'Test ban');
    expect(banResult).toBe(true);

    // Test unban user
    const unbanResult = await result.current.unbanUser('user123');
    expect(unbanResult).toBe(true);

    // Test delete user
    const deleteResult = await result.current.deleteUser('user123');
    expect(deleteResult).toBe(true);
  });

  it('should handle agent verification', async () => {
    const { result } = renderHook(() => useAdminOperations());
    
    const verifyResult = await result.current.verifyAgent('agent123', 'verified', 'Approved');
    expect(verifyResult).toBe(true);
  });

  it('should handle property moderation', async () => {
    const { result } = renderHook(() => useAdminOperations());
    
    const moderateResult = await result.current.moderateProperty('prop123', 'approve', 'Content approved');
    expect(moderateResult).toBe(true);
  });

  it('should handle system operations', async () => {
    const { result } = renderHook(() => useAdminOperations());
    
    // Test maintenance mode
    const maintenanceResult = await result.current.enableMaintenanceMode(true, 'Scheduled maintenance');
    expect(maintenanceResult).toBe(true);

    // Test database backup
    const backupResult = await result.current.performDatabaseBackup();
    expect(backupResult).toBe(true);
  });

  it('should fetch recent activity', async () => {
    const { result } = renderHook(() => useAdminOperations());
    
    const activity = await result.current.getRecentActivity(10);
    expect(Array.isArray(activity)).toBe(true);
  });
});