import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44, initializeAuth, persistLogin, TokenStorage } from '@/api/base44Client';
console.log('[BUILD_TEST_20260625_NO_PENDING_USER_FIX]');
import { initializeIOSAuth } from '@/lib/iosAuthFix';
// TokenStorage.setUser caches user data for offline/cold-start session recovery
// TokenStorage is used by logout() to clear tokens from Capacitor Preferences + localStorage
import { Preferences } from '@capacitor/preferences';
import useBackgroundCallWatch from '@/hooks/useBackgroundCallWatch';
import { App as CapacitorApp } from '@capacitor/app';
import { CallKitAPI } from '@/lib/callkit';

const AuthContext = createContext();

function isPasswordRecoveryUrl() {
  if (typeof window === 'undefined') return false;
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search || '');
  const type = hashParams.get('type') || searchParams.get('type');
  return window.location.pathname.includes('/auth/reset-password')
    || type === 'recovery'
    || !!searchParams.get('token_hash')
    || !!hashParams.get('token_hash')
    || !!(hashParams.get('access_token') && hashParams.get('refresh_token'));
}

// AuthContext loaded

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [missedCallsUnseen, setMissedCallsUnseen] = useState(0);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('AUTH_CONTEXT: AuthProvider mounting');
  console.log('═══════════════════════════════════════════════════════');
  

  
  // Background call watch (push-style notifications when tab is backgrounded)
  useBackgroundCallWatch(user?.id);

  // Use protocol only — window.Capacitor is not reliably set at React render time
  const getIsNative = () => typeof window !== 'undefined'
    && ['capacitor:', 'spicey:'].includes(window.location.protocol);
  const isNative = getIsNative();



  // Register service worker only on the production domain (spicey.live), never on Base44 preview
  const isProductionDomain = typeof window !== 'undefined' &&
    ['spicey.live', 'www.spicey.live'].includes(window.location.hostname);
  useEffect(() => {
    if (!user?.id || isNative || !isProductionDomain) return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }
  }, [user?.id]);

  // Keep an in-app subscription on every platform. APNs handles background
  // delivery, while this subscription is the reliable foreground fallback.
  useEffect(() => {
    if (!user?.id) return;
    
    const uid = user.id;
    let isMounted = true;
    let pollTimer = null;
    let baselineLoaded = false;
    const knownNotificationIds = new Set();

    const processNotification = (notif) => {
      if (!isMounted) return;
      if (!notif || notif.user_id !== uid) return;

      // Determine title + vibration pattern by type
      let title = 'Spicey';
      let vibPattern = [100, 50, 100];

      if (notif.type === 'message') {
        title = '💬 New Message';
        vibPattern = [100, 50, 100];
      } else if (notif.type === 'like') {
        title = '❤️ New Like';
        vibPattern = [80];
      } else if (notif.type === 'follow') {
        title = '👤 New Follower';
        vibPattern = [80];
      } else if (notif.type === 'comment') {
        title = '💬 New Comment';
        vibPattern = [100, 50, 100];
      } else if (notif.type === 'follow_request') {
        title = '👤 Follow Request';
        vibPattern = [80];
      }

      // Vibrate
      if (navigator.vibrate) navigator.vibrate(vibPattern);

      // Show OS notification (works even when tab is in background)
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const icon = notif.actor_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(notif.actor_username || 'User');
          // Prefer SW notification (works when tab is backgrounded)
          if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.ready.then(reg => {
              reg.showNotification(title, {
                body: notif.message || '',
                icon,
                tag: 'notif-' + notif.id,
                vibrate: vibPattern,
              });
            }).catch(() => {
              new Notification(title, { body: notif.message || '', icon, tag: 'notif-' + notif.id });
            });
          } else {
            new Notification(title, { body: notif.message || '', icon, tag: 'notif-' + notif.id });
          }
        } catch (e) {
          console.warn('[NOTIF] Show failed:', e);
        }
      }
    };

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      const notif = event.data;
      if (!notif?.id || knownNotificationIds.has(notif.id)) return;
      knownNotificationIds.add(notif.id);
      processNotification(notif);
    });

    // The compatibility client has no persistent Realtime socket yet, so a
    // short authenticated poll guarantees foreground delivery on both phones.
    const pollNotifications = async () => {
      if (!isMounted) return;
      try {
        const rows = await base44.entities.Notification.filter(
          { user_id: uid },
          '-created_date',
          30
        );
        const ordered = [...(rows || [])].reverse();
        if (!baselineLoaded) {
          ordered.forEach((notif) => notif?.id && knownNotificationIds.add(notif.id));
          baselineLoaded = true;
        } else {
          ordered.forEach((notif) => {
            if (!notif?.id || knownNotificationIds.has(notif.id)) return;
            knownNotificationIds.add(notif.id);
            processNotification(notif);
          });
        }
      } catch (error) {
        console.warn('[NOTIF] Foreground poll failed:', error?.message || error);
      } finally {
        if (isMounted) pollTimer = setTimeout(pollNotifications, 4000);
      }
    };
    pollNotifications();

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(pollTimer);
    };
  }, [user?.id]);

  const checkingRef = useRef(false);
  const seenCallIdsRef = useRef(new Set()); // track calls we've already dismissed
  const ringingTimersRef = useRef({}); // timers for missed-call detection
  const userRef = useRef(null);
  const incomingCallRef = useRef(null);
  const activeCallRef = useRef(null);
  // Prevent appStateChange from restoring session after intentional logout
  const loggedOutIntentionallyRef = useRef(false);

  // Keep refs in sync with state for use inside intervals/listeners
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
  useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);

  // Protect user state - only logout() can clear it
  useEffect(() => {
    if (user?.id && loggedOutIntentionallyRef.current) {
      console.log('⚠️ USER CLEAR ATTEMPT BLOCKED');
    }
  }, [user?.id]);

  const preventUserClear = (newUser) => {
    if (userRef.current?.id && !newUser?.id) {
      console.log('🚫 BLOCKED: Attempt to clear user (id=' + userRef.current.id + ')');
      return false;
    }
    return true;
  };

  useEffect(() => {
    let authTimeout = null;
    if (isNative) {
      authTimeout = setTimeout(() => {
        if (!userRef.current?.id) {
          console.warn('[AUTH_INIT] iOS restore timeout — showing login instead of black loading screen.');
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }, 1800);
    }

    const clearAuthTimeout = () => {
      if (authTimeout) {
        clearTimeout(authTimeout);
        authTimeout = null;
      }
    };

    const initAuth = async () => {
      if (isPasswordRecoveryUrl()) {
        console.log('[AUTH_INIT] Password recovery URL detected; skipping normal auth restore.');
        clearAuthTimeout();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }

      console.log('═══════════════════════════════════════════════════════');
      console.log('AUTH_INIT: Starting initAuth function');
      console.log('═══════════════════════════════════════════════════════');
      try {
        const restoredUser = await initializeAuth();
        console.log('[AUTH_INIT] initializeAuth returned:', restoredUser?.id ? `user.id=${restoredUser.id}` : 'NULL');
        if (restoredUser?.id && !restoredUser.id?.startsWith('pending_')) {
          console.log('SET_USER', restoredUser.id);
          console.log('AUTH_STATE', { userId: restoredUser.id, authChecked: true, source: 'initAuth' });
          clearAuthTimeout();
          userRef.current = restoredUser;
          setUser(restoredUser);
          setIsAuthenticated(true);
          setIsLoadingAuth(false);
          setAuthChecked(true);
          return;
        }
        // Fallback: Check cached user if auth.me() returned pending or null
        console.log('[AUTH_INIT] No valid user from initializeAuth, checking cached user...');
        try {
          let hasRecoverableSession = false;
          try {
            const session = JSON.parse(localStorage.getItem('spicey_session') || 'null');
            hasRecoverableSession = !!(session?.access_token && session?.refresh_token);
          } catch (_) {}
          if (!hasRecoverableSession) {
            console.log('[AUTH_INIT] Cached user skipped: no recoverable Supabase session');
            clearAuthTimeout();
            setIsLoadingAuth(false);
            setAuthChecked(true);
            return;
          }

          const cachedStr = localStorage.getItem('spicey_cached_user');
          let cachedUser = null;
          if (cachedStr) {
            try { cachedUser = JSON.parse(cachedStr); } catch (_) {}
          }
          if (!cachedUser && isNative) {
            try {
              const { value } = await Preferences.get({ key: 'spicey_cached_user' });
              if (value) { try { cachedUser = JSON.parse(value); } catch (_) {} }
            } catch (_) {}
          }
          if (cachedUser?.email) {
            console.log('[AUTH_INIT] ✅ Using cached user:', cachedUser.email, cachedUser.id);
            clearAuthTimeout();
            userRef.current = cachedUser;
            setUser(cachedUser);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            setAuthChecked(true);
            return;
          }
        } catch (err) {
          console.error('[AUTH_INIT] Cached user check error:', err.message);
        }
        console.log('CLEAR_USER - initAuth returned no user and no cache');
        console.log('AUTH_STATE', { userId: null, authChecked: true, source: 'initAuth-noUser' });
        clearAuthTimeout();
        setIsLoadingAuth(false);
        setAuthChecked(true);
      } catch (err) {
        console.error('[AUTH_INIT] ❌ ERROR:', err.message);
        console.log('CLEAR_USER - initAuth threw error');
        console.log('AUTH_STATE', { userId: null, authChecked: true, source: 'initAuth-error' });
        clearAuthTimeout();
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    };
    
    initAuth();

    // ── Capacitor App foreground/resume listener ────────────────────────────
    // When iOS brings the app to foreground after background, re-inject token
    // but DO NOT force re-login if user is already in state.
    let appStateListener = null;
    if (isNative) {
      CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
        if (!isActive) return;
        if (loggedOutIntentionallyRef.current) return;
        if (userRef.current?.id) {
          const token = await TokenStorage.get();
          if (token) {
            try { localStorage.setItem('spicey_session', JSON.stringify({ access_token: token, token_type: 'bearer' })); localStorage.setItem('token', token); } catch (_) {}
          }
          return;
        }
        const token = await TokenStorage.get();
        if (token && !userRef.current?.id) {
          const restoredUser = await initializeAuth();
          if (restoredUser?.id && protectedSetUser(restoredUser)) {
            setUser(restoredUser);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            setAuthChecked(true);
          }
        }
      }).then(listener => { appStateListener = listener; });
    }
    
    const handleAuthSuccess = (event) => {
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║  AUTH_CONTEXT: auth-success event RECEIVED   ║');
      console.log('╚══════════════════════════════════════════════╝');
      const user = event.detail;
      console.log('[AUTH_CONTEXT] event.detail:', user ? `user.id=${user.id}` : 'NULL');
      console.log('[AUTH_CONTEXT] user keys:', user ? Object.keys(user) : 'NULL');
      console.log('[AUTH_CONTEXT] userRef.current before:', userRef.current?.id || 'NULL');
      
      if (user?.id && !user.id.startsWith('pending_')) {
        console.log('SET_USER', user.id);
        console.log('AUTH_STATE', { userId: user.id, authChecked: true, source: 'auth-success-event' });
        clearAuthTimeout();
        userRef.current = user;
        setUser(user);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        TokenStorage.setUser(user).catch(err => console.error('[AUTH_CONTEXT] TokenStorage.setUser error:', err));
        
        // CRITICAL: Save to spicey_cached_user immediately
        try {
          const userCache = { ...user, _cached_at: new Date().toISOString() };
          localStorage.setItem('spicey_cached_user', JSON.stringify(userCache));
          if (isNative) {
            Preferences.set({ key: 'spicey_cached_user', value: JSON.stringify(userCache) }).catch(() => {});
          }
          console.log('[AUTH_CONTEXT] ✅ User cached to localStorage + Capacitor');
        } catch (err) {
          console.error('[AUTH_CONTEXT] Cache save error:', err.message);
        }
      } else if (user?.email && !user?.id) {
        // Token saved but no real id yet — retry auth.me() async without blocking
        console.warn('[AUTH_CONTEXT] User has email but no id — retrying auth.me()...');
        (async () => {
          const token = await TokenStorage.get().catch(() => null);
          if (!token) return;
          try { base44.auth.setToken(token); } catch (_) {}
          for (let i = 0; i < 3; i++) {
            await new Promise(r => setTimeout(r, 800 + i * 600));
            try {
              const result = await base44.auth.me();
              if (result?.id && !result.id.startsWith('pending_')) {
                console.log('[AUTH_CONTEXT] Retry auth.me() succeeded:', result.id);
                userRef.current = result;
                setUser(result);
                setIsAuthenticated(true);
                setIsLoadingAuth(false);
                setAuthChecked(true);
                TokenStorage.setUser(result).catch(() => {});
                try {
                  const uc = { ...result, _cached_at: new Date().toISOString() };
                  localStorage.setItem('spicey_cached_user', JSON.stringify(uc));
                  if (isNative) Preferences.set({ key: 'spicey_cached_user', value: JSON.stringify(uc) }).catch(() => {});
                } catch (_) {}
                return;
              }
            } catch (err) {
              console.warn('[AUTH_CONTEXT] Retry attempt', i + 1, 'error:', err.message);
            }
          }
          console.error('[AUTH_CONTEXT] All retries failed — user will see login screen');
          clearAuthTimeout();
          setIsLoadingAuth(false);
          setAuthChecked(true);
        })();
      } else {
        console.error('[AUTH_CONTEXT] ❌ user missing id and email — event.detail was:', user);
      }
    };
    console.log('[AUTH_CONTEXT] Adding auth-success event listener');
    window.addEventListener('auth-success', handleAuthSuccess);
    
    // Listen for messages from service worker (when notification is clicked while app was closed)
    const handleSWMessage = (event) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === 'INCOMING_CALL_ACTION') {
        const { action, call_session_id, caller_name, call_type } = msg;
        if (action === 'accept' || action === 'decline') {
          setIncomingCall({
            id: call_session_id,
            caller_id: 'unknown',
            type: call_type,
            from_notification: true,
          });
        }
      }

      // Tapped a call/notif notification in OS tray
      if (msg.type === 'NOTIFICATION_CLICKED') {
        const data = msg.data || {};
        if (data.type === 'call' && data.call_session_id) {
          // Re-trigger the incoming call UI
          setIncomingCall({
            id: data.call_session_id,
            caller_id: 'unknown',
            type: data.call_type || 'voice',
            callerName: data.caller_name || 'Caller',
            from_notification: true,
          });
        }
      }
    };
    
    navigator.serviceWorker?.controller?.postMessage({ type: 'READY' });
    window.addEventListener('message', handleSWMessage);
    
    return () => {
      clearAuthTimeout();
      window.removeEventListener('message', handleSWMessage);
      window.removeEventListener('auth-success', handleAuthSuccess);
      if (appStateListener) appStateListener.remove();
    };
  }, [isNative]);

  // checkAuth is now unused — initAuth handles both native and web.
  // Kept as a no-op to avoid breaking any external callers in the context value.
  const checkAuth = async () => {};

  // Realtime + polling runs on iOS too. PushKit wakes a background app, while
  // this fallback guarantees that two open phones still receive call state.
  useEffect(() => {
    if (!user?.id) return;

    const uid = user.id;
    let isMounted = true;

    const processSession = async (session, now = Date.now()) => {
      if (!session || !isMounted) return;
      if (session.caller_id !== uid && session.receiver_id !== uid) return;

      // New ringing call for us
      if (
        session.receiver_id === uid &&
        session.status === 'ringing' &&
        !seenCallIdsRef.current.has(session.id) &&
        (now - new Date(session.created_date).getTime()) < 60000
      ) {
        console.log('[CALL] Incoming call:', session.id);
        seenCallIdsRef.current.add(session.id);
        
        // Fetch caller info first
        let callerProfile = null;
        try {
          const callerProfiles = await base44.entities.UserProfile.filter({ user_id: session.caller_id }, '-created_date', 1);
          callerProfile = callerProfiles[0];
        } catch (e) {
          console.warn('[CALL] Failed to fetch caller profile:', e);
        }
        
        const callerName = callerProfile?.full_name || callerProfile?.username || 'Unknown';
        
        // Play ringtone only on web (native iOS uses CallKit/VoIP ringtone)
        if (!isNative) {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            const t = ctx.currentTime;
            for (let i = 0; i < 2; i++) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.setValueAtTime(880, t + i * 0.8);
              gain.gain.setValueAtTime(0.8, t + i * 0.8);
              gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.8 + 0.6);
              osc.start(t + i * 0.8);
              osc.stop(t + i * 0.8 + 0.6);
            }
          } catch (e) {}
        }
        
        // Strong vibration pattern for calls
        if (navigator.vibrate) {
          navigator.vibrate([400, 200, 400, 200, 600]);
        }
        
        // Request notification permission and show notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Incoming Call', {
              body: `${callerName} is calling...`,
              icon: callerProfile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(callerName),
              badge: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(callerName),
              tag: 'incoming-call-' + session.id,
              requireInteraction: true,
            });
          } catch (e) {
            console.warn('[CALL] Notification failed:', e);
          }
        } else if ('Notification' in window && Notification.permission === 'default' && isProductionDomain) {
          // Only request notification permission on production domain — never on Base44 preview
          Notification.requestPermission().catch(() => {});
        }
        
        // Track it for missed-call timeout
        ringingTimersRef.current[session.id] = ringingTimersRef.current[session.id] || setTimeout(async () => {
          // After 55s still ringing → mark missed
          const currentIncoming = incomingCallRef.current;
          if (currentIncoming?.id === session.id && isMounted) {
            setIncomingCall(null);
          }
          try {
            const latest = await base44.entities.CallSession.filter({ id: session.id }, '-created_date', 1);
            const s = latest[0];
            if (s && s.status === 'ringing' && isMounted) {
              await base44.entities.CallSession.update(session.id, { status: 'missed' });
              // Fetch caller info for missed call record
              const profiles = await base44.entities.UserProfile.filter({ user_id: session.caller_id }, '-created_date', 1);
              const profile = profiles[0];
              await base44.entities.MissedCall.create({
                receiver_id: uid,
                caller_id: session.caller_id,
                caller_name: profile?.full_name || profile?.username || 'Unknown',
                caller_avatar: profile?.avatar_url || null,
                call_type: session.type,
                call_session_id: session.id,
                seen: false,
              });
              if (isMounted) setMissedCallsUnseen(n => n + 1);
            }
          } catch(e) {}
          delete ringingTimersRef.current[session.id];
        }, 55000);

        if (isMounted) setIncomingCall({
          id: session.id,
          caller_id: session.caller_id,
          type: session.type,
          created_at: session.created_date,
          callerName: callerName,
          callerAvatar: callerProfile?.avatar_url || null,
        });
      }

      const terminalStatuses = ['ended', 'declined', 'missed', 'cancelled'];

      // Clear incoming modal and every local alert when ringing stops.
      const incoming = incomingCallRef.current;
      if (incoming && incoming.id === session.id && session.status !== 'ringing' && isMounted) {
        setIncomingCall(null);
        if (window.__callVibrationInterval) {
          clearInterval(window.__callVibrationInterval);
          window.__callVibrationInterval = null;
        }
        if (navigator.vibrate) navigator.vibrate(0);
        // Cancel missed-call timer if they accepted/declined before timeout
        if (ringingTimersRef.current[session.id]) {
          clearTimeout(ringingTimersRef.current[session.id]);
          delete ringingTimersRef.current[session.id];
        }
      }

      // Active call ended/declined remotely
      const active = activeCallRef.current;
      if (active && active.id === session.id && isMounted) {
        if (terminalStatuses.includes(session.status)) {
          console.log('[CALL] Active call ended remotely:', session.status);
          setActiveCall(null);
          if (window.__callVibrationInterval) {
            clearInterval(window.__callVibrationInterval);
            window.__callVibrationInterval = null;
          }
          if (navigator.vibrate) navigator.vibrate(0);
        }
        if (session.status === 'accepted' && !active.accepted) {
          setActiveCall(prev => prev ? { ...prev, accepted: true } : prev);
        }
      }
    };

    // Subscribe for real-time updates
    const unsubscribe = base44.entities.CallSession.subscribe((event) => {
      processSession(event.data);
    });

    // Polling fallback — only fires when tab becomes visible after being hidden
    // Real-time subscription handles live cases; this catches missed calls from background
    let pollTimer = null;
    const schedulePoll = () => {
      clearTimeout(pollTimer);
      pollTimer = setTimeout(async () => {
        if (incomingCallRef.current || activeCallRef.current) return;
        try {
          const now = Date.now();
          const sessions = await base44.entities.CallSession.filter(
            { receiver_id: uid, status: 'ringing' },
            '-created_date',
            2
          );
          for (const s of sessions) {
            if (!seenCallIdsRef.current.has(s.id)) processSession(s, now);
          }
        } catch(e) {}
      }, 500);
    };

    // Only poll when tab becomes visible (user returns to app)
    const handleVisibilityChange = () => {
      if (!document.hidden) schedulePoll();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Initial check on mount
    schedulePoll();

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(pollTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      Object.values(ringingTimersRef.current).forEach(t => clearTimeout(t));
      ringingTimersRef.current = {};
    };
  }, [user?.id]);

  // Protected setUser
  const protectedSetUser = (newUser) => {
    if (userRef.current?.id && !newUser?.id && !loggedOutIntentionallyRef.current) {
      console.log('⚠️ BLOCKED setUser(null) — user exists (id=' + userRef.current.id + ')');
      return false;
    }
    return true;
  };

  const logout = async () => {
    console.log('CLEAR_USER - logout() called');
    loggedOutIntentionallyRef.current = true;
    try {
      await Preferences.remove({ key: 'spicey_session' }).catch(() => {});
      await Preferences.remove({ key: 'token' }).catch(() => {});
      localStorage.removeItem('spicey_session');
      localStorage.removeItem('token');
      await TokenStorage.remove();
      userRef.current = null;
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
    } catch (err) {
      console.error('LOGOUT_ERROR:', err.message);
    }
  };

  const updateProfile = async (updates) => {
    const updatedUser = await base44.auth.updateMe(updates);
    const refreshed = await base44.auth.me();
    setUser(refreshed || updatedUser);
    return refreshed || updatedUser;
  };

  const navigateToLogin = () => {
    if (isNative) return; // Never redirect WebView on native
    base44.auth.redirectToLogin(window.location.href);
  };

  const acceptCall = async (callerInfo) => {
    const callToAccept = incomingCallRef.current;
    if (!callToAccept) return;
    seenCallIdsRef.current.add(callToAccept.id);
    setIncomingCall(null);
    try {
      const updatedSession = await base44.entities.CallSession.update(callToAccept.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });
      
      // Fetch full call session with all details
      const fullSession = await base44.entities.CallSession.filter({ id: callToAccept.id }, '-created_date', 1);
      const session = fullSession[0] || updatedSession;
      
      // Use caller info from incomingCall first (already fetched), fall back to passed callerInfo
      const finalCallerName = callToAccept.callerName || callerInfo?.full_name || callerInfo?.username || 'User';
      const finalCallerAvatar = callToAccept.callerAvatar || callerInfo?.avatar_url || null;
      
      setActiveCall({
        id: session.id,
        caller_id: session.caller_id,
        receiver_id: session.receiver_id || userRef.current?.id,
        type: session.type,
        status: session.status,
        isIncoming: true,
        accepted: true,
        callerName: finalCallerName,
        callerAvatar: finalCallerAvatar,
        receiverName: userRef.current?.full_name || 'You',
        receiverAvatar: null,
      });
    } catch (err) {
      console.error('Failed to accept call:', err);
      setIncomingCall(callToAccept); // Restore on error
    }
  };

  const declineCall = async () => {
    const callToDecline = incomingCallRef.current;
    if (!callToDecline) return;
    seenCallIdsRef.current.add(callToDecline.id);
    setIncomingCall(null);
    try {
      await base44.entities.CallSession.update(callToDecline.id, { status: 'declined' });
    } catch (err) {
      console.error('Failed to decline call:', err);
    }
  };

  const endCall = async () => {
    const call = activeCallRef.current;
    if (!call) return;
    setActiveCall(null);
    try {
      await base44.entities.CallSession.update(call.id, {
        status: 'ended',
        ended_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  };

  // Bridge actions from the native CallKit screen back into the shared
  // call_sessions state. Without this, tapping Decline/End in iOS only closes
  // CallKit locally and the caller keeps ringing indefinitely.
  useEffect(() => {
    if (!isNative || !user?.id) return undefined;

    let disposed = false;
    const listeners = [];

    const loadSession = async (callSessionId) => {
      if (!callSessionId) throw new Error('CallKit event is missing callSessionId');
      const rows = await base44.entities.CallSession.filter({ id: callSessionId }, '-created_date', 1);
      const session = rows?.[0];
      if (!session) throw new Error(`Call session ${callSessionId} was not found`);
      return session;
    };

    const onAnswer = async ({ callSessionId } = {}) => {
      try {
        const session = await loadSession(callSessionId);
        const updated = await base44.entities.CallSession.update(callSessionId, {
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        });
        if (disposed) return;
        seenCallIdsRef.current.add(callSessionId);
        setIncomingCall(null);
        setActiveCall({
          ...session,
          ...updated,
          id: callSessionId,
          isIncoming: true,
          accepted: true,
        });
      } catch (error) {
        console.error('[CallKit] Failed to accept native call:', error);
      }
    };

    const onEnd = async ({ callSessionId } = {}) => {
      try {
        const session = await loadSession(callSessionId);
        const status = session.status === 'ringing' ? 'declined' : 'ended';
        await base44.entities.CallSession.update(callSessionId, {
          status,
          ended_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[CallKit] Failed to end native call:', error);
      } finally {
        if (!disposed) {
          setIncomingCall(null);
          setActiveCall(null);
          if (navigator.vibrate) navigator.vibrate(0);
        }
      }
    };

    Promise.all([
      CallKitAPI.addListener('answerCall', onAnswer),
      CallKitAPI.addListener('endCall', onEnd),
    ]).then((registered) => {
      if (disposed) registered.forEach((listener) => listener.remove());
      else listeners.push(...registered);
    }).catch((error) => {
      console.error('[CallKit] Native event listeners unavailable:', error);
    });

    return () => {
      disposed = true;
      listeners.forEach((listener) => listener.remove());
    };
  }, [isNative, user?.id]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      authChecked,
      logout,
      updateProfile,
      navigateToLogin,
      setAuthError,
      checkAuth,
      setUser,
      incomingCall,
      setIncomingCall,
      acceptCall,
      declineCall,
      activeCall,
      setActiveCall,
      endCall,
      missedCallsUnseen,
      setMissedCallsUnseen,

    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
