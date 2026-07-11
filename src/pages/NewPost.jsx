import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music2, MapPin, Users, Type, ChevronLeft, ChevronRight, Loader2, ImagePlus, Check } from 'lucide-react';
import MusicPickerSheet from '@/components/create/MusicPickerSheet';
import SpiceLogo from '@/components/shared/SpiceLogo';

export default function NewPost() {
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
  const [activeInput, setActiveInput] = useState(null); // 'caption'|'location'|'tags'
  const [error, setError] = useState('');
  const [posted, setPosted] = useState(false);

  // Load photos passed from hub via sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('hubCapturedPhoto');
    if (stored) {
      sessionStorage.removeItem('hubCapturedPhoto');
      const extras = JSON.parse(sessionStorage.getItem('hubExtraPhotos') || '[]');
      sessionStorage.removeItem('hubExtraPhotos');
      setPhotos([stored, ...extras].map(p => ({ preview: p, file: null })));
    } else {
      // No photos passed — auto-open gallery
      setTimeout(() => fileInputRef.current?.click(), 80);
    }
  }, []);

  const addFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) { if (!photos.length) navigate(-1); return; }
    const newPhotos = files.slice(0, 10 - photos.length).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos(prev => {
      const next = [...prev, ...newPhotos];
      setActiveIdx(prev.length === 0 ? 0 : prev.length);
      return next;
    });
    e.target.value = '';
  };

  const remove = (i) => {
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
      const user = await base44.auth.me();
      if (!user) throw new Error('Not logged in');
      if (!photos.length) throw new Error('Add at least one photo');

      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []);
      const p = profiles[0] || {};
      const authorName = p.full_name || user.full_name || 'User';
      const authorUsername = p.username || user.email?.split('@')[0] || 'user';
      const authorAvatar = p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=ff5500&color=fff&size=128`;

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
      setTimeout(() => navigate('/'), 800);
    },
    onError: (err) => setError(err?.message || 'Failed to post'),
  });

  const hasPhotos = photos.length > 0;

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />

      <MusicPickerSheet open={musicOpen} onClose={() => setMusicOpen(false)} onSelect={setMusic} selectedTrack={music} />

      {/* Success flash */}
      <AnimatePresence>
        {posted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                <Check className="w-10 h-10 text-white" />
              </div>
              <p className="text-white font-bold text-xl">Posted!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 bg-black flex flex-col">

        {/* ── Empty state ── */}
        {!hasPhotos && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6"
            style={{ background: 'linear-gradient(160deg,#080410,#030208)' }}>
            {/* Back */}
            <button onClick={() => navigate(-1)}
              className="absolute top-0 left-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ top: 'max(14px, env(safe-area-inset-top))', background: 'rgba(255,255,255,0.07)' }}>
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(255,85,0,0.1)', border: '1.5px dashed rgba(255,85,0,0.4)' }}>
              <ImagePlus className="w-10 h-10 text-orange-500" />
            </div>
            <p className="text-white/50 text-sm">Opening your gallery…</p>
            <button onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3.5 rounded-full font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 24px rgba(255,80,0,0.4)' }}>
              Choose Photos
            </button>
          </div>
        )}

        {/* ── Photo screen ── */}
        {hasPhotos && (
          <>
            {/* Photo fills screen */}
            <div className="absolute inset-0" onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={photos[activeIdx]?.preview}
                  src={photos[activeIdx]?.preview}
                  alt=""
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{ height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)' }} />

              {/* Top gradient */}
              <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '25%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />
            </div>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4"
              style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
              <button onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                <X className="w-5 h-5 text-white" />
              </button>

              <SpiceLogo size="sm" />

              <div className="w-10" />
            </div>

            {/* Remove current photo */}
            <button onClick={() => remove(activeIdx)}
              className="absolute z-20 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                top: 'max(64px, calc(env(safe-area-inset-top) + 50px))',
                right: 16,
                background: 'rgba(0,0,0,0.6)',
              }}>
              <X className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Slide arrows */}
            {photos.length > 1 && activeIdx > 0 && (
              <button onClick={() => setActiveIdx(i => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {photos.length > 1 && activeIdx < photos.length - 1 && (
              <button onClick={() => setActiveIdx(i => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Dot indicators */}
            {photos.length > 1 && (
              <div className="absolute top-20 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none"
                style={{ marginTop: 'max(0px, env(safe-area-inset-top))' }}>
                {photos.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-200"
                    style={{ width: i === activeIdx ? 18 : 5, height: 4, background: i === activeIdx ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            )}

            {/* Thumbnail strip — always visible so user can add more photos */}
            <div className="absolute z-20 flex gap-2 px-4"
              style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 230px)', left: 0, right: 0, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {photos.map((ph, i) => (
                <div key={i} onClick={() => setActiveIdx(i)}
                  style={{ position: 'relative', flexShrink: 0, width: 56, height: 56, borderRadius: 12, overflow: 'hidden',
                    border: i === activeIdx ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.2)',
                    boxShadow: i === activeIdx ? '0 0 12px rgba(255,85,0,0.6)' : 'none',
                    cursor: 'pointer' }}>
                  <img src={ph.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={(e) => { e.stopPropagation(); remove(i); }}
                    style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X style={{ width: 10, height: 10, color: 'white' }} />
                  </button>
                </div>
              ))}
              {/* "Add more" button — always show if under 10 */}
              {photos.length < 10 && (
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12,
                    background: 'rgba(255,85,0,0.12)', border: '2px dashed rgba(255,85,0,0.6)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}>
                  <ImagePlus style={{ width: 20, height: 20, color: '#ff5500' }} />
                  <span style={{ color: '#ff5500', fontSize: 8, fontWeight: 700 }}>ADD</span>
                </button>
              )}
            </div>

            {/* ── Bottom panel ── */}
            <div className="absolute bottom-0 left-0 right-0 z-20"
              style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>

              {/* Inline inputs — slide up when active */}
              <AnimatePresence>
                {activeInput && (
                  <motion.div key={activeInput}
                    initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mx-4 mb-3 rounded-2xl flex items-center gap-3 px-4 py-3"
                    style={{ background: 'rgba(10,5,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                    {activeInput === 'caption' && <Type className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                    {activeInput === 'location' && <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                    {activeInput === 'tags' && <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />}

                    {activeInput === 'caption' ? (
                      <textarea autoFocus value={caption} onChange={e => setCaption(e.target.value)}
                        placeholder="Write a caption…" rows={2}
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none outline-none" />
                    ) : (
                      <input autoFocus
                        value={activeInput === 'location' ? location : tags}
                        onChange={e => activeInput === 'location' ? setLocation(e.target.value) : setTags(e.target.value)}
                        placeholder={activeInput === 'location' ? 'Add location…' : '@username @friend…'}
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none" />
                    )}
                    <button onClick={() => setActiveInput(null)}
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: activeInput === 'caption' ? '#ff5500' : activeInput === 'location' ? '#06b6d4' : '#a855f7' }}>
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active chips */}
              {!activeInput && (caption || location || tags || music) && (
                <div className="flex flex-wrap gap-2 px-4 mb-3">
                  {music && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(233,30,140,0.2)', border: '1px solid rgba(233,30,140,0.4)' }}>
                      <Music2 className="w-3 h-3 text-pink-400" />
                      <span className="text-white text-xs font-semibold" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{music.title}</span>
                      <button onClick={() => setMusic(null)}><X className="w-3 h-3 text-white/40" /></button>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)' }}>
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span className="text-white text-xs font-semibold">{location.slice(0, 16)}</span>
                      <button onClick={() => setLocation('')}><X className="w-3 h-3 text-white/40" /></button>
                    </div>
                  )}
                  {tags && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)' }}>
                      <Users className="w-3 h-3 text-purple-400" />
                      <span className="text-white text-xs font-semibold">{tags.slice(0, 14)}</span>
                      <button onClick={() => setTags('')}><X className="w-3 h-3 text-white/40" /></button>
                    </div>
                  )}
                  {caption && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(255,85,0,0.15)', border: '1px solid rgba(255,85,0,0.35)' }}>
                      <Type className="w-3 h-3 text-orange-400" />
                      <span className="text-white text-xs font-semibold">{caption.slice(0, 16)}{caption.length > 16 ? '…' : ''}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 4 action buttons */}
              <div className="flex items-center justify-center gap-5 px-4 mb-4">
                {[
                  { id: 'music',   icon: <Music2 className="w-5 h-5" />, label: 'Music',    color: '#e91e8c', active: !!music,    onTap: () => setMusicOpen(true) },
                  { id: 'caption', icon: <Type className="w-5 h-5" />,   label: 'Text',     color: '#ff5500', active: !!caption,  onTap: () => setActiveInput('caption') },
                  { id: 'location',icon: <MapPin className="w-5 h-5" />, label: 'Location', color: '#06b6d4', active: !!location, onTap: () => setActiveInput('location') },
                  { id: 'tags',    icon: <Users className="w-5 h-5" />,  label: 'Tag',      color: '#a855f7', active: !!tags,     onTap: () => setActiveInput('tags') },
                ].map(btn => (
                  <motion.button key={btn.id} whileTap={{ scale: 0.86 }} onClick={btn.onTap}
                    className="flex flex-col items-center gap-1.5">
                    <div className="w-13 h-13 rounded-2xl flex items-center justify-center"
                      style={{
                        width: 52, height: 52,
                        background: btn.active ? `${btn.color}22` : 'rgba(255,255,255,0.09)',
                        border: `1.5px solid ${btn.active ? btn.color + '70' : 'rgba(255,255,255,0.13)'}`,
                        backdropFilter: 'blur(12px)',
                        boxShadow: btn.active ? `0 0 18px ${btn.color}55` : 'none',
                        color: btn.active ? btn.color : 'rgba(255,255,255,0.75)',
                      }}>
                      {btn.icon}
                    </div>
                    <span className="text-[10px] font-semibold"
                      style={{ color: btn.active ? btn.color : 'rgba(255,255,255,0.4)' }}>
                      {btn.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center mb-3 px-4">{error}</p>
              )}

              {/* Post button */}
              <div className="px-4">
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => createPost.mutate()}
                  disabled={createPost.isPending}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 30px rgba(255,80,0,0.45)' }}>
                  {createPost.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting…</> : 'Post'}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}