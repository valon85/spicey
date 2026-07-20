import { useEffect, useRef } from 'react';
import { registerPlugin } from '@capacitor/core';
import { getVoIPToken, saveVoIPTokenToBackend } from '@/lib/pushNotifications';
import { useAuth } from '@/lib/AuthContext';

const CallKit = registerPlugin('CallKit');

/**
 * Initialize VoIP Push Notifications for iOS calls
 * This retrieves the VoIP token from native iOS and saves it to backend
 * Should be rendered once in your app (e.g., in App.jsx)
 * NON-BLOCKING: VoIP errors will not prevent app rendering
 */
export default function VoIPProvider() {
  const { user, authChecked } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!authChecked || !user || initialized.current) return;
    initialized.current = true;
    
    // CRITICAL: Defer VoIP init with setTimeout so it never blocks rendering
    const timeoutId = setTimeout(async () => {
      try {
        console.log('[VoIP] Starting deferred initialization for user:', user.email);
        
        // Quick token fetch with timeout - abort if takes too long
        let voipToken = await Promise.race([
          getVoIPToken(),
          new Promise(resolve => setTimeout(() => resolve(null), 2000))
        ]);
        
        if (voipToken) {
          console.log('[VoIP] Token retrieved');
          await saveVoIPTokenToBackend(voipToken);
          console.log('[VoIP] Token saved to backend');
        } else {
          console.warn('[VoIP] No token - will retry on next app launch');
        }
      } catch (error) {
        console.error('[VoIP] Non-blocking error (app will continue):', error.message);
      }
    }, 1000); // Wait 1s after app renders
    
    let nativeListener;
    CallKit.addListener('voipTokenUpdated', async ({ token }) => {
      if (!token) return;
      console.log('[VoIP] Received updated token from native');
      try {
        await saveVoIPTokenToBackend(token);
      } catch (error) {
        console.error('[VoIP] Updated token registration failed:', error.message);
      }
    }).then((listener) => {
      nativeListener = listener;
    }).catch((error) => {
      console.error('[VoIP] Failed to attach native token listener:', error.message);
    });
    
    return () => {
      clearTimeout(timeoutId);
      nativeListener?.remove();
    };
  }, [authChecked, user]);

  return null;
}
