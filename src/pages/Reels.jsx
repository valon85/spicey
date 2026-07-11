import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, MessageCircle, Share2, Plus,
  Volume2, VolumeX, Home, Loader2, AlertCircle, Image
} from 'lucide-react';
import CommentsSheet from '@/components/feed/CommentsSheet';
import ShareSheet from '@/components/panels/ShareSheet';

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

const SLIDE_DURATION = 3000; // ms per photo

/* ─── Photo reel inside horizontal feed with auto-play + Ken Burns zoom ─── */
function PhotoReel({ urls }) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef(null);
  const timerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Auto-advance with zoom effect
  useEffect(() => {
    if (paused) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIdx(prev => prev < urls.length - 1 ? prev + 1 : 0);
    }, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [idx, paused, urls.length]);

  const onTouchStart = (e) => {
    setPaused(true);
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -40 && idx < urls.length - 1) setIdx(i => i + 1);
    else if (dx > 40 && idx > 0) setIdx(i => i - 1);
    touchX.current = null;
    setTimeout(() => setPaused(false), 500);
  };

  return (
    <div className="w-full h-full relative overflow-hidden"
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)`, width: `${urls.length * 100}%` }}>
        {urls.map((url, i) => (
          <div key={i} className="h-full flex-shrink-0 relative overflow-hidden" style={{ width: `${100 / urls.length}%` }}>
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
              style={{
                transform: i === idx ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 3s ease-in-out',
                transformOrigin: 'center center',
              }}
            />
          </div>
        ))}
      </div>
      {/* Dots */}
      {urls.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {urls.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? 20 : 6, height: 4, borderRadius: 9999,
              background: i === idx ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      )}
      {/* Photo badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-full z-10"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
        <Image className="w-3 h-3 text-white/80" />
        <span className="text-white/80 text-[10px] font-bold">{urls.length} PHOTOS</span>
      </div>
    </div>
  );
}

/* ─── Single reel card ─── */
function ReelCard({ reel, isActive, globalMuted, onMuteToggle, onNext, onLike, liked, onComment, onShare, currentUser }) {
  const videoRef = useRef(null);
  const mountedRef = useRef(true);
  const [loadState, setLoadState] = useState('idle'); // idle | loading | ready | error
  const [following, setFollowing] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const pauseIconTimerRef = useRef(null);

  const youtubeId = reel.youtube_video_id || reel.youtubeVideoId || reel.youtube_id;
  const isYouTube = !!youtubeId && !reel.video_url;
  const isPhoto = !isYouTube && !reel.video_url && (reel.image_url || reel.image_urls?.length > 0);
  const photoUrls = reel.image_urls || (reel.image_url ? [reel.image_url] : []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPhoto || isYouTube) return;

    if (!isActive) {
      video.pause();
      video.currentTime = 0;
      setLoadState('idle');
      return;
    }

    setLoadState('loading');
    video.muted = globalMuted;
    video.currentTime = 0;
    video.load();

    let started = false;
    const tryPlay = async () => {
      if (!mountedRef.current || !isActive || started) return;
      started = true;
      try {
        video.muted = globalMuted;
        await video.play();
        if (mountedRef.current) setLoadState('ready');
      } catch {
        // try muted fallback
        video.muted = true;
        try { await video.play(); if (mountedRef.current) setLoadState('ready'); } catch { if (mountedRef.current) setLoadState('error'); }
      }
    };

    video.addEventListener('canplay', tryPlay, { once: true });
    video.addEventListener('loadeddata', tryPlay, { once: true });
    video.addEventListener('error', () => { if (mountedRef.current) setLoadState('error'); }, { once: true });
    const t = setTimeout(tryPlay, 2000);

    return () => {
      clearTimeout(t);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [isActive, reel.video_url, isPhoto, isYouTube]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = globalMuted;
  }, [globalMuted]);

  // Click anywhere on screen = go next reel
  const handleScreenClick = () => {
    // Show brief pause icon then go next
    clearTimeout(pauseIconTimerRef.current);
    setShowPauseIcon(true);
    pauseIconTimerRef.current = setTimeout(() => {
      setShowPauseIcon(false);
      onNext();
    }, 200);
  };

  const avatarSrc = reel.author_avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.author_name || 'U')}&background=ff5500&color=fff&size=128`;

  return (
    <div className="relative w-full bg-black flex-shrink-0" style={{ width: '100vw', height: '100dvh' }}>

      {/* Media */}
      {isYouTube ? (
        <div className="absolute inset-0" onClick={handleScreenClick}>
          {isActive ? (
            <iframe
              title={reel.title || reel.caption || 'Spicey Reel'}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${globalMuted ? 1 : 0}&controls=0&playsinline=1&loop=1&playlist=${youtubeId}&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            />
          ) : (
            <img
              src={reel.thumbnail_url || reel.thumbnailUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)' }} />
        </div>
      ) : isPhoto ? (
        <div className="absolute inset-0" onClick={handleScreenClick}>
          <PhotoReel urls={photoUrls} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
        </div>
      ) : (
        <div className="absolute inset-0" onClick={handleScreenClick}>
          <video
            ref={videoRef}
            src={reel.video_url}
            className="w-full h-full object-cover"
            loop playsInline
            preload={isActive ? 'auto' : 'none'}
            style={{ touchAction: 'none' }}
          />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)' }} />

          {/* Loading */}
          {isActive && loadState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
            </div>
          )}
          {/* Error */}
          {isActive && loadState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <AlertCircle className="w-10 h-10 text-white/40" />
              <p className="text-white/50 text-sm">Video unavailable</p>
            </div>
          )}
        </div>
      )}

      {/* Next flash icon */}
      <AnimatePresence>
        {showPauseIcon && (
          <motion.div initial={{ opacity: 0.8, scale: 0.8 }} animate={{ opacity: 0, scale: 1.3 }} exit={{}}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-2xl">▶</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound button — top right */}
      <button
        onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
        className="absolute top-20 right-4 z-40 w-11 h-11 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
        {globalMuted
          ? <VolumeX className="w-5 h-5 text-white/60" />
          : <Volume2 className="w-5 h-5 text-white" />}
      </button>

      {/* Right actions */}
      <div className="absolute right-3 z-40 flex flex-col items-center gap-5"
        style={{ bottom: 'max(5.5rem, env(safe-area-inset-bottom) + 4.5rem)' }}>
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)' }}>
            <img src={avatarSrc} alt="" className="w-full h-full rounded-full object-cover border-2 border-black" />
          </div>
          {!following && reel.author_id !== currentUser?.id && (
            <button onClick={(e) => { e.stopPropagation(); setFollowing(true); base44.functions.invoke('toggleFollow', { target_user_id: reel.author_id }).catch(() => {}); }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center z-10">
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Like */}
        <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-gradient-to-br from-rose-400 to-pink-600' : 'bg-black/40 backdrop-blur-sm'}`}>
            <Heart className={`w-6 h-6 ${liked ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-xs font-bold text-white/70 drop-shadow">{formatCount(reel.likes_count || 0)}</span>
        </button>

        {/* Comment */}
        <button onClick={(e) => { e.stopPropagation(); onComment(); }} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white/70 drop-shadow">{formatCount(reel.comments_count || 0)}</span>
        </button>

        {/* Share */}
        <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white/70 drop-shadow">Share</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute left-4 right-20 z-40"
        style={{ bottom: 'max(4.5rem, env(safe-area-inset-bottom) + 3.5rem)' }}>
        <span className="font-bold text-white text-sm drop-shadow">@{reel.author_username || reel.author_name}</span>
        {reel.caption && (
          <p className="text-white/80 text-xs leading-snug line-clamp-2 drop-shadow mt-1">{reel.caption}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Reels() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [globalMuted, setGlobalMuted] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: reels = [], isLoading, error } = useQuery({
    queryKey: ['reels-feed-h'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getReelsFeed', {});
      return res?.data?.reels || [];
    },
    staleTime: 120000,
    retry: 2,
  });

  // Sync scroll position → currentIndex
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        setCurrentIndex(Math.max(0, Math.min(idx, reels.length - 1)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, [reels.length]);

  const goNext = useCallback(() => {
    const el = containerRef.current;
    if (!el || currentIndex >= reels.length - 1) return;
    const next = currentIndex + 1;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    setCurrentIndex(next);
  }, [currentIndex, reels.length]);

  // Hide bottom nav
  useEffect(() => {
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = 'none';
    return () => { if (nav) nav.style.display = ''; };
  }, []);

  if (isLoading) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      <p className="text-white/60 text-sm">Loading Reels…</p>
    </div>
  );

  if (error || reels.length === 0) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
      <p className="text-white/60 text-lg">{error ? 'Failed to load' : 'No reels yet'}</p>
      <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold">
        Go to Feed
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black" data-prevent-light-mode="true">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pointer-events-none"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)', paddingBottom: 12 }}>
        <button className="pointer-events-auto w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-95"
          onClick={() => navigate('/')}>
          <Home className="w-5 h-5 text-white" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-white font-bold text-base">REELS</h1>
          <p className="text-white/40 text-[10px]">Swipe left for next →</p>
        </div>
        <div className="w-9" />
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={containerRef}
        className="h-full w-full flex overflow-x-scroll overflow-y-hidden"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {reels.map((reel, index) => (
          <ReelCard
            key={reel.id || index}
            reel={reel}
            isActive={index === currentIndex}
            globalMuted={globalMuted}
            onMuteToggle={() => setGlobalMuted(m => !m)}
            onNext={goNext}
            liked={!!likedReels[reel.id]}
            onLike={() => setLikedReels(prev => ({ ...prev, [reel.id]: !prev[reel.id] }))}
            onComment={() => setShowComments(true)}
            onShare={() => setShowShare(true)}
            currentUser={currentUser}
          />
        ))}
      </div>

      {/* Progress dots — bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1.5 pointer-events-none"
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom) + 0.5rem)' }}>
        {reels.slice(Math.max(0, currentIndex - 3), Math.min(reels.length, currentIndex + 4)).map((_, i) => {
          const ai = Math.max(0, currentIndex - 3) + i;
          return (
            <div key={ai} className="rounded-full transition-all duration-300"
              style={{
                width: ai === currentIndex ? 20 : 6,
                height: 4,
                background: ai === currentIndex ? 'linear-gradient(90deg,#ff5500,#e91e8c)' : 'rgba(255,255,255,0.3)',
              }} />
          );
        })}
      </div>

      {showComments && reels[currentIndex] && (
        <CommentsSheet open={showComments} onClose={() => setShowComments(false)}
          post={{ id: reels[currentIndex].id, author_id: reels[currentIndex].author_id || 'stock', comments_count: reels[currentIndex].comments_count || 0 }} />
      )}
      {showShare && reels[currentIndex] && (
        <ShareSheet open={showShare} onClose={() => setShowShare(false)}
          post={{ id: reels[currentIndex].id, caption: reels[currentIndex].caption, author_name: reels[currentIndex].author_name, author_username: reels[currentIndex].author_username }} />
      )}
    </div>
  );
}
