// Database type definitions aligned with Supabase schema

// Exact types from the working SQL schema (setup-clean-database.sql)
export type PropertyType = 'apartment' | 'house' | 'duplex' | 'penthouse' | 'land' | 'commercial' | 'office';
export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'rented' | 'off_market';
export type ListingType = 'sale' | 'rent';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type AccountType = 'buyer' | 'seller' | 'agent' | 'admin' | 'owner' | 'renter';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          account_type: AccountType | null;
          bio: string | null;
          location: string | null;
          preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          account_type?: AccountType | null;
          bio?: string | null;
          location?: string | null;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          account_type?: AccountType | null;
          bio?: string | null;
          location?: string | null;
          preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          property_type: PropertyType;
          listing_type: ListingType;
          status: PropertyStatus;
          price: number;
          bedrooms: number | null;
          bathrooms: number | null;
          area_sqm: number | null;
          address: string;
          city: string;
          state: string;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          agent_id: string | null;
          owner_id: string | null;
          featured: boolean | null;
          verified: boolean | null;
          images: string[];
          amenities: string[];
          year_built: number | null;
          parking_spaces: number | null;
          furnishing_status: string | null;
          property_documents: Record<string, any>;
          virtual_tour_url: string | null;
          views_count: number | null;
          seo_slug: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          property_type: PropertyType;
          listing_type: ListingType;
          status?: PropertyStatus;
          price: number;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqm?: number | null;
          address: string;
          city: string;
          state: string;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          agent_id?: string | null;
          owner_id?: string | null;
          featured?: boolean | null;
          verified?: boolean | null;
          images?: string[];
          amenities?: string[];
          year_built?: number | null;
          parking_spaces?: number | null;
          furnishing_status?: string | null;
          property_documents?: Record<string, any>;
          virtual_tour_url?: string | null;
          views_count?: number | null;
          seo_slug?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          property_type?: PropertyType;
          listing_type?: ListingType;
          status?: PropertyStatus;
          price?: number;
          bedrooms?: number | null;
          bathrooms?: number | null;
          area_sqm?: number | null;
          address?: string;
          city?: string;
          state?: string;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          agent_id?: string | null;
          owner_id?: string | null;
          featured?: boolean | null;
          verified?: boolean | null;
          images?: string[];
          amenities?: string[];
          year_built?: number | null;
          parking_spaces?: number | null;
          furnishing_status?: string | null;
          property_documents?: Record<string, any>;
          virtual_tour_url?: string | null;
          views_count?: number | null;
          seo_slug?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          search_criteria: Record<string, any>;
          email_alerts: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          search_criteria: Record<string, any>;
          email_alerts?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          search_criteria?: Record<string, any>;
          email_alerts?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      real_estate_agents: {
        Row: {
          id: string;
          user_id: string | null;
          agency_name: string | null;
          license_number: string | null;
          phone: string | null;
          bio: string | null;
          profile_image_url: string | null;
          verification_status: VerificationStatus | null;
          rating: number | null;
          total_reviews: number | null;
          years_experience: number | null;
          specializations: string[] | null;
          social_media: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          agency_name?: string | null;
          license_number?: string | null;
          phone?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          verification_status?: VerificationStatus | null;
          rating?: number | null;
          total_reviews?: number | null;
          years_experience?: number | null;
          specializations?: string[] | null;
          social_media?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          agency_name?: string | null;
          license_number?: string | null;
          phone?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          verification_status?: VerificationStatus | null;
          rating?: number | null;
          total_reviews?: number | null;
          years_experience?: number | null;
          specializations?: string[] | null;
          social_media?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Utility types for easier use
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyFavorite = Database['public']['Tables']['property_favorites']['Row'];
export type SavedSearch = Database['public']['Tables']['saved_searches']['Row'];
export type RealEstateAgent = Database['public']['Tables']['real_estate_agents']['Row'];

export type InsertUserProfile = Database['public']['Tables']['user_profiles']['Insert'];
export type InsertProperty = Database['public']['Tables']['properties']['Insert'];
export type InsertPropertyFavorite = Database['public']['Tables']['property_favorites']['Insert'];
export type InsertSavedSearch = Database['public']['Tables']['saved_searches']['Insert'];

export type UpdateUserProfile = Database['public']['Tables']['user_profiles']['Update'];
export type UpdateProperty = Database['public']['Tables']['properties']['Update'];
export type UpdateSavedSearch = Database['public']['Tables']['saved_searches']['Update'];