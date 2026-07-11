import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, MapPin, Navigation, Music2, Search, Check, Play, Pause } from 'lucide-react';

// ── Compact Half-Sheet (Instagram/TikTok style) ──────────────────────────────
function HalfSheet({ open, onClose, title, accentColor = '#ff5500', children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      {/* Dim backdrop - only bottom half darker */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 rounded-t-[28px]"
        style={{
          background: 'rgba(12,6,22,0.98)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 16px))',
        }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2 flex-shrink-0">
          <span className="text-white font-bold text-[15px]">{title}</span>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        {/* Thin accent line */}
        <div className="mx-5 mb-3 h-px flex-shrink-0" style={{ background: `linear-gradient(to right, ${accentColor}60, transparent)` }} />
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ── Music Sheet ──────────────────────────────────────────────────────────────
export function MusicSheet({ open, onClose, meta, setMeta, query, setQuery, results, loading, onSearch }) {
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const [playingUrl, setPlayingUrl] = useState(null);

  // Auto-search trending on open
  useEffect(() => {
    if (open && results.length === 0 && !query) {
      onSearch('top hits 2025');
    }
    // Stop audio when sheet closes
    if (!open) {
      audioRef.current?.pause();
      setPlayingUrl(null);
    }
  }, [open]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(val || 'top hits 2025'), 400);
  };

  const togglePreview = (e, previewUrl) => {
    e.stopPropagation();
    if (!previewUrl) return;
    if (playingUrl === previewUrl) {
      audioRef.current?.pause();
      setPlayingUrl(null);
    } else {
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.pause();
      audioRef.current.src = previewUrl;
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setPlayingUrl(null);
      setPlayingUrl(previewUrl);
    }
  };

  const selectTrack = (track) => {
    audioRef.current?.pause();
    setPlayingUrl(null);
    setMeta(m => ({ ...m, music: `${track.trackName} - ${track.artistName}` }));
    onClose();
  };

  const isSelected = (track) => meta.music === `${track.trackName} - ${track.artistName}`;

  return (
    <HalfSheet open={open} onClose={onClose} title="🎵 Add Music" accentColor="#e91e8c">
      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search song or artist..."
          className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-white outline-none text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 16 }}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {results.map((track, i) => {
            const selected = isSelected(track);
            const isPlaying = playingUrl === track.previewUrl;
            return (
              <div key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all"
                style={{
                  background: selected ? 'rgba(233,30,140,0.15)' : 'rgba(255,255,255,0.04)',
                  border: selected ? '1px solid rgba(233,30,140,0.5)' : '1px solid transparent',
                }}>
                {/* Artwork / play button */}
                <button onClick={e => track.previewUrl ? togglePreview(e, track.previewUrl) : selectTrack(track)}
                  className="relative w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ background: track.artworkUrl60 ? 'none' : 'rgba(233,30,140,0.2)' }}>
                  {track.artworkUrl60 && (
                    <img src={track.artworkUrl60} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  {track.previewUrl && (
                    <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: isPlaying ? 'rgba(233,30,140,0.9)' : 'rgba(0,0,0,0.55)' }}>
                      {isPlaying
                        ? <Pause className="w-3 h-3 text-white" />
                        : <Play className="w-3 h-3 text-white ml-0.5" />
                      }
                    </div>
                  )}
                  {!track.previewUrl && !track.artworkUrl60 && <Music2 className="w-5 h-5 text-pink-400" />}
                </button>

                {/* Track info — tap to select */}
                <button onClick={() => selectTrack(track)} className="flex-1 min-w-0 text-left">
                  <p className="text-white font-semibold text-sm truncate">{track.trackName}</p>
                  <p className="text-white/45 text-xs truncate">{track.artistName}</p>
                </button>

                {selected && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: '#e91e8c' }}>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-white/30 text-sm text-center py-6">No results found</p>
      )}
    </HalfSheet>
  );
}

// ── Location Sheet ───────────────────────────────────────────────────────────
export function LocationSheet({ open, onClose, meta, setMeta, query, setQuery, onDetect, locationLoading }) {
  const handleManual = (val) => {
    setQuery(val);
    setMeta(m => ({ ...m, location: val }));
  };

  const handleDetectAndClose = () => {
    onDetect();
  };

  // Auto-close after location detected
  useEffect(() => {
    if (open && meta.location && !locationLoading && query === meta.location) {
      const t = setTimeout(() => onClose(), 800);
      return () => clearTimeout(t);
    }
  }, [meta.location, locationLoading]);

  return (
    <HalfSheet open={open} onClose={onClose} title="📍 Add Location" accentColor="#06b6d4">
      {/* GPS button */}
      <button onClick={handleDetectAndClose} disabled={locationLoading}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4 disabled:opacity-60 transition-all active:scale-[0.98]"
        style={{ background: 'rgba(6,182,212,0.12)', border: '1.5px solid rgba(6,182,212,0.3)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(6,182,212,0.2)' }}>
          {locationLoading
            ? <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            : <Navigation className="w-4 h-4 text-cyan-400" />}
        </div>
        <div className="text-left">
          <p className="text-cyan-300 font-bold text-sm">
            {locationLoading ? 'Detecting...' : 'Use current location'}
          </p>
          <p className="text-white/30 text-xs">GPS auto-detect</p>
        </div>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-white/25 text-xs font-medium">or enter manually</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Manual input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={query}
          onChange={e => handleManual(e.target.value)}
          placeholder="City, country or place..."
          className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-white outline-none text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 16 }}
        />
      </div>

      {meta.location && (
        <div className="flex items-center justify-between mt-4 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-white text-sm font-medium truncate">{meta.location}</span>
          </div>
          <button onClick={onClose}
            className="ml-2 px-3 py-1 rounded-full text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'rgba(6,182,212,0.3)' }}>
            Done ✓
          </button>
        </div>
      )}
    </HalfSheet>
  );
}

// ── Tags Sheet ───────────────────────────────────────────────────────────────
export function TagsSheet({ open, onClose, meta, setMeta, query, setQuery, results, loading, onSearch, selectedTags, setSelectedTags }) {
  const debounceRef = useRef(null);

  const handleChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(val), 400);
  };

  const toggleTag = (user) => {
    const already = selectedTags.find(t => t.username === user.username);
    const next = already
      ? selectedTags.filter(t => t.username !== user.username)
      : [...selectedTags, user];
    setSelectedTags(next);
    setMeta(m => ({ ...m, tags: next.map(u => `@${u.username}`).join(' ') }));
  };

  return (
    <HalfSheet open={open} onClose={onClose} title="🏷️ Tag People" accentColor="#a855f7">
      {/* Selected chips row */}
      {selectedTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {selectedTags.map(u => (
            <div key={u.username} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{ background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.35)' }}>
              <img
                src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.username)}&background=7c3aed&color=fff&size=32`}
                className="w-4 h-4 rounded-full flex-shrink-0" alt="" />
              <span className="text-purple-300 text-[11px] font-semibold">@{u.username}</span>
              <button onClick={() => toggleTag(u)}>
                <X className="w-3 h-3 text-purple-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search by username or name..."
          className="w-full rounded-2xl pl-9 pr-4 py-2.5 text-white outline-none text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 16 }}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {results.map((user, i) => {
            const selected = !!selectedTags.find(t => t.username === user.username);
            return (
              <button key={i} onClick={() => toggleTag(user)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left w-full transition-all"
                style={{
                  background: selected ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                  border: selected ? '1px solid rgba(168,85,247,0.5)' : '1px solid transparent',
                }}>
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=7c3aed&color=fff&size=48`}
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{user.full_name || user.username}</p>
                  <p className="text-white/40 text-xs">@{user.username}</p>
                </div>
                {selected
                  ? <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#a855f7' }}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  : <div className="w-6 h-6 rounded-full flex-shrink-0 border" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                }
              </button>
            );
          })}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-white/30 text-sm text-center py-6">No users found</p>
      )}

      {selectedTags.length > 0 && (
        <button onClick={onClose} className="w-full mt-4 py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #a855f7, #e91e8c)' }}>
          Done ({selectedTags.length}) ✓
        </button>
      )}
    </HalfSheet>
  );
}