import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export const useWelcomeNotification = () => {
  const { user, isAuthenticated } = useAuth();
  const { createNotification } = useNotifications();

  useEffect(() => {
    // Only send welcome notification for new users
    const hasSeenWelcome = localStorage.getItem(`welcome_shown_${user?.id}`);
    
    if (isAuthenticated && user && !hasSeenWelcome) {
      // Mark as shown to prevent duplicate notifications
      localStorage.setItem(`welcome_shown_${user.id}`, 'true');
      // Wrap in try/catch so a failed insert (e.g., RLS) doesn't break the app
      try {
        createNotification(
          "Welcome to Africa Property Hub!",
          "We're glad to have you here. Explore listings, connect with agents, and find your perfect property.",
          "success",
          "system",
          "/dashboard"
        );
      } catch (e) {
        console.warn('Welcome notification failed, continuing:', e);
      }
    }
  }, [isAuthenticated, user, createNotification]);
};
