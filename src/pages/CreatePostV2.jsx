import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Music2, MapPin, Users, Type, ChevronLeft, ChevronRight,
  Loader2, ImagePlus, Check, Plus, Camera, Sparkles
} from 'lucide-react';
import NormalCamera from '@/components/camera/NormalCamera';

// ── tiny music search sheet ──────────────────────────────────────────
function MusicSheet({ open, onClose, onSelect, selected }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  const search = async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke('searchMusic', { query: q });
      setResults(res.data?.results || []);
    } catch { setResults([]); }
    setLoading(false);
  };

  const preview = (track) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (playing === track.previewUrl) { setPlaying(null); return; }
    const a = new Audio(track.previewUrl);
    a.play().catch(() => {});
    audioRef.current = a;
    a.onended = () => setPlaying(null);
    setPlaying(track.previewUrl);
  };

  useEffect(() => { if (!open && audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlaying(null); } }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl px-5 pt-4 pb-10"
        style={{ background: 'rgba(10,5,20,0.99)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-bold">🎵 Add Music</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <input value={query} onChange={e => { setQuery(e.target.value); search(e.target.value); }}
          placeholder="Search songs, artists…"
          className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none mb-4"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 16 }} />
        {selected && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-3"
            style={{ background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.35)' }}>
            <img src={selected.artwork} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{selected.title}</p>
              <p className="text-white/50 text-[10px] truncate">{selected.artist}</p>
            </div>
            <button onClick={() => { onSelect(null); onClose(); }} className="text-xs text-pink-400 font-semibold">Remove</button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 space-y-2">
          {loading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-pink-400 animate-spin" /></div>}
          {results.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl active:bg-white/5 transition cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={() => { onSelect(t); onClose(); }}>
              <img src={t.artwork} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{t.title}</p>
                <p className="text-white/50 text-xs truncate">{t.artist}</p>
              </div>
              {t.previewUrl && (
                <button onClick={e => { e.stopPropagation(); preview(t); }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: playing === t.previewUrl ? 'rgba(233,30,140,0.3)' : 'rgba(255,255,255,0.08)', color: playing === t.previewUrl ? '#e91e8c' : 'rgba(255,255,255,0.5)' }}>
                  {playing === t.previewUrl ? '■' : '▶'}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── inline input overlay ─────────────────────────────────────────────
function InputOverlay({ type, value, onChange, onDone }) {
  const colors = { caption: '#ff5500', location: '#06b6d4', tags: '#a855f7' };
  const placeholders = { caption: 'Write a caption…', location: 'Add location…', tags: '@username @friend…' };
  const icons = { caption: <Type className="w-4 h-4" />, location: <MapPin className="w-4 h-4" />, tags: <Users className="w-4 h-4" /> };
  const color = colors[type];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.15 }}
      className="mx-4 mb-3 rounded-2xl flex items-start gap-3 px-4 py-3.5"
      style={{ background: 'rgba(6,3,14,0.97)', border: `1px solid ${color}40`, backdropFilter: 'blur(20px)' }}>
      <span style={{ color, marginTop: 2 }}>{icons[type]}</span>
      {type === 'caption' ? (
        <textarea autoFocus value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholders[type]} rows={3}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none outline-none leading-snug" />
      ) : (
        <input autoFocus value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholders[type]}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none" />
      )}
      <button onClick={onDone} className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color }}>Done</button>
    </motion.div>
  );
}

// ── chip tag ─────────────────────────────────────────────────────────
function Chip({ color, icon, label, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: `${color}18`, border: `1px solid ${color}45` }}>
      <span style={{ color }}>{icon}</span>
      <span className="text-white text-[11px] font-semibold" style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {onRemove && <button onClick={onRemove}><X className="w-3 h-3 text-white/35" /></button>}
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────
export default function CreatePostV2() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const touchStartX = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [music, setMusic] = useState(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [error, setError] = useState('');
  const [posted, setPosted] = useState(false);
  const [banubaOpen, setBanubaOpen] = useState(false);

  // Auto-open gallery or load from session
  useEffect(() => {
    const stored = sessionStorage.getItem('hubCapturedPhoto');
    if (stored) {
      sessionStorage.removeItem('hubCapturedPhoto');
      const extras = JSON.parse(sessionStorage.getItem('hubExtraPhotos') || '[]');
      sessionStorage.removeItem('hubExtraPhotos');
      setPhotos([stored, ...extras].map(p => ({ preview: p, file: null })));
    } else {
      // Open Banuba camera instead of gallery by default
      setBanubaOpen(true);
    }
  }, []);

  // Handle Banuba capture
  const handleBanubaCapture = ({ url, blob }) => {
    const file = new File([blob], 'banuba-photo.jpg', { type: 'image/jpeg' });
    setPhotos([{ file, preview: url }]);
    setBanubaOpen(false);
  };

  const addFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) { if (!photos.length) navigate(-1); return; }
    const allowed = files.slice(0, 10 - photos.length);
    const newPhotos = allowed.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos(prev => {
      const startIdx = prev.length === 0 ? 0 : prev.length;
      setActiveIdx(startIdx);
      return [...prev, ...newPhotos];
    });
    e.target.value = '';
  };

  const removePhoto = (i) => {
    setPhotos(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      if (!next.length) { navigate(-1); return prev; }
      setActiveIdx(c => Math.min(c, next.length - 1));
      return next;
    });
  };

  const swipeStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const swipeEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -40) setActiveIdx(i => Math.min(i + 1, photos.length - 1));
    else if (dx > 40) setActiveIdx(i => Math.max(i - 1, 0));
  };

  const createPost = useMutation({
    mutationFn: async () => {
      setError('');
      if (!photos.length) throw new Error('Add at least one photo');
      const user = await base44.auth.me();
      if (!user) throw new Error('Not logged in');

      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const p = profiles[0] || {};
      const authorName = p.full_name || user.full_name || 'User';
      const authorUsername = p.username || user.email?.split('@')[0] || 'user';
      const authorAvatar = p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

      const urls = await Promise.all(photos.map(async ph => {
        let file = ph.file;
        if (!file) {
          const blob = await fetch(ph.preview).then(r => r.blob());
          file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        }
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      }));

      await base44.entities.Post.create({
        author_id: user.id,
        author_name: authorName,
        author_username: authorUsername,
        author_avatar: authorAvatar,
        caption: caption.trim(),
        image_url: urls[0],
        image_urls: urls.length > 1 ? urls : [],
        video_url: '', video_link: '',
        location: location.trim(),
        tags: tags.trim(),
        hashtags: [],
        music_title: music?.title || '',
        music_artist: music?.artist || '',
        music_preview_url: music?.previewUrl || '',
        music_artwork_url: music?.artwork || '',
        likes_count: 0, fire_count: 0, wow_count: 0,
        comments_count: 0, shares_count: 0,
        post_type: 'feed',
      });
    },
    onSuccess: () => {
      setPosted(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTimeout(() => navigate('/'), 900);
    },
    onError: (err) => setError(err?.message || 'Something went wrong'),
  });

  const hasPhotos = photos.length > 0;

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />

      {/* Normal Camera */}
      <AnimatePresence>
        {banubaOpen && (
          <NormalCamera
            onClose={() => setBanubaOpen(false)}
            onCapture={handleBanubaCapture}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {musicOpen && (
          <MusicSheet open={musicOpen} onClose={() => setMusicOpen(false)} onSelect={setMusic} selected={music} />
        )}
      </AnimatePresence>

      {/* Success overlay */}
      <AnimatePresence>
        {posted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.9)' }}>
            <div className="flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 60px rgba(255,80,0,0.5)' }}>
                <Check className="w-12 h-12 text-white" />
              </motion.div>
              <p className="text-white font-bold text-2xl">Posted!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 bg-black" data-prevent-light-mode="true">

        {/* ── No photos state ── */}
        {!hasPhotos && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            style={{ background: 'linear-gradient(160deg,#080410,#030208)' }}>
            <button onClick={() => navigate(-1)}
              className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ top: 'max(14px, env(safe-area-inset-top))', background: 'rgba(255,255,255,0.07)' }}>
              <X className="w-5 h-5 text-white" />
            </button>
            
            {/* Banuba status badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300 text-xs font-semibold">Banuba Face AR Active</span>
            </div>
            
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(255,85,0,0.08)', border: '1.5px dashed rgba(255,85,0,0.35)' }}>
              <Camera className="w-12 h-12 text-orange-500/70" />
            </div>
            <p className="text-white/40 text-sm mb-2">Take a photo with real-time beauty effects</p>
            <button onClick={() => setBanubaOpen(true)}
              className="px-10 py-4 rounded-full font-bold text-white mb-3"
              style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 30px rgba(255,80,0,0.4)' }}>
              Open Camera
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="px-10 py-4 rounded-full font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              Choose from Gallery
            </button>
          </div>
        )}

        {/* ── Main editor ── */}
        {hasPhotos && (
          <>
            {/* Full-screen photo */}
            <div className="absolute inset-0" onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={photos[activeIdx]?.preview}
                  src={photos[activeIdx]?.preview}
                  alt=""
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>
              {/* Bottom scrim */}
              <div className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{ height: '62%', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 40%, transparent 100%)' }} />
              {/* Top scrim */}
              <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '28%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)' }} />
            </div>

            {/* ── Top bar ── */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
              style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
              <button onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <X className="w-5 h-5 text-white" />
              </button>
              <span className="text-white font-bold text-[15px] tracking-wide">New Post</span>
              {photos.length < 10 ? (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Plus className="w-5 h-5 text-white" />
                </button>
              ) : <div className="w-10" />}
            </div>

            {/* Delete current photo */}
            <button onClick={() => removePhoto(activeIdx)}
              className="absolute z-30 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                top: 'max(62px, calc(env(safe-area-inset-top) + 48px))',
                right: 16,
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>

            {/* Slide nav arrows */}
            {photos.length > 1 && activeIdx > 0 && (
              <button onClick={() => setActiveIdx(i => i - 1)}
                className="absolute left-3 z-30 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {photos.length > 1 && activeIdx < photos.length - 1 && (
              <button onClick={() => setActiveIdx(i => i + 1)}
                className="absolute right-3 z-30 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Dot indicators */}
            {photos.length > 1 && (
              <div className="absolute left-0 right-0 flex justify-center gap-1.5 z-30 pointer-events-none"
                style={{ top: 'max(68px, calc(env(safe-area-inset-top) + 55px))' }}>
                {photos.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-200"
                    style={{ width: i === activeIdx ? 20 : 5, height: 4, background: i === activeIdx ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            )}

            {/* Photo strip thumbnails */}
            {photos.length > 1 && (
              <div className="absolute z-30 flex gap-2 px-4"
                style={{ bottom: 'max(220px, calc(env(safe-area-inset-bottom) + 210px))' }}>
                {photos.map((ph, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className="relative flex-shrink-0 rounded-xl overflow-hidden transition-all"
                    style={{ width: 48, height: 48, border: i === activeIdx ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.15)', opacity: i === activeIdx ? 1 : 0.6 }}>
                    <img src={ph.preview} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* ── Bottom panel ── */}
            <div className="absolute bottom-0 left-0 right-0 z-30"
              style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}>

              {/* Inline text input */}
              <AnimatePresence>
                {activeInput && (
                  <InputOverlay
                    key={activeInput}
                    type={activeInput}
                    value={activeInput === 'caption' ? caption : activeInput === 'location' ? location : tags}
                    onChange={v => activeInput === 'caption' ? setCaption(v) : activeInput === 'location' ? setLocation(v) : setTags(v)}
                    onDone={() => setActiveInput(null)}
                  />
                )}
              </AnimatePresence>

              {/* Active chips */}
              {!activeInput && (caption || location || tags || music) && (
                <div className="flex flex-wrap gap-2 px-4 mb-3">
                  {caption && (
                    <Chip color="#ff5500" icon={<Type className="w-3 h-3" />}
                      label={caption.length > 18 ? caption.slice(0, 18) + '…' : caption} />
                  )}
                  {music && (
                    <Chip color="#e91e8c" icon={<Music2 className="w-3 h-3" />}
                      label={music.title} onRemove={() => setMusic(null)} />
                  )}
                  {location && (
                    <Chip color="#06b6d4" icon={<MapPin className="w-3 h-3" />}
                      label={location.slice(0, 16)} onRemove={() => setLocation('')} />
                  )}
                  {tags && (
                    <Chip color="#a855f7" icon={<Users className="w-3 h-3" />}
                      label={tags.slice(0, 16)} onRemove={() => setTags('')} />
                  )}
                </div>
              )}

              {/* 4 action buttons */}
              <div className="grid grid-cols-4 gap-3 px-5 mb-4">
                {[
                  { id: 'music',   label: 'Music',    icon: <Music2 className="w-5 h-5" />,  color: '#e91e8c', active: !!music,    tap: () => setMusicOpen(true) },
                  { id: 'caption', label: 'Text',     icon: <Type className="w-5 h-5" />,    color: '#ff5500', active: !!caption,  tap: () => setActiveInput('caption') },
                  { id: 'location',label: 'Location', icon: <MapPin className="w-5 h-5" />,  color: '#06b6d4', active: !!location, tap: () => setActiveInput('location') },
                  { id: 'tags',    label: 'Tag',      icon: <Users className="w-5 h-5" />,   color: '#a855f7', active: !!tags,     tap: () => setActiveInput('tags') },
                ].map(btn => (
                  <motion.button key={btn.id} whileTap={{ scale: 0.84 }} onClick={btn.tap}
                    className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-square rounded-2xl flex items-center justify-center"
                      style={{
                        background: btn.active ? `${btn.color}20` : 'rgba(255,255,255,0.08)',
                        border: `1.5px solid ${btn.active ? btn.color + '65' : 'rgba(255,255,255,0.11)'}`,
                        backdropFilter: 'blur(14px)',
                        boxShadow: btn.active ? `0 0 20px ${btn.color}50` : 'none',
                        color: btn.active ? btn.color : 'rgba(255,255,255,0.65)',
                      }}>
                      {btn.icon}
                    </div>
                    <span className="text-[10px] font-semibold"
                      style={{ color: btn.active ? btn.color : 'rgba(255,255,255,0.35)' }}>
                      {btn.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {error && <p className="text-red-400 text-xs text-center mb-2 px-4">{error}</p>}

              {/* Post button */}
              <div className="px-4">
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => createPost.mutate()}
                  disabled={createPost.isPending || !photos.length}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 32px rgba(255,80,0,0.4)' }}>
                  {createPost.isPending
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting…</>
                    : `Post${photos.length > 1 ? ` (${photos.length} photos)` : ''}`}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}