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
  const { user } = useAuth();

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

      // Insert into Supabase and get the created record
      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotificationData)
        .select()
        .single();

      if (error) throw error;
      
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
      setPreferences(prev => ({ ...prev, ...newPreferences }));

      // In a real implementation, you would update Supabase
      // const { error } = await supabase
      //   .from('user_preferences')
      //   .upsert({
      //     user_id: user?.id,
      //     notification_preferences: { ...preferences, ...newPreferences },
      //   });

      // if (error) throw error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }, [preferences]);

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
  }, [fetchNotifications]);

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
    updatePreferences,
    sendPushNotification,
    sendEmailNotification,
  };
}; 