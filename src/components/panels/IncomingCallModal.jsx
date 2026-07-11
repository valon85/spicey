import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function ringTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [480, 620].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + 0.8);
    });
    setTimeout(() => { try { ctx.close(); } catch(e) {} }, 1200);
  } catch (e) {}
}

export default function IncomingCallModal({ call, onAccept, onDecline, callerProfile }) {
  const ringRef = useRef(null);
  const [callerInfo, setCallerInfo] = React.useState(callerProfile || null);

  // Use provided callerProfile if available, otherwise fetch
  useEffect(() => {
    if (callerProfile) {
      setCallerInfo(callerProfile);
      return;
    }

    if (!call?.caller_id) return;

    base44.entities.UserProfile.filter({ user_id: call.caller_id }, '-created_date', 1)
      .then(profiles => {
        if (profiles.length > 0) {
          setCallerInfo(profiles[0]);
        }
      })
      .catch(err => console.error('Failed to fetch caller info:', err));
  }, [call?.caller_id, callerProfile]);

  // Note: Ringtone/vibration is now handled by GlobalIncomingCallHandler
  // This component just renders the modal UI

  const handleAccept = async () => {
    await onAccept(callerInfo);
  };

  const handleDecline = async () => {
    await onDecline();
  };

  return (
    <AnimatePresence>
      {call && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center w-screen h-screen overflow-hidden"
          onClick={handleDecline}
          style={{ background: 'linear-gradient(160deg, #0a0414 0%, #1a0535 50%, #0d0220 100%)' }}>
          
          {/* Fullscreen blur overlay */}
          <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex flex-col items-center gap-6 p-8"
            style={{
              background: 'transparent',
            }}>
            {/* Pulsing avatar */}
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(255,80,0,0.5)', '0 0 0 30px rgba(255,80,0,0)', '0 0 0 0 rgba(255,80,0,0.5)'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-24 h-24 rounded-full overflow-hidden border-4"
              style={{ borderColor: 'rgba(255,100,30,0.6)' }}>
              <img
                src={callerInfo?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(callerInfo?.full_name || 'User')}&background=1a0a2e&color=fff&size=100`}
                alt={callerInfo?.full_name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Caller info */}
            <div className="text-center">
              <h2 className="text-white text-2xl font-bold mb-1">{callerInfo?.full_name || 'Incoming Call'}</h2>
              <p className="text-white/45 text-sm">{call.type === 'video' ? 'Video call' : 'Voice call'}</p>
            </div>

            {/* Animated "Incoming call" text */}
            <div className="flex gap-1 items-center">
              {['I', 'n', 'c', 'o', 'm', 'i', 'n', 'g'].map((letter, i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.5, 1, 0.5], y: [0, -4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
                  className="text-orange-400 text-xs font-semibold"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-8 pt-4">
              {/* Accept */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleAccept}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00cc00, #00ff00)',
                  boxShadow: '0 0 30px rgba(0,200,0,0.6), 0 0 60px rgba(0,255,0,0.3)',
                }}>
                <Phone className="w-7 h-7 text-white fill-white" />
              </motion.button>

              {/* Decline */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleDecline}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #cc2020, #ff1a1a)',
                  boxShadow: '0 0 30px rgba(220,30,30,0.6), 0 0 60px rgba(200,10,10,0.3)',
                }}>
                <PhoneOff className="w-7 h-7 text-white fill-white" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}