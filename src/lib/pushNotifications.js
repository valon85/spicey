import { base44 } from '@/api/base44Client';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications } from '@capacitor/push-notifications';

const CONFIGURED_API_BASE_URL = (import.meta.env.VITE_SPICEY_API_URL || '').replace(/\/$/, '');
const NATIVE_API_BASE_URL = (import.meta.env.VITE_SPICEY_NATIVE_API_URL || 'https://spicey.live').replace(/\/$/, '');
const API_BASE_URL = CONFIGURED_API_BASE_URL || (Capacitor.isNativePlatform() ? NATIVE_API_BASE_URL : '');
const BUNDLE_ID = 'com.base69fe90d3bbe7ad47925e4a0a.app';

async function getDeviceId() {
  const existing = await Preferences.get({ key: 'spiceyDeviceId' }).catch(() => ({ value: null }));
  if (existing?.value) return existing.value;
  const id = `ios-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  await Preferences.set({ key: 'spiceyDeviceId', value: id });
  return id;
}

async function registerDeviceToken(token, tokenType) {
  if (!token) return null;
  const environmentKey = tokenType === 'voip' ? 'voipPushEnvironment' : 'apnsEnvironment';
  const storedEnvironment = await Preferences.get({ key: environmentKey }).catch(() => ({ value: null }));
  const environment = storedEnvironment?.value === 'development' ? 'development' : 'production';
  const authToken = await base44.auth.getToken?.();
  if (!authToken) throw new Error('No authenticated session token is available for device registration.');

  const response = await fetch(`${API_BASE_URL}/api/push/register-device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      token,
      token_type: tokenType,
      platform: 'ios',
      device_id: await getDeviceId(),
      bundle_id: BUNDLE_ID,
      environment,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Device registration failed (${response.status})`);
  console.log(`[Push] ${tokenType} token registered via API, environment=${environment}`);
  return data;
}

/**
 * Initialize iOS Push Notifications with APNs
 * Call this after user login
 */
export async function initializePushNotifications() {
  if (typeof window === 'undefined') return;
  
  // Skip on web - Capacitor only works on native
  if (!Capacitor.isNativePlatform()) {
    console.log('[Push] Skipping initialization - not on native platform');
    return;
  }

  try {
    // Request permission
    const permStatus = await PushNotifications.requestPermissions();
    console.log('[Push] Permission status:', permStatus);

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permission denied');
      return;
    }

    // Attach listeners before register(), otherwise a fast APNs registration
    // event can be missed and the regular token is never persisted.
    await PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] APNs token received');
      
      // Save token to backend for sending notifications
      try {
        await registerDeviceToken(token.value, 'apns');
        const user = await base44.auth.me();
        if (user) {
          // Find the UserProfile by user_id (not id)
          const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
          const profile = profiles[0];
          if (profile) {
            await base44.entities.UserProfile.update(profile.id, {
              push_token: token.value,
              platform: 'ios'
            });
            console.log('[Push] Token saved to UserProfile id:', profile.id);
          } else {
            console.warn('[Push] No UserProfile found for user:', user.id);
          }
        }
      } catch (e) {
        console.error('[Push] Failed to save token:', e);
      }
    });

    // Listen for notification received
    await PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      console.log('[Push] Notification received:', notification);
      
      // Play sound and vibrate based on type
      const data = notification.data || {};
      if (data.type === 'call') {
        // Call ringtone pattern - aggressive vibration
        console.log('[Call] Incoming call notification - starting vibration');
        if (navigator.vibrate) {
          // Vibrate continuously: 400ms on, 150ms off, repeat
          navigator.vibrate([400, 150, 400, 150, 600]);
          // Continue vibrating every 2 seconds until call is answered
          const vibrationInterval = setInterval(() => {
            navigator.vibrate([400, 150, 400, 150, 600]);
          }, 2000);
          // Store interval to clear it later
          window.__callVibrationInterval = vibrationInterval;
        }
      } else if (data.type === 'message') {
        // Message vibration
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    });

    // Listen for notification tapped
    await PushNotifications.addListener('pushNotificationActionPerformed', async (notification) => {
      console.log('[Push] Notification tapped:', notification);
      
      // Clear vibration if running
      if (window.__callVibrationInterval) {
        clearInterval(window.__callVibrationInterval);
        window.__callVibrationInterval = null;
      }
      
      // Navigate based on notification data
      const data = notification.notification.data;
      if (data.type === 'message') {
        window.location.href = '/messages';
      } else if (data.type === 'post') {
        window.location.href = '/';
      } else if (data.type === 'call') {
        // Handle incoming call - navigate to call screen
        console.log('[Push] Call notification tapped - opening call screen');
        // The call UI should already be visible from GlobalIncomingCallHandler
        // This just ensures the app opens if it was closed
      }
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] APNs registration error:', error);
    });

    await PushNotifications.register();
    console.log('[Push] Registered with APNs');

  } catch (error) {
    console.error('[Push] Initialization error:', error);
  }
}

/**
 * Get VoIP Push Token (for calls when app is closed)
 * Token is stored by native iOS in UserDefaults
 */
export async function getVoIPToken() {
  // Skip on web
  if (!Capacitor.isNativePlatform()) {
    return null;
  }
  
  try {
    // Try Capacitor Preferences first
    let { value } = await Preferences.get({ key: 'voipPushToken' });
    if (value) {
      console.log('[VoIP] Token found in Preferences');
      return value;
    }
    
    // Fallback: check if stored in window by native code
    if (window.voipPushToken) {
      console.log('[VoIP] Token found in native window state');
      return window.voipPushToken;
    }
  } catch (e) {
    console.error('[VoIP] Failed to get token:', e);
  }
  return null;
}

/**
 * Save VoIP token to backend
 */
export async function saveVoIPTokenToBackend(voipToken) {
  try {
    const user = await base44.auth.me();
    if (user && voipToken) {
      const registration = await registerDeviceToken(voipToken, 'voip');
      // Find the UserProfile by user_id (not id)
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
      const profile = profiles[0];
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          voip_push_token: voipToken,
          platform: 'ios'
        });
        console.log('[VoIP] Token saved to UserProfile id:', profile.id);
      } else {
        console.warn('[VoIP] No UserProfile found for user:', user.id);
      }
      return registration;
    }
    throw new Error('Missing authenticated user or VoIP token');
  } catch (e) {
    console.error('[VoIP] Failed to save VoIP token:', e);
    throw e;
  }
}

/**
 * Send local notification (for testing or in-app alerts)
 */
export async function sendLocalNotification(title, body, data = {}) {
  // Skip on web
  if (!Capacitor.isNativePlatform()) {
    console.warn('[Push] Local notifications not available on web');
    return;
  }
  
  try {
    await PushNotifications.schedule({
      notifications: [{
        title,
        body,
        id: Date.now().toString(),
        sound: 'default',
        data,
      }]
    });
  } catch (e) {
    console.error('[Push] Local notification error:', e);
  }
}
