import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { initializePushNotifications } from '@/lib/pushNotifications';

/**
 * Initialize push notifications when user is authenticated
 * This component should be rendered once in your app (e.g., in App.jsx)
 * NON-BLOCKING: Push errors will not prevent app rendering
 */
export default function PushNotificationProvider() {
  const { user, authChecked } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!authChecked || !user || initialized.current) return;
    initialized.current = true;
    
    // CRITICAL: Defer push init with setTimeout so it never blocks rendering
    const timeoutId = setTimeout(async () => {
      try {
        console.log('[Push] Starting deferred initialization for user:', user.email);
        // Abort if takes too long - app must render
        const initPromise = initializePushNotifications();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Push init timeout')), 5000)
        );
        await Promise.race([initPromise, timeoutPromise]);
        console.log('[Push] Initialization completed');
      } catch (error) {
        console.error('[Push] Non-blocking error (app will continue):', error.message);
      }
    }, 1000); // Wait 1s after app renders
    
    return () => clearTimeout(timeoutId);
  }, [authChecked, user]);

  return null;
}