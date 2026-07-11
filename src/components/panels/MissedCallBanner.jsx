import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, X, Phone, Video } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MissedCallBanner() {
  const [missedCalls, setMissedCalls] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const calls = await base44.entities.MissedCall.filter({ seen: false }, '-created_date', 5);
        if (calls.length > 0) {
          setMissedCalls(calls);
          setVisible(true);
        }
      } catch(e) {}
    };

    // Check on mount + after a short delay (lets auth settle)
    const t = setTimeout(check, 2000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = async () => {
    setVisible(false);
    // Mark all as seen
    for (const call of missedCalls) {
      base44.entities.MissedCall.update(call.id, { seen: true }).catch(() => {});
    }
  };

  const latest = missedCalls[0];
  if (!latest) return null;

  const count = missedCalls.length;
  const callerName = latest.caller_name || 'Unknown';
  const isVideo = latest.call_type === 'video';
  const timeAgo = (() => {
    const diff = (Date.now() - new Date(latest.created_date).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return 'Earlier';
  })();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[300] px-4 pt-12 pb-3 pointer-events-none"
        >
          <div
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20,5,35,0.97) 0%, rgba(40,5,55,0.97) 100%)',
              border: '1px solid rgba(255,60,60,0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(200,0,60,0.2)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(200,30,30,0.8), rgba(180,0,80,0.8))' }}>
              {isVideo
                ? <Video className="w-4 h-4 text-white" />
                : <PhoneOff className="w-4 h-4 text-white" />
              }
            </div>

            {/* Caller avatar */}
            <img
              src={latest.caller_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(callerName)}&background=2a0a3e&color=fff&size=80`}
              alt={callerName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2"
              style={{ borderColor: 'rgba(255,80,80,0.4)' }}
            />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-tight truncate">
                {count > 1 ? `${count} missed calls` : 'Missed call'}
              </p>
              <p className="text-white/55 text-xs truncate">
                {callerName} · {timeAgo}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}