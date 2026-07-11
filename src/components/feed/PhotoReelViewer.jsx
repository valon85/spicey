import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, Flame, X, Volume2, VolumeX } from 'lucide-react';
import VerifiedBadge from '../shared/VerifiedBadge';
import SideAction from './SideAction';

const asArray = (v) => Array.isArray(v) ? v : [];

const SLIDE_DURATION = 3000; // ms per photo

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/* ── Animated progress bar for each photo ── */
function ProgressBar({ active, passed, duration }) {
  return (
    <div className="flex-1 h-[2.5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
      {active ? (
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      ) : (
        <div className="h-full rounded-full" style={{ width: passed ? '100%' : '0%', background: 'white' }} />
      )}
    </div>
  );
}

export default function PhotoReelViewer({
  post,
  onClose,
  liked, fireReacted, likesCount, fireCount,
  onLike, onFireReact, onComment, onShare, onSave, saved,
  authorIsVerified,
}) {
  const images = asArray(post.image_urls);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartTime = useRef(null);
  const audioRef = useRef(null);

  // Play music if available
  useEffect(() => {
    const musicUrl = post.music_preview_url;
    if (!musicUrl) return;
    
    // Stop any existing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 1.0;
    audioRef.current = audio;
    
    // Try to play with user gesture context
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.music_preview_url]);

  // Toggle mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev >= images.length - 1) {
        onClose?.();
        return prev;
      }
      return prev + 1;
    });
  }, [images.length, onClose]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (paused) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => {
        if (prev >= images.length - 1) {
          onClose?.();
          return prev;
        }
        return prev + 1;
      });
    }, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, paused, images.length, onClose]);

  // Touch handlers
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    setPaused(true);
  };

  const onTouchEnd = (e) => {
    setPaused(false);
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dt = Date.now() - touchStartTime.current;
    if (dt < 300 && Math.abs(dx) < 20) {
      // Quick tap — left side = prev, right side = next
      const screenW = window.innerWidth;
      if (touchStartX.current < screenW * 0.35) goPrev();
      else goNext();
    } else if (Math.abs(dx) > 50) {
      // Swipe
      if (dx < 0) goNext(); else goPrev();
    }
  };

  const safeAuthorName = (post.author_name || 'U')
    .replace(/ë/g, 'e').replace(/Ë/g, 'E').replace(/ç/g, 'c').replace(/Ç/g, 'C');
  const avatarSrc = post.author_avatar?.trim()
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeAuthorName)}&background=random&color=fff&size=128`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      data-prevent-light-mode="true"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 px-3"
        style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
        {images.map((_, i) => (
          <ProgressBar
            key={i}
            active={i === currentIndex}
            passed={i < currentIndex}
            duration={SLIDE_DURATION}
          />
        ))}
      </div>

      {/* Author header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3"
        style={{ paddingTop: 'max(22px, calc(env(safe-area-inset-top) + 12px))', paddingBottom: 10 }}>
        <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2.5" onClick={e => e.stopPropagation()}>
          <div className="p-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#ff5500,#ee1e8c)' }}>
            <img src={avatarSrc} alt={post.author_name} className="w-9 h-9 rounded-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-[13px] text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                {post.author_name || 'User'}
              </p>
              {authorIsVerified && <VerifiedBadge type="verified" size="sm" />}
            </div>
            <p className="text-[11px] text-white/70">{timeAgo(post.created_date)}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {(post.music_preview_url || post.music_title) && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Tap zones — left = prev, right = next */}
      <div className="absolute inset-0 z-20 flex" style={{ bottom: '8rem' }}>
        <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
        <div className="flex-1 h-full" />
        <div className="w-1/3 h-full cursor-pointer" onClick={goNext} />
      </div>

      {/* Photo */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            className="absolute inset-0"
            style={{
              opacity: idx === currentIndex ? 1 : 0,
              transition: 'opacity 0.35s ease-in-out',
              pointerEvents: 'none',
              zIndex: idx === currentIndex ? 1 : 0,
            }}
          >
            <img
              src={imgUrl}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
              style={{ display: 'block', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              loading="eager"
            />
          </div>
        ))}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />
      </div>

      {/* Side actions */}
      <div className="absolute right-3 z-30 flex flex-col items-center gap-4"
        style={{ bottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 3.5rem))' }}>
        <button onClick={(e) => { e.stopPropagation(); onLike?.(); }} className="active:scale-90 transition-transform">
          <SideAction icon={Heart} count={likesCount} active={liked} type="heart" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onFireReact?.(); }} className="active:scale-90 transition-transform">
          <SideAction icon={Flame} count={fireCount} active={fireReacted} type="fire" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onComment?.(); }} className="active:scale-90 transition-transform">
          <SideAction icon={MessageCircle} count={post.comments_count} active={false} type="comment" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onShare?.(); }} className="active:scale-90 transition-transform">
          <SideAction icon={Share2} count={post.shares_count} active={false} type="share" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onSave?.(); }} className="active:scale-90 transition-transform">
          <SideAction icon={Bookmark} active={saved} type="save" />
        </button>
      </div>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-16 z-20 px-4"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        {post.caption && (
          <p className="text-white text-[13px] font-semibold leading-snug line-clamp-3"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {post.caption}
          </p>
        )}
        {asArray(post.hashtags).length > 0 && (
          <p className="text-orange-400 text-[11px] mt-1 font-medium">
            {asArray(post.hashtags).map(t => `#${t}`).join('  ')}
          </p>
        )}
      </div>


    </motion.div>
  );
}