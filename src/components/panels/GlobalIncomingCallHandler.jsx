import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import IncomingCallModal from './IncomingCallModal';

/**
 * Global handler for incoming calls with HTML5 Audio ringtone
 * Works better in iOS background than Web Audio API
 */
export default function GlobalIncomingCallHandler() {
  const { incomingCall, acceptCall, declineCall, user } = useAuth();
  const audioRef = useRef(null);
  const ringRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const callerDataRef = useRef(null);

  // Load caller profile when incomingCall changes
  useEffect(() => {
    if (!incomingCall || !user) {
      // Call ended — clean up everything
      console.log('[CALL] Call ended, cleaning up');
      if (ringRef.current) {
        clearInterval(ringRef.current);
        ringRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      // Also clear global vibration interval if set
      if (window.__callVibrationInterval) {
        clearInterval(window.__callVibrationInterval);
        window.__callVibrationInterval = null;
      }
      if (navigator.vibrate) {
        navigator.vibrate(0); // Stop any ongoing vibration
      }
      callerDataRef.current = null;
      return;
    }

    // Fetch caller profile
    const loadCallerProfile = async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        const profiles = await base44.entities.UserProfile.filter(
          { user_id: incomingCall.caller_id },
          '-created_date',
          1
        );
        const profile = profiles[0];
        callerDataRef.current = {
          full_name: profile?.full_name || 'Unknown',
          username: profile?.username || 'user',
          avatar_url: profile?.avatar_url || null,
        };
      } catch (e) {
        callerDataRef.current = {
          full_name: 'Unknown Caller',
          username: 'user',
          avatar_url: null,
        };
      }
    };

    loadCallerProfile();

    // Start ringtone
    const startRinging = async () => {
      console.log('[CALL] Starting ringtone and vibration...');
      
      // Simple ringtone using AudioContext (no external script needed)
      const ringInterval = setInterval(() => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
          setTimeout(() => { try { ctx.close(); } catch(e) {} }, 500);
        } catch(e) {
          console.warn('[CALL] Ringtone error:', e);
        }
      }, 2000);
      
      ringRef.current = ringInterval;
      console.log('[CALL] Ringtone started (interval:', ringInterval, ')');
      
      // VIBRATION: Aggressive pattern for calls
      const vibratePattern = [500, 200, 500, 200, 800];
      
      // Start vibration immediately
      if (navigator.vibrate) {
        console.log('[CALL] Starting vibration pattern');
        navigator.vibrate(vibratePattern);
        vibrationIntervalRef.current = setInterval(() => {
          navigator.vibrate(vibratePattern);
        }, 2500); // Repeat every 2.5 seconds
      } else {
        console.warn('[CALL] Vibration not supported');
      }
    };

    // Start ringing
    startRinging();

    return () => {
      console.log('[CALL] Cleaning up ringtone and vibration');
      if (ringRef.current) {
        clearInterval(ringRef.current);
        ringRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      // Also clear global vibration interval if set
      if (window.__callVibrationInterval) {
        clearInterval(window.__callVibrationInterval);
        window.__callVibrationInterval = null;
      }
      if (navigator.vibrate) {
        navigator.vibrate(0); // Stop any ongoing vibration
      }
    };
  }, [incomingCall, user]);

  if (!incomingCall || !user) return null;

  const callerInfo = {
    full_name: incomingCall.callerName || callerDataRef.current?.full_name || 'Unknown',
    username: callerDataRef.current?.username || 'user',
    avatar_url: incomingCall.callerAvatar || callerDataRef.current?.avatar_url || null,
  };

  const handleAccept = async () => {
    console.log('[CALL] Accepting call, stopping ringtone');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if (window.__callVibrationInterval) {
      clearInterval(window.__callVibrationInterval);
      window.__callVibrationInterval = null;
    }
    if (window.stopRingtone) {
      window.stopRingtone();
      console.log('[CALL] Ringtone stopped');
    }
    if (navigator.vibrate) {
      navigator.vibrate(0);
      console.log('[CALL] Vibration stopped');
    }
    await acceptCall(callerInfo);
  };

  const handleDecline = async () => {
    console.log('[CALL] Declining call, stopping ringtone');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if (window.__callVibrationInterval) {
      clearInterval(window.__callVibrationInterval);
      window.__callVibrationInterval = null;
    }
    if (window.stopRingtone) {
      window.stopRingtone();
      console.log('[CALL] Ringtone stopped');
    }
    if (navigator.vibrate) {
      navigator.vibrate(0);
      console.log('[CALL] Vibration stopped');
    }
    await declineCall();
  };

  return (
    <IncomingCallModal
      call={incomingCall}
      onAccept={handleAccept}
      onDecline={handleDecline}
      callerProfile={callerInfo}
    />
  );
}
