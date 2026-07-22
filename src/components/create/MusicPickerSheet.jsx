import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music2, Play, Pause, Check, Search, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { fallbackMusicResults, normalizeMusicTrack } from './musicUtils';

const TRENDING_SEARCHES = ['trending 2024', 'pop hits', 'hip hop', 'viral songs', 'summer hits'];

export default function MusicPickerSheet({ open, onClose, onSelect, selectedTrack }) {
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);
  const searchTimeout = useRef(null);

  // Load trending on open
  useEffect(() => {
    if (open) {
      fetchTracks('top hits pop 2024');
    } else {
      stopAudio();
      setPlayingId(null);
    }
  }, [open]);

  const fetchTracks = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('searchMusic', { query });
      const results = res.data?.results || [];
      setTracks(results.length ? results : fallbackMusicResults(query));
    } catch {
      setTracks(fallbackMusicResults(query));
    }
    setLoading(false);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (val.trim()) fetchTracks(val);
    }, 500);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  const togglePlay = (track) => {
    if (playingId === track.trackId) {
      stopAudio();
      setPlayingId(null);
      return;
    }
    stopAudio();
    if (!track.previewUrl) return;
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = track.previewUrl;
    audioRef.current = audio;
    audio.play().catch((err) => {
      console.log('Audio play failed:', err);
      // Try without crossOrigin
      const audio2 = new Audio(track.previewUrl);
      audioRef.current = audio2;
      audio2.play().catch(() => {});
      audio2.onended = () => setPlayingId(null);
    });
    audio.onended = () => setPlayingId(null);
    setPlayingId(track.trackId);
  };

  const handleSelect = (track) => {
    stopAudio();
    setPlayingId(null);
    onSelect(normalizeMusicTrack({
      ...track,
      duration: track.trackTimeMillis ? `${Math.floor(track.trackTimeMillis / 60000)}:${String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}` : track.duration,
    }));
    onClose();
  };

  const handleClose = () => {
    stopAudio();
    setPlayingId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[90] rounded-t-3xl overflow-hidden flex flex-col"
            style={{ background: 'rgba(10,5,20,0.98)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '78vh' }}>

            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Music2 className="w-5 h-5 text-pink-400" />
                <p className="text-white font-bold text-base">Add Music</p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 mb-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Search artists, songs..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 16 }}
                />
                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />}
              </div>
            </div>

            {/* Trending chips */}
            {!search && (
              <div className="flex gap-2 px-5 mb-3 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
                {TRENDING_SEARCHES.map(tag => (
                  <button key={tag} onClick={() => { setSearch(tag); fetchTracks(tag); }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.25)', color: 'rgba(255,150,200,0.9)' }}>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* No music option */}
            <div className="px-5 mb-2 flex-shrink-0">
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { onSelect(null); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                style={{
                  background: !selectedTrack ? 'rgba(255,85,0,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${!selectedTrack ? 'rgba(255,85,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <X className="w-4 h-4 text-white/40" />
                </div>
                <span className="text-sm font-semibold text-white/60 flex-1 text-left">No music</span>
                {!selectedTrack && <Check className="w-4 h-4 text-orange-400" />}
              </motion.button>
            </div>

            {/* Track list */}
            <div className="overflow-y-auto px-5 pb-10 space-y-2 flex-1" style={{ scrollbarWidth: 'none' }}>
              {loading && tracks.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                </div>
              )}
              {!loading && tracks.length === 0 && (
                <p className="text-center text-white/30 text-sm py-10">No songs found</p>
              )}
              {tracks.map(track => {
                const isPlaying = playingId === track.trackId;
                const isSelected = selectedTrack?.id === track.trackId;
                return (
                  <motion.div key={track.trackId} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(233,30,140,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? 'rgba(233,30,140,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    }}>

                    {/* Artwork + Play */}
                    <div className="relative flex-shrink-0 w-11 h-11">
                      {track.artworkUrl60
                        ? <img src={track.artworkUrl60} alt="" className="w-11 h-11 rounded-xl object-cover" />
                        : <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: 'rgba(233,30,140,0.2)' }}>🎵</div>
                      }
                      {track.previewUrl && (
                        <button onClick={() => togglePlay(track)}
                          className="absolute inset-0 rounded-xl flex items-center justify-center"
                          style={{ background: isPlaying ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)' }}>
                          {isPlaying
                            ? <Pause className="w-4 h-4 text-white" />
                            : <Play className="w-4 h-4 text-white" style={{ marginLeft: 2 }} />}
                        </button>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0" onClick={() => handleSelect(track)}>
                      <p className="text-sm font-bold text-white truncate">{track.trackName}</p>
                      <p className="text-xs text-white/40 truncate">{track.artistName} · {track.collectionName}</p>
                    </div>

                    {/* Select */}
                    <button onClick={() => handleSelect(track)}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected ? '#e91e8c' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSelected ? '#e91e8c' : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
