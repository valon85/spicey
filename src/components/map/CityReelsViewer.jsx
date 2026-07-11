import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Flame, ChevronUp, ChevronDown, MapPin } from 'lucide-react';

function ReelItem({ item, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const getMedia = () => {
    // Video
    if (item.video_url) {
      return (
        <video
          ref={videoRef}
          src={item.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
        />
      );
    }
    // YouTube thumbnail
    if (item.youtube_video_id || item.youtube_thumbnail) {
      const thumb = item.youtube_thumbnail || `https://img.youtube.com/vi/${item.youtube_video_id}/hqdefault.jpg`;
      return (
        <>
          <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,0,0,0.85)', boxShadow: '0 0 0 6px rgba(255,255,255,0.15)' }}>
              <svg className="w-7 h-7 fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        </>
      );
    }
    // Photo
    const imgSrc = item.image_url || item.thumbnail_url || item.author_avatar;
    return imgSrc
      ? <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
      : <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#A020F0,#FF2D8A)' }} />;
  };

  const authorName = item.author_name || 'Spicey User';
  const authorUsername = item.author_username || 'spiceyuser';
  const authorAvatar = item.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=a020f0&color=fff&size=80`;
  const caption = item.caption || item.title || '';
  const likes = item.likes_count || item.fire_count || 0;
  const comments = item.comments_count || 0;
  const isRealPost = item.map_visible === true;

  return (
    <div className="absolute inset-0">
      {getMedia()}

      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.75) 100%)' }} />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-16 p-5 pb-10">
        <div className="flex items-center gap-3 mb-3">
          <img src={authorAvatar} alt={authorName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            style={{ border: '2px solid rgba(255,255,255,0.7)' }}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=U&background=a020f0&color=fff&size=80`; }} />
          <div>
            <p className="text-white font-bold text-sm leading-tight">{authorName}</p>
            <p className="text-white/60 text-xs">@{authorUsername}</p>
          </div>
          <button className="ml-2 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ border: '1.5px solid rgba(255,255,255,0.8)' }}>
            Follow
          </button>
        </div>
        {isRealPost && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(160,32,240,0.35)', border: '1px solid rgba(160,32,240,0.6)', backdropFilter: 'blur(8px)' }}>
            <MapPin className="w-3 h-3 text-purple-300" />
            <span className="text-purple-200 text-[10px] font-bold">Live on Map</span>
          </div>
        )}
        {caption && (
          <p className="text-white text-sm leading-relaxed line-clamp-3">{caption}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-10 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-1">
          <button className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <Heart className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs font-bold">{likes > 0 ? (likes >= 1000 ? (likes / 1000).toFixed(1) + 'K' : likes) : ''}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs font-bold">{comments > 0 ? comments : ''}</span>
        </div>
        <button className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          <Flame className="w-6 h-6 text-orange-400" />
        </button>
        <button className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          <Share2 className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function CityReelsViewer({ items, startIndex = 0, locationName, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [direction, setDirection] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoTimer = useRef(null);
  const progressTimer = useRef(null);
  const DURATION = 5000; // ms per slide

  const goNext = () => {
    if (current < items.length - 1) { setDirection(1); setCurrent(c => c + 1); }
  };
  const goPrev = () => {
    if (current > 0) { setDirection(-1); setCurrent(c => c - 1); }
  };

  // Reset & start auto-advance timer on each slide change
  useEffect(() => {
    setProgress(0);
    clearInterval(autoTimer.current);
    clearInterval(progressTimer.current);

    // Animate progress bar smoothly over DURATION
    const startTime = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, 50);

    // Auto-advance
    autoTimer.current = setTimeout(() => {
      if (current < items.length - 1) { setDirection(1); setCurrent(c => c + 1); }
      else onClose(); // finished all items
    }, DURATION);

    return () => {
      clearTimeout(autoTimer.current);
      clearInterval(progressTimer.current);
    };
  }, [current]);

  const handleDragEnd = (e, info) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  };

  const handleTap = (e) => {
    const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    if (x < window.innerWidth / 2) goPrev();
    else goNext();
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col" style={{ touchAction: 'none' }}>
      {/* Progress dots */}
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-3"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top) + 0.25rem)' }}>
        {items.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div className="h-full rounded-full"
              style={{
                width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
                background: 'linear-gradient(90deg,#A020F0,#FF2D8A)',
                transition: i === current ? 'none' : 'width 0.3s',
              }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top) + 0.75rem)', paddingBottom: 12 }}>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(160,32,240,0.4)' }}>
          <span className="text-white text-xs font-bold">📍 {locationName}</span>
        </div>
        <div className="px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <span className="text-white/70 text-xs font-semibold">{current + 1} / {items.length}</span>
        </div>
      </div>

      {/* Swipeable reel — horizontal */}
      <motion.div
        className="absolute inset-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onClick={handleTap}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            className="absolute inset-0"
            custom={direction}
            initial={{ x: direction >= 0 ? '100%' : '-100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? '-100%' : '100%', opacity: 0.6 }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
          >
            <ReelItem item={items[current]} isActive={true} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Tap zone hints (subtle chevrons) */}
      {current > 0 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <ChevronUp className="w-5 h-5 text-white/40 -rotate-90" />
        </div>
      )}
      {current < items.length - 1 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <ChevronUp className="w-5 h-5 text-white/40 rotate-90" />
        </div>
      )}
    </div>
  );
}