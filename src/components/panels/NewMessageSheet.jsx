import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewMessageSheet({ open, onClose, onStartChat }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) { setSearch(''); setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    base44.functions.invoke('searchUsers', { query: '', limit: 12 })
      .then((res) => {
        if (cancelled) return;
        const data = res.data || res;
        const users = Array.isArray(data) ? data : (data.users || data.profiles || []);
        setResults(users);
      })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!search.trim()) {
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await base44.functions.invoke('searchUsers', { query: '', limit: 12 });
          const data = res.data || res;
          setResults(Array.isArray(data) ? data : (data.users || data.profiles || []));
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke('searchUsers', { query: search, limit: 20 });
        const data = res.data || res;
        setResults(Array.isArray(data) ? data : (data.users || data.profiles || []));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (user) => {
    const avatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || 'User')}&background=1a0a2e&color=fff&size=100`;
    onStartChat({
      id: user.user_id || user.id,
      name: user.full_name || user.username || user.email?.split('@')[0] || 'User',
      username: user.username || user.email?.split('@')[0] || 'user',
      img: avatar,
      online: false,
      isDirectMessage: true,
      userId: user.user_id || user.id
    });
    setSearch('');
    setResults([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[80vh] overflow-y-auto"
            style={{ background: 'rgba(15,8,20,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 pt-5 pb-4"
              style={{ background: 'rgba(15,8,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white font-extrabold text-lg">New Message</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Search */}
            <div className="sticky top-16 px-6 py-3" style={{ background: 'rgba(15,8,20,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="relative flex items-center rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search className="absolute left-3.5 w-4 h-4 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or username..."
                  autoFocus
                  className="w-full h-10 pl-10 pr-4 bg-transparent text-sm text-white placeholder:text-white/30 outline-none" />
                {loading && <Loader2 className="absolute right-3.5 w-4 h-4 text-white/30 animate-spin" />}
              </div>
            </div>

            {/* Results */}
            <div className="px-3 py-4 space-y-1">
              {!search.trim() && (
                <p className="px-3 pb-2 text-white/35 text-xs font-semibold uppercase tracking-wide">Friends</p>
              )}
              {search.trim() && !loading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-white/30 text-sm">No users found</p>
                </div>
              )}
              {results.map(user => {
                const avatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || 'User')}&background=1a0a2e&color=fff&size=100`;
                const displayName = user.full_name || user.username || user.email?.split('@')[0] || 'User';
                const uname = user.username || user.email?.split('@')[0] || 'user';
                return (
                  <motion.button key={user.id} onClick={() => handleSelect(user)}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left active:scale-95 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="relative flex-shrink-0">
                      <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{displayName}</p>
                      <p className="text-white/35 text-xs">@{uname}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
