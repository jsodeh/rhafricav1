import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Property, PropertyType, ListingType, PropertyStatus } from '@/types/database';

interface PropertyFilters {
  city?: string;
  state?: string;
  property_type?: PropertyType;
  listing_type?: ListingType;
  status?: PropertyStatus;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  featured?: boolean;
  search?: string;
}

interface PropertyWithAgent extends Property {
  real_estate_agents?: {
    id: string;
    agency_name: string | null;
    phone: string | null;
    rating: number | null;
    profile_image_url: string | null;
  } | null;
}

export const useProperties = (filters?: PropertyFilters) => {
  const [properties, setProperties] = useState<PropertyWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('properties')
        .select(`
          *,
          real_estate_agents (
            id,
            agency_name,
            phone,
            rating,
            profile_image_url
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }
      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters?.listing_type) {
        query = query.eq('listing_type', filters.listing_type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters?.max_price) {
        query = query.lte('price', filters.max_price);
      }
      if (filters?.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms);
      }
      if (filters?.bathrooms) {
        query = query.eq('bathrooms', filters.bathrooms);
      }
      if (filters?.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      setProperties(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyById = async (id: string): Promise<PropertyWithAgent | null> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          real_estate_agents (
            id,
            agency_name,
            phone,
            rating,
            profile_image_url,
            bio,
            years_experience,
            specializations
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Increment view count
      await supabase
        .from('properties')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);

      return data;
    } catch (err: any) {
      console.error('Error fetching property:', err);
      return null;
    }
  };

  const getFeaturedProperties = async (limit: number = 6): Promise<PropertyWithAgent[]> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          real_estate_agents (
            id,
            agency_name,
            phone,
            rating,
            profile_image_url
          )
        `)
        .eq('featured', true)
        .in('status', ['for_sale', 'for_rent'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error fetching featured properties:', err);
      return [];
    }
  };

  const getPropertiesByAgent = async (agentId: string): Promise<PropertyWithAgent[]> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          real_estate_agents (
            id,
            agency_name,
            phone,
            rating,
            profile_image_url
          )
        `)
        .eq('agent_id', agentId)
        .in('status', ['for_sale', 'for_rent'])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error fetching agent properties:', err);
      return [];
    }
  };

  const searchProperties = async (searchTerm: string, filters?: PropertyFilters): Promise<PropertyWithAgent[]> => {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          real_estate_agents (
            id,
            agency_name,
            phone,
            rating,
            profile_image_url
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
        .in('status', ['for_sale', 'for_rent']);

      // Apply additional filters
      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters?.listing_type) {
        query = query.eq('listing_type', filters.listing_type);
      }
      if (filters?.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters?.max_price) {
        query = query.lte('price', filters.max_price);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error searching properties:', err);
      return [];
    }
  };

  return {
    properties,
    isLoading,
    error,
    totalCount,
    refetch: fetchProperties,
    getPropertyById,
    getFeaturedProperties,
    getPropertiesByAgent,
    searchProperties,
  };
};

// Hook for single property details
export const useProperty = (propertyId: string) => {
  const [data, setData] = useState<PropertyWithAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select(`
            *,
            real_estate_agents (
              id,
              agency_name,
              phone,
              rating,
              profile_image_url,
              bio,
              years_experience,
              specializations
            )
          `)
          .eq('id', propertyId)
          .single();

        if (propertyError) {
          throw propertyError;
        }

        // Increment view count
        await supabase
          .from('properties')
          .update({ views_count: (propertyData.views_count || 0) + 1 })
          .eq('id', propertyId);

        setData(propertyData);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return {
    data,
    isLoading,
    error,
  };
};