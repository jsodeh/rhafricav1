import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, SavedSearch, UpdateUserProfile, PropertyType, ListingType, PropertyStatus } from '@/types/database';

// UserProfile type is now imported from database types

interface SavedProperty {
  id: string;
  property_id: string;
  created_at: string;
  properties: {
    id: string;
    title: string;
    price: number;
    address: string;
    city: string;
    state: string;
    images: string[];
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
    property_type: PropertyType;
    listing_type: ListingType;
    status: PropertyStatus;
  } | null;
}

// SavedSearch type is now imported from database types

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Fetch saved properties
      const { data: savedPropsData, error: savedPropsError } = await supabase
        .from('property_favorites')
        .select(`
          id,
          property_id,
          created_at,
          properties (
            id,
            title,
            price,
            address,
            city,
            state,
            images,
            bedrooms,
            bathrooms,
            area_sqm,
            property_type,
            listing_type,
            status
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (savedPropsError) {
        console.error('Error fetching saved properties:', savedPropsError);
      } else {
        // Transform the data to match our interface
        const transformedData = (savedPropsData || []).map(item => ({
          ...item,
          properties: Array.isArray(item.properties)
            ? (item.properties.length > 0 ? item.properties[0] : null)
            : item.properties
        }));
        setSavedProperties(transformedData);
      }

      // Fetch saved searches
      const { data: savedSearchData, error: savedSearchError } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (savedSearchError) {
        console.error('Error fetching saved searches:', savedSearchError);
      } else {
        setSavedSearches(savedSearchData || []);
      }

    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: UpdateUserProfile) => {
    if (!user?.id) return { success: false, error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.message };
    }
  };

  const addToFavorites = async (propertyId: string) => {
    if (!user?.id) return { success: false, error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh saved properties
      fetchUserData();
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding to favorites:', err);
      return { success: false, error: err.message };
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user?.id) return { success: false, error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('property_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      // Refresh saved properties
      fetchUserData();
      return { success: true };
    } catch (err: any) {
      console.error('Error removing from favorites:', err);
      return { success: false, error: err.message };
    }
  };

  const saveSearch = async (name: string, criteria: Record<string, any>, emailAlerts: boolean = false) => {
    if (!user?.id) return { success: false, error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name,
          search_criteria: criteria,
          email_alerts: emailAlerts
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh saved searches
      fetchUserData();
      return { success: true, data };
    } catch (err: any) {
      console.error('Error saving search:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    profile,
    savedProperties,
    savedSearches,
    isLoading,
    error,
    updateProfile,
    addToFavorites,
    removeFromFavorites,
    saveSearch,
    refetch: fetchUserData
  };
};