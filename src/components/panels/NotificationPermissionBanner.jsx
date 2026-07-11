import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { canRequestPermissions } from '@/lib/domainGuard';

const DISMISSED_KEY = 'spicey_notif_dismissed_v2';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Play notification sound with proper iOS support
function playNotificationSound(type = 'message') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    
    // Resume context if suspended (iOS requirement)
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => playTone()).catch(() => {});
    } else {
      playTone();
    }
    
    function playTone() {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'call') {
        // Louder, more urgent two-tone for calls
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(800, now + 0.1);
        osc.frequency.setValueAtTime(920, now + 0.2);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else {
        // Gentle message notification
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.15);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    }
  } catch (e) {
    console.warn('[NOTIF] Sound failed:', e);
  }
}

// Play vibration pattern
function vibrateDevice(type = 'message') {
  if (!navigator.vibrate) return;
  
  if (type === 'call') {
    // Urgent vibration for calls
    navigator.vibrate([400, 200, 400, 200, 600]);
  } else {
    // Gentle vibration for messages
    navigator.vibrate([200, 100, 200]);
  }
}

export default function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [isIOSNoPWA, setIsIOSNoPWA] = useState(false);

  useEffect(() => {
    // Only show on spicey.live or native app — never on Base44 preview domains
    if (!canRequestPermissions()) return;
    // Don't show if already granted or previously dismissed
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const ios = isIOS();
    const pwa = isPWA();

    // On iOS, only show if in PWA mode (notifications don't work in Safari browser)
    if (ios && !pwa) {
      // Show iOS install hint instead
      setIsIOSNoPWA(true);
      const timer = setTimeout(() => {
        setShow(true);
        // Vibrate + sound to grab attention
        vibrateDevice('message');
        playNotificationSound('message');
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (Notification.permission === 'denied') return;

    // Show after a short delay so page loads first
    const timer = setTimeout(() => {
      setShow(true);
      // Vibrate + sound to grab attention
      vibrateDevice('message');
      playNotificationSound('message');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setRequesting(true);
    try {
      // Register service worker first (needed for iOS PWA push)
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;
      }
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setShow(false);
      } else {
        // Denied — dismiss and remember
        localStorage.setItem(DISMISSED_KEY, '1');
        setShow(false);
      }
    } catch (e) {
      console.warn('[NOTIF] Permission request failed:', e);
    } finally {
      setRequesting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-[9999]"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <div
            className="mx-3 rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,80,0,0.95), rgba(220,30,120,0.95))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(255,80,0,0.4), 0 0 0 1px rgba(255,255,255,0.12)',
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Bell className="w-5 h-5 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              {isIOSNoPWA ? (
                <>
                  <p className="text-white font-bold text-[13px] leading-tight">Add to Home Screen</p>
                  <p className="text-white/80 text-[11px] leading-tight mt-0.5">
                    Tap Share → "Add to Home Screen" to get notifications
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white font-bold text-[13px] leading-tight">Enable Notifications</p>
                  <p className="text-white/80 text-[11px] leading-tight mt-0.5">
                    Get alerts for messages, calls & likes
                  </p>
                </>
              )}
            </div>

            {/* Enable button — only show for non-iOS-browser */}
            {!isIOSNoPWA && (
              <button
                onClick={handleEnable}
                disabled={requesting}
                className="flex-shrink-0 px-3 py-1.5 rounded-full font-bold text-[12px] text-orange-600 active:scale-95 transition-transform"
                style={{ background: 'white' }}
              >
                {requesting ? '...' : 'Allow'}
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}