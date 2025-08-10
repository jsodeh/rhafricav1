import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalAgents: number;
  pendingVerifications: number;
  totalInquiries: number;
  activeListings: number;
  monthlyGrowth: {
    users: number;
    properties: number;
    inquiries: number;
  };
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  activeUsers: number;
  storageUsed: number;
}

interface UserManagement {
  id: string;
  email: string;
  full_name: string;
  account_type: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
  banned_until: string | null;
  total_properties?: number;
  total_inquiries?: number;
}

interface AgentVerification {
  id: string;
  agency_name: string;
  license_number: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating: number;
  total_reviews: number;
  years_experience: number;
  specializations: string[];
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
  verification_documents?: string[];
}

export const useAdminOperations = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin privileges
  const isAdmin = user?.accountType?.toLowerCase().includes('admin');

  const fetchPlatformStats = async (): Promise<AdminStats | null> => {
    if (!isAdmin) return null;

    try {
      setIsLoading(true);
      setError(null);

      const [
        usersCount,
        propertiesCount,
        agentsCount,
        pendingAgents,
        inquiriesCount,
        activeProperties,
        monthlyUsers,
        monthlyProperties,
        monthlyInquiries
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact' }),
        supabase.from('properties').select('id', { count: 'exact' }),
        supabase.from('real_estate_agents').select('id', { count: 'exact' }),
        supabase.from('real_estate_agents').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
        supabase.from('property_inquiries').select('id', { count: 'exact' }),
        supabase.from('properties').select('id', { count: 'exact' }).in('status', ['for_sale', 'for_rent']),
        // Monthly growth calculations
        supabase.from('user_profiles').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('properties').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('property_inquiries').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalUsers: usersCount.count || 0,
        totalProperties: propertiesCount.count || 0,
        totalAgents: agentsCount.count || 0,
        pendingVerifications: pendingAgents.count || 0,
        totalInquiries: inquiriesCount.count || 0,
        activeListings: activeProperties.count || 0,
        monthlyGrowth: {
          users: monthlyUsers.count || 0,
          properties: monthlyProperties.count || 0,
          inquiries: monthlyInquiries.count || 0
        }
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemHealth = async (): Promise<SystemHealth | null> => {
    if (!isAdmin) return null;

    try {
      // Simulate system health checks
      const startTime = Date.now();
      
      // Test database connection
      const { error: dbError } = await supabase.from('user_profiles').select('id').limit(1);
      
      const responseTime = Date.now() - startTime;

      return {
        database: dbError ? 'critical' : 'healthy',
        api: responseTime > 1000 ? 'warning' : 'healthy',
        storage: 'healthy', // This would come from actual storage metrics
        responseTime,
        activeUsers: 0,
        storageUsed: 0
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const fetchUsers = async (filters?: {
    search?: string;
    accountType?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserManagement[]> => {
    if (!isAdmin) return [];

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('user_profiles')
        .select(`
          *,
          properties:properties(count),
          inquiries:property_inquiries(count)
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.accountType && filters.accountType !== 'all') {
        query = query.eq('account_type', filters.accountType);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingAgents = async (): Promise<AgentVerification[]> => {
    if (!isAdmin) return [];

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('real_estate_agents')
        .select(`
          *,
          user_profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAgent = async (agentId: string, status: 'verified' | 'rejected', notes?: string): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('real_estate_agents')
        .update({ 
          verification_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);

      if (error) throw error;

      // TODO: Send notification email to agent
      // await sendAgentVerificationEmail(agentId, status, notes);

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string, duration?: number, reason?: string): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      setIsLoading(true);
      setError(null);

      const bannedUntil = duration 
        ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Update user profile with ban information
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          banned_until: bannedUntil,
          ban_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction('ban_user', { userId, duration, reason });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unbanUser = async (userId: string): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          banned_until: null,
          ban_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log admin action
      await logAdminAction('unban_user', { userId });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Delete user profile (this will cascade to related records due to foreign keys)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async (type: 'users' | 'properties' | 'agents' | 'inquiries'): Promise<any[] | null> => {
    if (!isAdmin) return null;

    try {
      setIsLoading(true);
      setError(null);

      let query;
      switch (type) {
        case 'users':
          query = supabase.from('user_profiles').select('*');
          break;
        case 'properties':
          query = supabase.from('properties').select(`
            *,
            real_estate_agents (
              agency_name,
              license_number
            )
          `);
          break;
        case 'agents':
          query = supabase.from('real_estate_agents').select(`
            *,
            user_profiles (
              full_name,
              email,
              phone
            )
          `);
          break;
        case 'inquiries':
          query = supabase.from('property_inquiries').select(`
            *,
            properties (
              title,
              address
            ),
            user_profiles (
              full_name,
              email
            )
          `);
          break;
        default:
          throw new Error('Invalid export type');
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlaggedProperties = async (): Promise<any[]> => {
    if (!isAdmin) return [];

    try {
      setIsLoading(true);
      setError(null);

      // This would come from a property_flags or moderation table
      // For now, we'll simulate flagged properties
      const flaggedProperties = [
        {
          id: '1',
          property_id: 'prop_1',
          title: 'Suspicious Listing in Victoria Island',
          reason: 'Fake images reported',
          reporter_email: 'user@example.com',
          flagged_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          property_id: 'prop_2',
          title: 'Overpriced Property in Lekki',
          reason: 'Price manipulation',
          reporter_email: 'another@example.com',
          flagged_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        }
      ];

      return flaggedProperties;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const moderateProperty = async (propertyId: string, action: 'approve' | 'reject' | 'remove', notes?: string): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      setIsLoading(true);
      setError(null);

      let updateData: any = { updated_at: new Date().toISOString() };

      switch (action) {
        case 'approve':
          updateData.status = 'for_sale'; // or 'for_rent'
          updateData.moderation_status = 'approved';
          break;
        case 'reject':
          updateData.moderation_status = 'rejected';
          updateData.rejection_reason = notes;
          break;
        case 'remove':
          updateData.status = 'removed';
          updateData.removal_reason = notes;
          break;
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (error) throw error;

      // Log admin action
      await logAdminAction('moderate_property', { propertyId, action, notes });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logAdminAction = async (action: string, details: any): Promise<void> => {
    try {
      // This would typically go to an admin_actions or audit_log table
      const logEntry = {
        admin_id: user?.id,
        admin_email: user?.email,
        action,
        details: JSON.stringify(details),
        timestamp: new Date().toISOString(),
        ip_address: 'unknown' // Would get from request in real implementation
      };

      console.log('Admin Action Logged:', logEntry);
      
      // TODO: Implement actual logging to database
      // await supabase.from('admin_actions').insert(logEntry);
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }
  };

  const enableMaintenanceMode = async (enabled: boolean, message?: string): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      setIsLoading(true);
      setError(null);

      // This would typically update a system_settings table
      console.log('Maintenance mode:', { enabled, message });
      
      // Log admin action
      await logAdminAction('maintenance_mode', { enabled, message });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const performDatabaseBackup = async (): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      setIsLoading(true);
      setError(null);

      // This would trigger a database backup process
      console.log('Database backup initiated');
      
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Log admin action
      await logAdminAction('database_backup', { timestamp: new Date().toISOString() });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentActivity = async (limit: number = 20): Promise<any[]> => {
    if (!isAdmin) return [];

    try {
      // This would typically come from an activity log table
      // For now, we'll simulate recent activities
      const activities = [
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered',
          user_email: 'john.doe@email.com',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '2',
          type: 'property_listed',
          description: 'New property listed',
          property_title: 'Luxury Villa in Lekki',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          severity: 'info'
        },
        {
          id: '3',
          type: 'agent_verified',
          description: 'Agent verification completed',
          agent_name: 'Lagos Premium Properties',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          severity: 'success'
        },
        {
          id: '4',
          type: 'inquiry_received',
          description: 'Property inquiry received',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          severity: 'info'
        }
      ];

      return activities.slice(0, limit);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  return {
    isAdmin,
    isLoading,
    error,
    fetchPlatformStats,
    fetchSystemHealth,
    fetchUsers,
    fetchPendingAgents,
    verifyAgent,
    banUser,
    unbanUser,
    deleteUser,
    fetchFlaggedProperties,
    moderateProperty,
    exportData,
    enableMaintenanceMode,
    performDatabaseBackup,
    getRecentActivity
  };
};