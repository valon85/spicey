import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Send, X, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveWatcher() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!sessionId) { setError('No live session specified.'); return; }
    base44.entities.LiveSession.get(sessionId)
      .then(s => setSession(s))
      .catch(() => setError('Live session not found.'));
  }, [sessionId]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), name: 'You', text: input }]);
    setInput('');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this live session?')) return;
    setDeleting(true);
    try {
      await base44.entities.LiveSession.delete(sessionId);
      navigate('/');
    } catch { setDeleting(false); }
  };

  const spawnHeart = (e) => {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `position:fixed;left:${e.clientX-10}px;top:${e.clientY-10}px;font-size:24px;pointer-events:none;z-index:999`;
    document.body.appendChild(heart);
    heart.animate([{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(-150px) scale(1.2)', opacity: 0 }], { duration: 1500, easing: 'ease-out' });
    setTimeout(() => heart.remove(), 1500);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-4">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 rounded-full bg-white/20">Go Home</button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isEnded = session.status === 'ended';
  const isOwner = currentUser?.id === session.broadcaster_id;
  const hasReplay = !!session.replay_url;

  // If session ended and no replay — show "ended" screen
  if (isEnded && !hasReplay) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-6 gap-4" data-prevent-light-mode="true">
        <div className="text-6xl mb-2">📺</div>
        <h2 className="text-xl font-bold">Stream Ended</h2>
        <p className="text-white/50 text-sm text-center">This live stream has ended and no replay was saved.</p>
        {isOwner && (
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold mt-2 disabled:opacity-50"
            style={{ background: 'rgba(220,30,30,0.7)', border: '1px solid rgba(220,30,30,0.8)' }}>
            <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete Session'}
          </button>
        )}
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full bg-white/10 font-semibold">Go Home</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col text-white" onClick={!isEnded ? spawnHeart : undefined} data-prevent-light-mode="true">
      
      {/* Video — replay if ended, otherwise blank (live WebRTC not supported in web) */}
      {hasReplay ? (
        <video ref={videoRef} src={session.replay_url} autoPlay controls playsInline
          className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">🔴</div>
            <p className="text-white/60 text-sm">Live stream in progress</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-3">
          <img src={session.broadcaster_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.broadcaster_name||'L')}&background=ff5500&color=fff`}
            alt="" className="w-10 h-10 rounded-full border-2 border-pink-500" />
          <div>
            <p className="font-bold">{session.broadcaster_name}</p>
            <p className="text-xs text-white/70">@{session.broadcaster_username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEnded && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10">
              <Eye className="w-3.5 h-3.5 text-white/80" />
              <span className="text-xs font-semibold">{session.viewer_count}</span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isEnded ? 'bg-gray-600' : 'bg-red-500/80'}`}>
            {!isEnded && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            <span className="text-xs font-bold">{isEnded ? 'ENDED' : 'LIVE'}</span>
          </div>
          {isOwner && (
            <button onClick={handleDelete} disabled={deleting}
              className="w-9 h-9 rounded-full bg-red-600/70 flex items-center justify-center disabled:opacity-50">
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Chat (only during live) */}
      {!isEnded && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="overflow-y-auto px-4 space-y-2 h-40" style={{ maskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}>
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-sm">
                  <span className="font-bold text-white/70">{msg.name}:</span>
                  <span>{msg.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 px-4 mt-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Send a message..."
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 placeholder:text-white/40 outline-none text-sm" />
            <button onClick={handleSend}
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}