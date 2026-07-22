import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  X, ChevronLeft, Music2, Type, Tag, MapPin, Sparkles,
  Loader2, ImagePlus, Check, Move
} from 'lucide-react';
import MusicPickerSheet from '@/components/create/MusicPickerSheet';
import CityReelsPrompt from '@/components/create/CityReelsPrompt';

const FILTERS = [
  { name: 'Normal',  style: 'none' },
  { name: 'Vivid',   style: 'saturate(1.8) contrast(1.1)' },
  { name: 'Warm',    style: 'sepia(0.4) saturate(1.4) brightness(1.05)' },
  { name: 'Cool',    style: 'hue-rotate(20deg) saturate(1.2)' },
  { name: 'Fade',    style: 'brightness(1.1) saturate(0.75) contrast(0.9)' },
  { name: 'Noir',    style: 'grayscale(1) contrast(1.2)' },
  { name: 'Moody',   style: 'brightness(0.8) contrast(1.2) saturate(1.3)' },
  { name: 'Golden',  style: 'sepia(0.55) saturate(1.7) brightness(1.08)' },
  { name: 'Dreamy',  style: 'brightness(1.08) saturate(0.65) blur(0.4px)' },
];

const TEXT_COLORS = ['#ffffff', '#ff5500', '#e91e8c', '#ffcc00', '#00e5ff', '#a855f7', '#22c55e', '#000000'];
const FONTS = ['Inter', 'Georgia', 'Courier New', 'Impact', 'Comic Sans MS'];
const FONT_LABELS = ['Modern', 'Classic', 'Typewriter', 'Bold', 'Fun'];

const TABS = [
  { id: 'filters',  label: 'Filters',  Icon: Sparkles },
  { id: 'text',     label: 'Text',     Icon: Type },
  { id: 'music',    label: 'Music',    Icon: Music2 },
  { id: 'tag',      label: 'Tag',      Icon: Tag },
  { id: 'location', label: 'Location', Icon: MapPin },
];

export default function StoryPhotoEditor() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const [photos, setPhotos]           = useState([]); // [{file, url}]
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photoFile = photos[activePhotoIdx]?.file || null;
  const photoUrl  = photos[activePhotoIdx]?.url  || null;
  const [activeTab, setActiveTab]     = useState('filters');
  const [filter, setFilter]           = useState(FILTERS[0]);
  const [text, setText]               = useState('');
  const [textDraft, setTextDraft]     = useState('');
  const [textColor, setTextColor]     = useState('#ffffff');
  const [textFont, setTextFont]       = useState(FONTS[0]);
  const [textPos, setTextPos]         = useState({ x: 50, y: 45 }); // percent
  const [track, setTrack]             = useState(null);
  const [tags, setTags]               = useState('');
  const [location, setLocation]       = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [musicOpen, setMusicOpen]     = useState(false);
  const [posting, setPosting]         = useState(false);
  const [done, setDone]               = useState(false);
  const [error, setError]             = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isDragging, setIsDragging]   = useState(false);
  const [showCityReelsPrompt, setShowCityReelsPrompt] = useState(false);
  const [cityReelsPostId, setCityReelsPostId] = useState(null);
  const [detectedCity, setDetectedCity] = useState('');

  // Keyboard detection
  useEffect(() => {
    const handler = () => {
      if (!window.visualViewport) return;
      const kbHeight = window.innerHeight - window.visualViewport.height;
      setKeyboardHeight(Math.max(0, kbHeight));
    };
    window.visualViewport?.addEventListener('resize', handler);
    return () => window.visualViewport?.removeEventListener('resize', handler);
  }, []);

  // Receive photo from StoryCreator
  useEffect(() => {
    if (window._storyPhotoFile) {
      const file = window._storyPhotoFile;
      window._storyPhotoFile = null;
      setPhotos([{ file, url: URL.createObjectURL(file) }]);
      setActivePhotoIdx(0);
      setTextDraft('');
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'SpiceyApp/1.0' } }
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.village || data.address?.county || '';
          const state = data.address?.state || '';
          if (city) {
            setLocation(`${city}${state ? ', ' + state : ''} · Spicey`);
            setDetectedCity(city);
          }
        } catch (e) {
          console.log('Location error:', e);
        }
        setLoadingLocation(false);
      },
      (err) => { console.log('GPS error:', err); setLoadingLocation(false); },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const pickFile = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPhotos = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setPhotos(prev => {
      const next = [...prev, ...newPhotos].slice(0, 10);
      setActivePhotoIdx(prev.length === 0 ? 0 : prev.length);
      return next;
    });
    e.target.value = '';
  };

  const removePhoto = (i) => {
    setPhotos(prev => {
      const next = prev.filter((_, idx) => idx !== i);
      if (!next.length) return next;
      setActivePhotoIdx(c => Math.min(c, next.length - 1));
      return next;
    });
  };

  // Drag text overlay
  const handleTextDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const getCoords = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      return {
        x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
        y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
      };
    };

    const onMove = (ev) => {
      const coords = getCoords(ev);
      setTextPos(coords);
    };
    const onEnd = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const publish = async () => {
    if (!photos.length || posting) return;
    setPosting(true);
    setError('');
    try {
      const user = await base44.auth.me();
      if (!user?.id) throw new Error('Not logged in');

      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
      const profile = profiles[0] || {};
      const name     = profile.full_name || user.full_name || 'User';
      const username = profile.username  || user.email?.split('@')[0] || 'user';
      const avatar   = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      const locationValue = location && location.trim() ? location.trim() : null;

      // Upload all photos
      const uploadedUrls = [];
      for (const ph of photos) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: ph.file });
        uploadedUrls.push(file_url);
      }

      // 1. Create Story entity (expires in 24h — shows in Story row)
      let lastResult = null;
      for (const url of uploadedUrls) {
        lastResult = await base44.entities.Story.create({
          user_id:           user.id,
          username,
          user_avatar:       avatar,
          image_url:         url,
          caption:           text && text.trim() ? text.trim() : '',
          location:          locationValue,
          tags:              tags && tags.trim() ? tags.trim() : '',
          music_title:       track?.title || '',
          music_artist:      track?.artist || '',
          music_preview_url: track?.previewUrl || '',
          expires_at:        expiresAt.toISOString(),
          views:             [],
        });
      }

      // 2. Also create a Post entity (shows in Feed + Reels + City Reels permanently)
      await base44.entities.Post.create({
        author_id:         user.id,
        author_name:       name,
        author_username:   username,
        author_avatar:     avatar,
        caption:           text && text.trim() ? text.trim() : '',
        image_url:         uploadedUrls[0],
        image_urls:        uploadedUrls.length > 1 ? uploadedUrls : [],
        video_url:         '',
        location:          locationValue || '',
        tags:              tags && tags.trim() ? tags.trim() : '',
        music_title:       track?.title || '',
        music_artist:      track?.artist || '',
        music_preview_url: track?.previewUrl || '',
        music_artwork_url: track?.artwork || '',
        post_type:         'feed',
        likes_count: 0, fire_count: 0, wow_count: 0, comments_count: 0, shares_count: 0,
      });

      // Show City Reels prompt if city detected
      if (detectedCity && lastResult?.id) {
        setCityReelsPostId(lastResult.id);
        setShowCityReelsPrompt(true);
      } else {
        setDone(true);
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (err) {
      setError(err?.message || 'Failed to post story.');
      setPosting(false);
    }
  };

  // ── No photo: pick screen ─────────────────────────────────
  if (!photos.length) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#0a0014,#0d0520,#050010)' }}>
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 px-8">
          <motion.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-32 h-32 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,85,0,0.25), rgba(233,30,140,0.22), rgba(167,51,255,0.18))',
              border: '1.5px solid rgba(255,85,0,0.4)',
              boxShadow: '0 0 40px rgba(255,85,0,0.25), 0 0 80px rgba(233,30,140,0.15)',
            }}>
            {/* Glow orb behind icon */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,85,0,0.3), transparent 70%)', filter: 'blur(10px)' }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                boxShadow: '0 8px 24px rgba(255,85,0,0.5), 0 0 40px rgba(233,30,140,0.3)',
              }}>
              <ImagePlus className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            {/* Sparkles */}
            {[0,1,2].map(i => {
              const pos = [{ top: '12%', left: '18%' }, { top: '20%', right: '14%' }, { bottom: '18%', left: '22%' }];
              return (
                <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ background: 'white', ...pos[i], boxShadow: '0 0 6px white' }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                />
              );
            })}
          </motion.div>
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold mb-1">Moment Editor</h2>
            <p className="text-white/40 text-sm">Choose a photo to get started</p>
          </div>
          <label className="cursor-pointer px-10 py-4 rounded-2xl text-white font-bold text-base"
            style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 28px rgba(255,85,0,0.45)' }}>
            Choose Photos
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickFile} />
          </label>
        </motion.div>
      </div>
    );
  }

  // ── Editor ────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)' }}>
                <Check className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-xl font-bold">Moment Posted!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-12 pb-3"
          style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.8),transparent)' }}>
          <button onClick={() => setPhotos([])}
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-bold text-base tracking-wide">Moment Editor</span>
          <motion.button whileTap={{ scale: 0.93 }} onClick={publish} disabled={posting}
            className="px-5 py-2.5 rounded-full text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 18px rgba(255,85,0,0.5)' }}>
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Story'}
          </motion.button>
        </div>

        {/* Photo canvas */}
        <div ref={canvasRef} className="relative overflow-hidden" style={{ flex: 1, minHeight: 0 }}>
          <img src={photoUrl} alt="Story"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: filter.style }} />

          {/* Draggable text overlay */}
          <AnimatePresence>
            {text.trim() && (
              <div
                ref={dragRef}
                onMouseDown={handleTextDragStart}
                onTouchStart={handleTextDragStart}
                className="absolute z-10 select-none"
                style={{
                  left: `${textPos.x}%`,
                  top: `${textPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}>
                <div className="px-4 py-2 text-center font-bold text-xl leading-snug max-w-[260px]"
                  style={{
                    color: textColor,
                    fontFamily: textFont,
                    textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)',
                  }}>
                  {text}
                </div>
                {/* Drag handle indicator */}
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-20"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}>
                  <Move className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Music badge */}
          {track && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full z-10"
              style={{ background: 'rgba(233,30,140,0.35)', border: '1px solid rgba(233,30,140,0.5)', backdropFilter: 'blur(12px)' }}>
              <Music2 className="w-3 h-3 text-pink-300" />
              <span className="text-white text-xs font-bold">{track.title}</span>
            </div>
          )}

          {/* Location badge */}
          {location.trim() && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <MapPin className="w-3 h-3 text-white/70" />
              <span className="text-white text-xs font-semibold">{location}</span>
            </div>
          )}

          {/* Error toast */}
          {error && (
            <div className="absolute top-24 left-4 right-4 px-4 py-3 rounded-2xl text-sm text-red-200 font-semibold text-center z-30"
              style={{ background: 'rgba(200,20,20,0.85)', backdropFilter: 'blur(8px)' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="flex-shrink-0 z-20 flex gap-2 px-3 pt-2 pb-1"
          style={{ background: 'rgba(8,4,14,0.97)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {photos.map((ph, i) => (
            <div key={i} onClick={() => setActivePhotoIdx(i)}
              style={{ position: 'relative', flexShrink: 0, width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
                border: i === activePhotoIdx ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.15)',
                boxShadow: i === activePhotoIdx ? '0 0 12px rgba(255,85,0,0.6)' : 'none',
                cursor: 'pointer' }}>
              <img src={ph.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: 9, height: 9, color: 'white' }} />
              </button>
            </div>
          ))}
          {photos.length < 10 && (
            <label style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 10,
              background: 'rgba(255,85,0,0.1)', border: '2px dashed rgba(255,85,0,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}>
              <ImagePlus style={{ width: 18, height: 18, color: '#ff5500' }} />
              <span style={{ color: '#ff5500', fontSize: 8, fontWeight: 700 }}>ADD</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={pickFile} />
            </label>
          )}
        </div>

        {/* Bottom panel */}
        <div className="flex-shrink-0 z-20"
          style={{
            background: 'rgba(8,4,14,0.97)',
            backdropFilter: 'blur(24px)',
            paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 8}px` : 'env(safe-area-inset-bottom,16px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>

          {/* Tabs */}
          <div className="flex">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id}
                onClick={() => { setActiveTab(id); if (id === 'music') setMusicOpen(true); }}
                className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors"
                style={{ color: activeTab === id ? '#ff5500' : 'rgba(255,255,255,0.35)' }}>
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-bold tracking-wide">{label}</span>
                {activeTab === id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(to right,#ff5500,#e91e8c)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-4 pt-3 pb-2 min-h-[120px]">

            {activeTab === 'filters' && (
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {FILTERS.map((f) => (
                  <button key={f.name} onClick={() => setFilter(f)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                    style={{ transform: filter.name === f.name ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.15s' }}>
                    <div className="w-[52px] h-[52px] rounded-xl overflow-hidden border-2 transition-all"
                      style={{
                        borderColor: filter.name === f.name ? '#ff5500' : 'rgba(255,255,255,0.1)',
                        boxShadow: filter.name === f.name ? '0 0 14px rgba(255,85,0,0.55)' : 'none',
                      }}>
                      <img src={photoUrl} alt={f.name} className="w-full h-full object-cover" style={{ filter: f.style }} />
                    </div>
                    <span className="text-[9px] font-bold"
                      style={{ color: filter.name === f.name ? '#ff5500' : 'rgba(255,255,255,0.35)' }}>
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={textDraft}
                  onChange={e => setTextDraft(e.target.value)}
                  onBlur={e => setText(e.target.value)}
                  onFocus={() => setTextDraft(text)}
                  placeholder="Add text to your story…"
                  maxLength={80}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm font-semibold text-center placeholder:text-white/25 outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: textFont }} />
                {/* Color picker */}
                <div className="flex gap-2 justify-center">
                  {TEXT_COLORS.map(c => (
                    <button key={c} onClick={() => setTextColor(c)}
                      className="w-7 h-7 rounded-full border-2 transition-all flex-shrink-0"
                      style={{
                        background: c,
                        borderColor: textColor === c ? '#fff' : 'transparent',
                        transform: textColor === c ? 'scale(1.25)' : 'scale(1)',
                        boxShadow: textColor === c ? `0 0 8px ${c}` : 'none',
                      }} />
                  ))}
                </div>
                {/* Font picker */}
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {FONTS.map((f, i) => (
                    <button key={f} onClick={() => setTextFont(f)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        fontFamily: f,
                        background: textFont === f ? 'rgba(255,85,0,0.2)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${textFont === f ? '#ff5500' : 'rgba(255,255,255,0.1)'}`,
                        color: textFont === f ? '#ff5500' : 'rgba(255,255,255,0.5)',
                      }}>
                      {FONT_LABELS[i]}
                    </button>
                  ))}
                </div>
                {text.trim() && (
                  <p className="text-white/30 text-[10px] text-center">Drag the text on photo to move it</p>
                )}
              </div>
            )}

            {activeTab === 'music' && (
              <div>
                {track ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.25)' }}>
                    <Music2 className="w-5 h-5 text-pink-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{track.title}</p>
                      <p className="text-white/40 text-xs">{track.artist}</p>
                    </div>
                    <button onClick={() => setTrack(null)}
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,30,30,0.6)' }}>
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setMusicOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Music2 className="w-5 h-5 text-white/40" />
                    <span className="text-white/40 text-sm font-semibold">Choose a track…</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'tag' && (
              <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                placeholder="@username @friend"
                className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder:text-white/25 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
            )}

            {activeTab === 'location' && (
              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="City, country or place…"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl text-white text-sm placeholder:text-white/25 outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  {loadingLocation && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />}
                </div>
                <button
                  onClick={detectLocation}
                  disabled={loadingLocation}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                  {loadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  {loadingLocation ? 'Detecting…' : '📍 Detect my location'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <MusicPickerSheet
        open={musicOpen}
        onClose={() => { setMusicOpen(false); setActiveTab('music'); }}
        onSelect={(t) => { setTrack(t); setMusicOpen(false); setActiveTab('music'); }}
        selectedTrack={track}
      />

      <CityReelsPrompt
        open={showCityReelsPrompt}
        onClose={() => {
          setShowCityReelsPrompt(false);
          setDone(true);
          setTimeout(() => navigate('/'), 1200);
        }}
        postId={cityReelsPostId}
        cityName={detectedCity}
        postType="story"
      />
    </>
  );
}