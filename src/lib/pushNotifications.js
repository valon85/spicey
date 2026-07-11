import { base44 } from '@/api/base44Client';

// Only import Capacitor plugins on native platforms
let PushNotifications = null;
let Preferences = null;

if (typeof window !== 'undefined' && window.Capacitor) {
  try {
    PushNotifications = window.Capacitor.Plugins.PushNotifications;
    Preferences = window.Capacitor.Plugins.Preferences;
  } catch (e) {
    console.warn('[Push] Capacitor plugins not available');
  }
}

/**
 * Initialize iOS Push Notifications with APNs
 * Call this after user login
 */
export async function initializePushNotifications() {
  if (typeof window === 'undefined') return;
  
  // Skip on web - Capacitor only works on native
  if (!PushNotifications || !Preferences) {
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

    // Register with APNs (both regular and VoIP)
    await PushNotifications.register();
    console.log('[Push] Registered with APNs');

    // Listen for token (regular push)
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] APNs Token received:', token.value?.substring(0, 20) + '...');
      
      // Save token to backend for sending notifications
      try {
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
    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
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
    PushNotifications.addListener('pushNotificationActionPerformed', async (notification) => {
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

    // Get delivered notifications
    const delivered = await PushNotifications.getDeliveredNotifications();
    console.log('[Push] Delivered:', delivered);

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
  if (!Preferences) {
    return null;
  }
  
  try {
    // Try Capacitor Preferences first
    let { value } = await Preferences.get({ key: 'voipPushToken' });
    if (value) {
      console.log('[VoIP] Token from Preferences:', value);
      return value;
    }
    
    // Fallback: check if stored in window by native code
    if (window.voipPushToken) {
      console.log('[VoIP] Token from window:', window.voipPushToken);
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
      // Find the UserProfile by user_id (not id)
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
      const profile = profiles[0];
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          voip_push_token: voipToken,
          platform: 'ios'
        });
        console.log('[VoIP] Token saved to UserProfile id:', profile.id, 'token:', voipToken.substring(0, 16) + '...');
      } else {
        console.warn('[VoIP] No UserProfile found for user:', user.id);
      }
    }
  } catch (e) {
    console.error('[VoIP] Failed to save VoIP token:', e);
  }
}

/**
 * Send local notification (for testing or in-app alerts)
 */
export async function sendLocalNotification(title, body, data = {}) {
  // Skip on web
  if (!PushNotifications) {
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