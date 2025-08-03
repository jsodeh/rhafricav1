import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface AdvertisingPackage {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  maxListings: number;
  isActive: boolean;
  description: string;
}

export interface AdvertisingCampaign {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  status: 'active' | 'paused' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  totalAmount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  listingsUsed: number;
  maxListings: number;
  features: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  totalViews: number;
  totalClicks: number;
  totalLeads: number;
  conversionRate: number;
  averageCTR: number;
  topPerformingListings: Array<{
    id: string;
    title: string;
    views: number;
    clicks: number;
    leads: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    clicks: number;
    leads: number;
  }>;
}

export interface DemoRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  businessType: string;
  demoType: 'virtual' | 'in_person' | 'phone';
  preferredDate: string;
  preferredTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  assignedTo?: string;
  createdAt: string;
}

export const useAdvertising = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<AdvertisingCampaign[]>([]);
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new advertising campaign
  const createCampaign = async (campaignData: {
    packageName: string;
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    totalAmount: number;
    features: string[];
    maxListings: number;
    metadata?: any;
  }): Promise<{ success: boolean; campaignId?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const endDate = new Date(campaignData.startDate);
      if (campaignData.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (campaignData.billingCycle === 'quarterly') {
        endDate.setMonth(endDate.getMonth() + 3);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const campaign: Omit<AdvertisingCampaign, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        packageId: `pkg_${campaignData.packageName.toLowerCase()}`,
        packageName: campaignData.packageName,
        status: 'active',
        startDate: campaignData.startDate,
        endDate: endDate.toISOString().split('T')[0],
        totalAmount: campaignData.totalAmount,
        billingCycle: campaignData.billingCycle,
        listingsUsed: 0,
        maxListings: campaignData.maxListings,
        features: campaignData.features,
        metadata: campaignData.metadata,
      };

      // In a real app, this would be saved to the database
      const campaignId = `camp_${Date.now()}`;
      
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCampaigns(prev => [...prev, { 
        ...campaign, 
        id: campaignId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);

      return { success: true, campaignId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule demo request
  const scheduleDemoRequest = async (demoData: {
    name: string;
    email: string;
    phone: string;
    company: string;
    businessType: string;
    demoType: 'virtual' | 'in_person' | 'phone';
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }): Promise<{ success: boolean; requestId?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestId = `demo_${Date.now()}`;
      
      const demoRequest: DemoRequest = {
        id: requestId,
        ...demoData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDemoRequests(prev => [...prev, demoRequest]);

      return { success: true, requestId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule demo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Get active campaign for user
  const getActiveCampaign = (): AdvertisingCampaign | null => {
    return campaigns.find(campaign => 
      campaign.userId === user?.id && campaign.status === 'active'
    ) || null;
  };

  // Get campaign analytics
  const getCampaignAnalytics = async (campaignId: string): Promise<{ 
    success: boolean; 
    analytics?: CampaignAnalytics; 
    error?: string 
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call for analytics
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockAnalytics: CampaignAnalytics = {
        totalViews: Math.floor(Math.random() * 10000) + 1000,
        totalClicks: Math.floor(Math.random() * 500) + 50,
        totalLeads: Math.floor(Math.random() * 50) + 5,
        conversionRate: Math.random() * 5 + 1,
        averageCTR: Math.random() * 3 + 1,
        topPerformingListings: [
          {
            id: '1',
            title: '3 Bedroom Apartment in Victoria Island',
            views: 1250,
            clicks: 89,
            leads: 12,
          },
          {
            id: '2',
            title: 'Luxury Villa in Banana Island',
            views: 980,
            clicks: 67,
            leads: 8,
          },
        ],
        dailyStats: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          views: Math.floor(Math.random() * 200) + 20,
          clicks: Math.floor(Math.random() * 20) + 2,
          leads: Math.floor(Math.random() * 5),
        })).reverse(),
      };

      return { success: true, analytics: mockAnalytics };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Pause/Resume campaign
  const updateCampaignStatus = async (
    campaignId: string, 
    status: 'active' | 'paused'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, status, updatedAt: new Date().toISOString() }
          : campaign
      ));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Load user campaigns on mount
  useEffect(() => {
    if (user) {
      // In a real app, load campaigns from database
      // For now, we'll just initialize with empty array
      setCampaigns([]);
      setDemoRequests([]);
    }
  }, [user]);

  return {
    campaigns,
    demoRequests,
    isLoading,
    error,
    createCampaign,
    scheduleDemoRequest,
    getActiveCampaign,
    getCampaignAnalytics,
    updateCampaignStatus,
  };
};

export default useAdvertising;
