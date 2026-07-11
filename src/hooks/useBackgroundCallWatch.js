import { useEffect, useRef } from 'react';
import {
  requestNotificationPermission,
  registerServiceWorker,
  sendSwMessage,
  getAuthToken,
  canReceiveBackgroundNotifications,
} from '@/lib/notifications';

/**
 * Registers the service worker and starts background call/message watching.
 * Runs once when userId is available.
 */
export default function useBackgroundCallWatch(userId) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!userId || registeredRef.current) return;
    registeredRef.current = true;

    const handleVisibility = () => {
      if (!document.hidden) {
        sendSwMessage({ type: 'READY' });
      } else {
        const freshToken = getAuthToken();
        if (freshToken) {
          sendSwMessage({ type: 'INIT_WATCH', userId, token: freshToken, baseUrl: window.location.origin });
        }
      }
    };

    const setup = async () => {
      const perm = await requestNotificationPermission();
      if (perm !== 'granted') return;

      const reg = await registerServiceWorker();
      if (!reg) return;

      const token = getAuthToken();
      if (!token) return;

      sendSwMessage({ type: 'INIT_WATCH', userId, token, baseUrl: window.location.origin });
      document.addEventListener('visibilitychange', handleVisibility);
    };

    setup();

    return () => {
      sendSwMessage({ type: 'STOP_WATCH' });
      document.removeEventListener('visibilitychange', handleVisibility);
      registeredRef.current = false;
    };
  }, [userId]);
}