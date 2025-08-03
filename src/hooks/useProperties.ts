
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: 'apartment' | 'house' | 'duplex' | 'penthouse' | 'land' | 'commercial' | 'office';
  listing_type: 'sale' | 'rent';
  status: 'for_sale' | 'for_rent' | 'sold' | 'rented' | 'off_market';
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  address: string;
  city: string;
  state: string;
  country: string | null;
  featured: boolean | null;
  verified: boolean | null;
  images: string[] | null;
  amenities: string[] | null;
  year_built: number | null;
  parking_spaces: number | null;
  furnishing_status: string | null;
  views_count: number | null;
  created_at: string;
  agent_id: string | null;
  real_estate_agents?: {
    agency_name: string | null;
    phone: string | null;
    rating: number | null;
  } | null;
}

interface UsePropertiesOptions {
  city?: string;
  propertyType?: string;
  priceRange?: string;
  searchTerm?: string;
}

const validPropertyTypes = ['apartment', 'house', 'duplex', 'penthouse', 'land', 'commercial', 'office'] as const;

export const useProperties = (options: UsePropertiesOptions = {}) => {
  return useQuery({
    queryKey: ['properties', options],
    queryFn: async () => {
      console.log('Fetching properties with options:', options);
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          real_estate_agents (
            agency_name,
            phone,
            rating
          )
        `)
        .eq('status', 'for_sale')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.city) {
        query = query.ilike('city', `%${options.city}%`);
      }

      if (options.propertyType && validPropertyTypes.includes(options.propertyType as any)) {
        query = query.eq('property_type', options.propertyType as typeof validPropertyTypes[number]);
      }

      if (options.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,address.ilike.%${options.searchTerm}%,city.ilike.%${options.searchTerm}%`);
      }

      // Apply price range filter
      if (options.priceRange) {
        switch (options.priceRange) {
          case 'under-5m':
            query = query.lt('price', 5000000);
            break;
          case '5m-20m':
            query = query.gte('price', 5000000).lte('price', 20000000);
            break;
          case '20m-50m':
            query = query.gte('price', 20000000).lte('price', 50000000);
            break;
          case 'above-50m':
            query = query.gt('price', 50000000);
            break;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      console.log('Fetched properties:', data);
      return data as Property[];
    },
  });
};
