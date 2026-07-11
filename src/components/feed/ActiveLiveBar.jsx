import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];

export default function ActiveLiveBar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLight, setIsLight] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: liveSessions = [] } = useQuery({
    queryKey: ['active-live-sessions'],
    queryFn: async () => {
      const sessions = await base44.entities.LiveSession.filter({ status: 'active' }, '-started_at', 10);
      // Auto-mark sessions older than 4 hours as ended (orphaned sessions)
      const staleThreshold = Date.now() - 4 * 60 * 60 * 1000;
      const stale = asArray(sessions).filter(s => s.started_at && new Date(s.started_at).getTime() < staleThreshold);
      for (const s of stale) {
        base44.entities.LiveSession.update(s.id, { status: 'ended', ended_at: new Date().toISOString() }).catch(() => {});
      }
      return asArray(sessions).filter(s => !s.started_at || new Date(s.started_at).getTime() >= staleThreshold);
    },
    staleTime: 15000,
    refetchInterval: 20000,
  });

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this live session?')) return;
    await base44.entities.LiveSession.update(sessionId, { status: 'ended', ended_at: new Date().toISOString() });
    queryClient.invalidateQueries({ queryKey: ['active-live-sessions'] });
  };

  if (!asArray(liveSessions).length) return null;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 mb-2 px-0.5">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-red-500"
        />
        <span className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: isLight ? '#e11d48' : 'rgba(255,80,80,0.9)' }}>
          LIVE NOW
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {asArray(liveSessions).map((session, i) => {
          const avatarSrc = session.broadcaster_avatar
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.broadcaster_name || 'L')}&background=ff5500&color=fff&size=80`;
          const isOwner = currentUser?.id === session.broadcaster_id || currentUser?.role === 'admin';
          return (
            <div key={session.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/live/watch?session=${session.id}`)}
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.2, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ border: '2px solid #e11d48', margin: -4 }}
                  />
                  <div className="w-14 h-14 rounded-full overflow-hidden"
                    style={{ border: '2.5px solid #e11d48', boxShadow: '0 0 16px rgba(220,30,30,0.7)' }}>
                    <img src={avatarSrc} alt={session.broadcaster_username}
                      className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[7px] font-black text-white"
                    style={{ background: '#e11d48', whiteSpace: 'nowrap' }}>
                    LIVE
                  </div>
                </div>
                <span className="text-[9px] font-semibold truncate w-16 text-center"
                  style={{ color: isLight ? '#111' : 'rgba(255,255,255,0.85)' }}>
                  @{session.broadcaster_username}
                </span>
                <span className="text-[8px]" style={{ color: isLight ? '#888' : 'rgba(255,255,255,0.4)' }}>
                  👁 {session.viewer_count || 0}
                </span>
              </motion.button>
              {/* Delete button for owner/admin */}
              {isOwner && (
                <button
                  onClick={e => handleDelete(e, session.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(220,30,30,0.9)', border: '1.5px solid rgba(0,0,0,0.5)' }}>
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 h-px rounded-full" style={{ background: isLight ? '#ECECF2' : 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}