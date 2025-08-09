import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Heart, Search, Mail, Calendar, Home } from 'lucide-react';

interface Activity {
  id: string;
  type: 'property_viewed' | 'property_saved' | 'search_created' | 'agent_contacted' | 'viewing_scheduled' | 'property_listed';
  title: string;
  description?: string;
  time: string;
  icon: any;
  property_id?: string;
  agent_id?: string;
}

export const useActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchActivities();
    }
  }, [user?.id]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const activities: Activity[] = [];

      // Fetch property favorites (saved properties)
      const { data: favorites, error: favError } = await supabase
        .from('property_favorites')
        .select(`
          id,
          created_at,
          properties (
            id,
            title
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!favError && favorites) {
        favorites.forEach(fav => {
          const property = Array.isArray(fav.properties) ? fav.properties[0] : fav.properties;
          
          activities.push({
            id: `fav-${fav.id}`,
            type: 'property_saved',
            title: `Saved ${property?.title || 'property'} to favorites`,
            time: formatTimeAgo(fav.created_at),
            icon: Heart,
            property_id: property?.id
          });
        });
      }

      // Fetch saved searches
      const { data: searches, error: searchError } = await supabase
        .from('saved_searches')
        .select('id, name, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!searchError && searches) {
        searches.forEach(search => {
          activities.push({
            id: `search-${search.id}`,
            type: 'search_created',
            title: `Created search: ${search.name}`,
            time: formatTimeAgo(search.created_at),
            icon: Search
          });
        });
      }

      // Fetch property inquiries
      const { data: inquiries, error: inquiryError } = await supabase
        .from('property_inquiries')
        .select(`
          id,
          created_at,
          properties (
            id,
            title
          ),
          real_estate_agents (
            id,
            agency_name
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!inquiryError && inquiries) {
        inquiries.forEach(inquiry => {
          const property = Array.isArray(inquiry.properties) ? inquiry.properties[0] : inquiry.properties;
          const agent = Array.isArray(inquiry.real_estate_agents) ? inquiry.real_estate_agents[0] : inquiry.real_estate_agents;
          
          activities.push({
            id: `inquiry-${inquiry.id}`,
            type: 'agent_contacted',
            title: `Contacted ${agent?.agency_name || 'agent'} about ${property?.title || 'property'}`,
            time: formatTimeAgo(inquiry.created_at),
            icon: Mail,
            property_id: property?.id,
            agent_id: agent?.id
          });
        });
      }

      // Fetch property viewings
      const { data: viewings, error: viewingError } = await supabase
        .from('property_viewings')
        .select(`
          id,
          created_at,
          scheduled_date,
          properties (
            id,
            title
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!viewingError && viewings) {
        viewings.forEach(viewing => {
          const property = Array.isArray(viewing.properties) ? viewing.properties[0] : viewing.properties;
          
          activities.push({
            id: `viewing-${viewing.id}`,
            type: 'viewing_scheduled',
            title: `Scheduled viewing for ${property?.title || 'property'}`,
            description: `Viewing date: ${new Date(viewing.scheduled_date).toLocaleDateString()}`,
            time: formatTimeAgo(viewing.created_at),
            icon: Calendar,
            property_id: property?.id
          });
        });
      }

      // Sort all activities by time (most recent first)
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setActivities(activities.slice(0, 20)); // Limit to 20 most recent activities
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'time'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `manual-${Date.now()}`,
      time: 'Just now'
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
  };

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
    addActivity
  };
};