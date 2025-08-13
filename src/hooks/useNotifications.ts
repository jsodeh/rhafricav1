import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'property' | 'booking' | 'payment' | 'message' | 'system';
  read: boolean;
  action_url?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    property: boolean;
    booking: boolean;
    payment: boolean;
    message: boolean;
    system: boolean;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    categories: {
      property: true,
      booking: true,
      payment: true,
      message: true,
      system: true,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, resolvedRole } = useAuth();
  // Keep a copy of entire profile preferences JSON to avoid overwriting unrelated settings
  const [profilePreferences, setProfilePreferences] = useState<Record<string, any>>({});

  const mergePreferences = (
    base: NotificationPreferences,
    incoming?: Partial<NotificationPreferences>
  ): NotificationPreferences => {
    if (!incoming) return base;
    return {
      email: incoming.email ?? base.email,
      push: incoming.push ?? base.push,
      sms: incoming.sms ?? base.sms,
      categories: {
        property: incoming.categories?.property ?? base.categories.property,
        booking: incoming.categories?.booking ?? base.categories.booking,
        payment: incoming.categories?.payment ?? base.categories.payment,
        message: incoming.categories?.message ?? base.categories.message,
        system: incoming.categories?.system ?? base.categories.system,
      },
    };
  };

  // Load saved preferences from user_profiles.preferences.notification_settings
  const loadPreferencesFromProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
      if (error && (error as any).code !== 'PGRST116') throw error;
      const prefs = (data?.preferences as any) || {};
      setProfilePreferences(prefs);
      const stored: Partial<NotificationPreferences> | undefined = prefs.notification_settings;
      setPreferences(prev => mergePreferences(prev, stored));
    } catch (e) {
      console.error('Failed to load notification preferences:', e);
    }
  }, [user]);

  // Fetch user's notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Update local state immediately for optimistic UI
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Update in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

       if (error) {
        console.error('Error marking notification as read in DB:', error);
        // Optionally revert local state change on error
       }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);

      if (!user) return;

      // Update in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

       if (error) {
        console.error('Error marking all as read in DB:', error);
        // Optionally revert local state change on error
       }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );

      // Update unread count if notification was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification in DB:', error);
        // Optionally revert local state change on error
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Create new notification
  const createNotification = useCallback(async (
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    actionUrl?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      const newNotificationData = {
        user_id: user.id,
        title,
        message,
        type,
        category,
        read: false,
        action_url: actionUrl,
        metadata,
      };

      // Insert into Supabase and get the created record (ignore failures)
      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotificationData)
        .select()
        .single();

      if (error) {
        console.warn('createNotification ignored (non-fatal):', error.message);
        return null;
      }
      
      const newNotification = data as Notification;

      // Add to local state
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Send push notification if enabled
      if (preferences.push) {
        sendPushNotification(title, message);
      }

      // Send email notification if enabled
      if (preferences.email) {
        sendEmailNotification(title, message);
      }

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }, [user, preferences]);

  // Create notifications for all admins (admin + super_admin)
  const notifyAdmins = useCallback(async (
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    actionUrl?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      // Prefer secure RPC that inserts notifications for admins
      const { data, error } = await supabase.rpc('notify_admins', {
        p_title: title,
        p_message: message,
        p_type: type,
        p_category: category,
        p_action_url: actionUrl ?? null,
        p_metadata: metadata ?? null,
      });
      if (error) throw error;
      return { success: true, inserted: (data as any) ?? 0 };
    } catch (rpcErr: any) {
      console.warn('notifyAdmins RPC not available or failed:', rpcErr?.message || rpcErr);
      return { success: false, inserted: 0, error: rpcErr?.message };
    }
  }, []);

  // Notify a specific user by user_id via RPC
  const notifyUser = useCallback(async (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    actionUrl?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data, error } = await supabase.rpc('notify_user', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: type,
        p_category: category,
        p_action_url: actionUrl ?? null,
        p_metadata: metadata ?? null,
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.warn('notifyUser RPC failed:', e?.message || e);
      return { success: false, error: e?.message };
    }
  }, []);

  // Send push notification
  const sendPushNotification = useCallback(async (title: string, message: string) => {
    try {
      // Check if browser supports notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } else if (Notification.permission === 'default') {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          });
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }, []);

  // Send email notification
  const sendEmailNotification = useCallback(async (title: string, message: string) => {
    try {
      // In a real implementation, you would send email via your backend
      console.log('Sending email notification:', { title, message, user: user?.email });
      
      // Example: Send to your email service
      // await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: user?.email,
      //     subject: title,
      //     message: message,
      //   }),
      // });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }, [user]);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      // Locally merge first for responsive UI
      setPreferences(prev => mergePreferences(prev, newPreferences));

      if (!user) return;
      const updatedLocal = mergePreferences(preferences, newPreferences);

      const updatedProfilePreferences = {
        ...profilePreferences,
        notification_settings: updatedLocal,
      };

      const { error } = await supabase
        .from('user_profiles')
        .update({ preferences: updatedProfilePreferences })
        .eq('user_id', user.id);

      if (error) throw error;
      setProfilePreferences(updatedProfilePreferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }, [preferences, profilePreferences, user]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Avoid adding duplicates if already added via createNotification
          setNotifications(prev => {
            if (prev.find(n => n.id === newNotification.id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });

          setUnreadCount(prev => prev + 1);

          // Send push notification if enabled
          if (preferences.push) {
            sendPushNotification(newNotification.title, newNotification.message);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, preferences.push, sendPushNotification]);

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
    loadPreferencesFromProfile();
  }, [fetchNotifications, loadPreferencesFromProfile]);

  // Admin activity listeners: new signups and agent submissions
  useEffect(() => {
    if (!user || resolvedRole !== 'admin') return;
    const channel = supabase
      .channel('admin-activity-listeners')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_profiles' },
        (payload) => {
          const row: any = payload.new;
          const email = row?.email || 'New user';
          createNotification('New user signup', `${email} just joined`, 'info', 'system', '/admin-dashboard', { userId: row?.user_id });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'real_estate_agents' },
        (payload) => {
          const row: any = payload.new;
          createNotification('Agent profile submitted', 'A new agent profile is awaiting verification', 'info', 'system', '/admin-dashboard', { agentId: row?.id, userId: row?.user_id });
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user?.id, resolvedRole, createNotification]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    notifyAdmins,
    notifyUser,
    updatePreferences,
    sendPushNotification,
    sendEmailNotification,
  };
}; 