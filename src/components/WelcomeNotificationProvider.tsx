import { useWelcomeNotification } from '@/hooks/useWelcomeNotification';

export const WelcomeNotificationProvider = () => {
  useWelcomeNotification();
  return null;
};
