import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Agent {
  id: string;
  user_id: string | null;
  agency_name: string | null;
  bio: string | null;
  phone: string | null;
  profile_image_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  specializations: string[] | null;
  years_experience: number | null;
  license_number: string | null;
  verification_status: 'pending' | 'verified' | 'rejected' | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UseAgentsOptions {
  location?: string;
  specialization?: string;
  searchTerm?: string;
  verifiedOnly?: boolean;
}

export const useAgents = (options: UseAgentsOptions = {}) => {
  return useQuery({
    queryKey: ['agents', options],
    queryFn: async () => {
      console.log('Fetching agents with options:', options);
      
      let query = supabase
        .from('real_estate_agents')
        .select('*')
        .order('rating', { ascending: false, nullsFirst: false });

      // Apply filters
      if (options.verifiedOnly) {
        query = query.eq('verification_status', 'verified');
      }

      if (options.specialization) {
        query = query.contains('specializations', [options.specialization]);
      }

      if (options.searchTerm) {
        query = query.or(`agency_name.ilike.%${options.searchTerm}%,bio.ilike.%${options.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching agents:', error);
        throw error;
      }

      console.log('Fetched agents:', data);
      return data as Agent[];
    },
  });
};

// Hook for fetching featured agents (top rated, verified)
export const useFeaturedAgents = (limit: number = 6) => {
  return useQuery({
    queryKey: ['featured-agents', limit],
    queryFn: async () => {
      console.log('Fetching featured agents, limit:', limit);
      
      const { data, error } = await supabase
        .from('real_estate_agents')
        .select('*')
        .eq('verification_status', 'verified')
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured agents:', error);
        throw error;
      }

      console.log('Fetched featured agents:', data);
      return data as Agent[];
    },
  });
}; 