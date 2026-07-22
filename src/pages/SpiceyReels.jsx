import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Heart, MessageCircle, Share2, Volume2, VolumeX,
  Loader2, AlertCircle, Plus, MoreVertical, Trash2, Youtube,
  Search, Eye, Pause, Play
} from 'lucide-react';
import CommentsSheet from '@/components/feed/CommentsSheet';
import ShareSheet from '@/components/panels/ShareSheet';
import DeleteConfirmSheet from '@/components/shared/DeleteConfirmSheet';
import YouTubeReelItem from '@/components/reels/YouTubeReelItem';
import { toast } from 'sonner';

const SPICEY_REEL_REACTION_STORE_KEY = 'spicey_reel_reactions_v2';
const YOUTUBE_REEL_QUERIES = [
  'viral shorts',
  'travel shorts',
  'fashion shorts',
  'city night shorts',
  'dance shorts',
  'music shorts',
  'food shorts',
  'luxury lifestyle shorts',
  'funny short videos',
];

function currentYouTubeReelQuery() {
  const slot = Math.floor(Date.now() / (1000 * 60 * 60 * 6));
  return YOUTUBE_REEL_QUERIES[slot % YOUTUBE_REEL_QUERIES.length];
}

function rotateReelList(items = []) {
  if (!items.length) return [];
  const slot = Math.floor(Date.now() / (1000 * 60 * 60 * 6));
  const start = slot % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

const compactCount = (value) => {
  const count = Number(value || 0);
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  return String(count);
};

function ClipAction({ icon: Icon, count, active, onClick, label }) {
  return (
    <button type="button" onClick={(event) => { event.stopPropagation(); onClick?.(); }} className="spicey-clip-action" aria-label={label}>
      <span className={`spicey-clip-action-circle${active ? ' active' : ''}`}>
        <Icon size={27} strokeWidth={2.15} fill={active ? 'currentColor' : 'none'} />
      </span>
      <span className="spicey-clip-action-count">{compactCount(count)}</span>
    </button>
  );
}

function ClipCaption({ text }) {
  if (!text) return null;
  return <p className="spicey-clip-caption">{String(text).split(/(#[\p{L}\p{N}_]+)/gu).map((part, index) => part.startsWith('#') ? <span key={`${part}-${index}`}>{part}</span> : part)}</p>;
}

function getSpiceyReelKey(reel) {
  const raw = reel?.id || reel?.youtubeVideoId || reel?.youtube_video_id || reel?.video_url || reel?.image_url || reel?.caption || 'reel';
  return String(raw).replace(/\s+/g, '-').slice(0, 180);
}

function readSpiceyReelReactionStore() {
  try {
    return JSON.parse(localStorage.getItem(SPICEY_REEL_REACTION_STORE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writeSpiceyReelReactionState(reelKey, state) {
  try {
    const store = readSpiceyReelReactionStore();
    store[reelKey] = { ...(store[reelKey] || {}), ...state, updatedAt: Date.now() };
    localStorage.setItem(SPICEY_REEL_REACTION_STORE_KEY, JSON.stringify(store));
  } catch {
    // UI still updates even if private mode blocks storage.
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Photo reel — auto-slides + Ken Burns zoom so photos feel alive
───────────────────────────────────────────────────────────────────── */
function PhotoReel({ urls, musicUrl, isMuted, externalMusicRef }) {
  const [idx, setIdx] = useState(0);
  const [kenBurns, setKenBurns] = useState(0); // increments to re-trigger CSS anim
  const timerRef = useRef(null);

  // Play music when photo reel mounts (using external ref from parent)
  useEffect(() => {
    if (!musicUrl || !externalMusicRef) return;
    
    // Stop any existing audio
    if (externalMusicRef.current) {
      externalMusicRef.current.pause();
      externalMusicRef.current.src = '';
    }
    
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = isMuted ? 0 : 1.0;
    audio.muted = isMuted;
    externalMusicRef.current = audio;
    
    audio.play().catch(() => {});
  }, [musicUrl, externalMusicRef]);

  // Auto-advance every 3.5 s
  useEffect(() => {
    if (urls.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % urls.length;
        return next;
      });
      setKenBurns(k => k + 1);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [urls.length]);

  // Also reset Ken Burns counter on manual slide
  const goTo = (next) => {
    clearInterval(timerRef.current);
    setIdx(next);
    setKenBurns(k => k + 1);
    // Restart auto-advance
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % urls.length);
      setKenBurns(k => k + 1);
    }, 3500);
  };

  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (dx < -40 && idx < urls.length - 1) goTo(idx + 1);
    else if (dx > 40 && idx > 0) goTo(idx - 1);
  };

  return (
    <div className="w-full h-full overflow-hidden relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ pointerEvents: 'auto' }}>
      {/* Slides — absolute stacking, only active photo shown */}
      {urls.map((url, i) => (
        <div key={i} className="absolute inset-0 overflow-hidden"
          style={{
            opacity: i === idx ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }}>
          <img
            key={`${i}-${kenBurns}`}
            src={url}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
            style={i === idx ? {
              animation: 'kenBurns 4s ease-out forwards',
              transformOrigin: '50% 50%',
            } : {}}
          />
        </div>
      ))}

      {/* Dot indicators */}
      {urls.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
          {urls.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? 20 : 6, height: 4,
              borderRadius: 9999,
              background: i === idx ? 'white' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.35s ease',
            }} />
          ))}
        </div>
      )}


    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Single reel item — key-remounted on every index change.
   Video start sequence:
     1. pause + currentTime=0  (reset any leftover state)
     2. set muted correctly
     3. call play()
   This eliminates the race between autoplay muted→unmuted that caused
   audio desync and ghost audio from previous reels.
───────────────────────────────────────────────────────────────────── */
function ReelItem({
  reel, isMuted, onMuteToggle, audioUnlocked,
  currentUser, following, onFollow,
  liked, onLike, likesCount, fired, onFire, fireCount,
  onComment, onShare, onDelete, onVideoEnd,
}) {
  const videoRef = useRef(null);
  const musicRef = useRef(null);
  const [loadState, setLoadState] = useState('loading');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isOwner = currentUser && (currentUser.id === reel.author_id || currentUser.role === 'admin');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.Post.delete(reel.id);
      toast.success('Clip deleted');
      setShowDeleteConfirm(false);
      onDelete?.(reel.id);
    } catch {
      toast.error('Failed to delete. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  const isVideo = !!(reel.video_url && reel.video_url.startsWith('http') && !reel.video_url.includes('youtube'));
  const isPhoto = !isVideo && (reel.image_url || reel.image_urls?.length > 0);
  const isTextOnly = !isVideo && !isPhoto;
  const photoUrls = reel.image_urls?.length > 0
    ? reel.image_urls
    : (reel.image_url ? [reel.image_url] : []);
  const hasMusic = !!reel.music_preview_url;

  // Cleanup music when component unmounts or reel changes
  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.src = '';
        musicRef.current = null;
      }
    };
  }, []);

  // Detect Capacitor native (iOS/Android) — no autoplay restrictions there
  const isNative = !!(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.platform);

  // ── Mount/Change: start video autoplay (muted by default for web autoplay policy) ────
  useEffect(() => {
   const video = videoRef.current;
   if (!video || isPhoto || isTextOnly) return;

   let destroyed = false;
   let hlsInstance = null;
   let playCheckTimeout = null;

   console.log('[ReelVideo] Setting up autoplay for reel:', reel.id);

   const handleLoadedMetadata = () => { if (!destroyed) setVideoDuration(video.duration || 0); };
   const handleTimeUpdate = () => { if (!destroyed) setVideoTime(video.currentTime || 0); };
   const handleEnded = () => {
     if (destroyed) return;
     console.log('[ReelVideo] Video ended, triggering onVideoEnd');
     // Auto-advance to next reel when video ends naturally
     onVideoEnd?.();
   };

   const handlePlayCheck = () => {
     if (destroyed) return;
     if (video.paused && !video.ended) {
       console.warn('[ReelVideo] Video paused, trying to resume...');
       video.play().catch(() => {});
     }
     playCheckTimeout = setTimeout(handlePlayCheck, 5000);
   };

   video.addEventListener('loadedmetadata', handleLoadedMetadata);
   video.addEventListener('timeupdate', handleTimeUpdate);
   video.addEventListener('ended', handleEnded);
   video.addEventListener('play', () => { if (playCheckTimeout) clearTimeout(playCheckTimeout); });
   video.addEventListener('playing', handlePlayCheck);

   const doPlay = async () => {
     if (destroyed) return;
     setLoadState('loading');

     console.log('[ReelVideo] Attempting to play video, muted=true');

     // Start muted for autoplay - browsers allow muted autoplay
     video.muted = true;
     video.volume = 0;

     try {
       await video.play();
       console.log('[ReelVideo] Video started playing successfully');
       if (!destroyed) setLoadState('ready');
     } catch (e) {
       console.warn('[ReelAutoplay] Play failed:', e.message);
       if (!destroyed) setLoadState('error');
       return;
     }

     if (destroyed) return;

     if (hasMusic) {
       const audio = new Audio(reel.music_preview_url);
       audio.loop = true;
       audio.muted = true;
       audio.volume = 0;
       musicRef.current = audio;
       audio.play().catch(() => {});
     }
   };

   const src = reel.video_url;
   const isHLS = src && (src.includes('.m3u8') || src.includes('manifest/video'));

   if (isHLS && !video.canPlayType('application/vnd.apple.mpegurl')) {
     import('https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js').then((mod) => {
       if (destroyed) return;
       const Hls = mod.default;
       if (Hls.isSupported()) {
         const hls = new Hls({ autoStartLoad: true, startLevel: -1, enableWorker: true });
         hls.loadSource(src);
         hls.attachMedia(video);
         hls.on(Hls.Events.MANIFEST_PARSED, () => { if (!destroyed) doPlay(); });
         hls.on(Hls.Events.ERROR, (_e, data) => {
           if (data.fatal && !destroyed) { hls.destroy(); video.src = src; doPlay(); }
         });
         hlsInstance = hls;
       } else {
         video.src = src; video.load(); doPlay();
       }
     }).catch(() => { if (!destroyed) { video.src = src; video.load(); doPlay(); } });
   } else {
     video.src = src;
     video.load();
     if (video.readyState >= 1) { doPlay(); }
     else { video.addEventListener('loadedmetadata', doPlay, { once: true }); }
   }

   return () => {
     destroyed = true;
     if (playCheckTimeout) clearTimeout(playCheckTimeout);
     video.removeEventListener('loadedmetadata', handleLoadedMetadata);
     video.removeEventListener('timeupdate', handleTimeUpdate);
     video.removeEventListener('ended', handleEnded);
     video.removeEventListener('play', handlePlayCheck);
     video.removeEventListener('playing', handlePlayCheck);
     if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
     video.pause(); video.src = ''; video.load();
     if (musicRef.current) {
       musicRef.current.pause(); musicRef.current.src = ''; musicRef.current = null;
     }
   };
  }, [reel.id, reel.video_url, isPhoto, isTextOnly, hasMusic, reel.music_preview_url, onVideoEnd]);

  // ── Whenever isMuted changes (user taps volume or audio unlocks), apply immediately ──
  useEffect(() => {
    const video = videoRef.current;
    if (isPhoto || isTextOnly) {
      // For photo reels, just update music volume
      if (musicRef.current) {
        musicRef.current.muted = isMuted;
        musicRef.current.volume = isMuted ? 0 : 1.0;
      }
      return;
    }
    if (!video) return;
    video.muted = isMuted;
    video.volume = isMuted ? 0 : 1.0;
    // If unmuting and video is paused, try to play
    if (!isMuted && video.paused) {
      video.play().catch(() => {});
    }
    if (musicRef.current) {
      musicRef.current.muted = isMuted;
      musicRef.current.volume = isMuted ? 0 : 1.0;
      if (!isMuted && musicRef.current.paused) {
        musicRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, isPhoto]);

  const displayAuthorName = reel.author_name || reel.author_username || 'Spicey Creator';
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayAuthorName)}&background=ff2b83&color=ffffff&size=160`;
  const rawAvatar = String(reel.author_avatar || reel.avatar_url || '').trim();
  const avatarSrc = rawAvatar && !['?', 'null', 'undefined'].includes(rawAvatar.toLowerCase())
    ? rawAvatar
    : fallbackAvatar;
  const handleAvatarError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackAvatar;
  };

  return (
    <div className="relative bg-black w-full h-full">
      {/* Media layer */}
      <div className="absolute inset-0">
        {isTextOnly ? (
          /* Text-only post — gradient background with big caption */
          <>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a0033 0%, #0d0520 40%, #200030 70%, #0a001a 100%)', pointerEvents: 'none' }} />
            <div className="absolute inset-0 flex items-center justify-center px-8 pointer-events-none">
              <p className="text-white text-2xl font-bold text-center leading-relaxed"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)', maxHeight: '60vh', overflow: 'hidden' }}>
                {reel.caption || ''}
              </p>
            </div>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />
          </>
        ) : isPhoto ? (
          <>
            <PhotoReel urls={photoUrls} musicUrl={reel.music_preview_url} isMuted={isMuted} externalMusicRef={musicRef} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              loop playsInline preload="auto" muted
              style={{ pointerEvents: 'none' }}
              onClick={(e) => { e.stopPropagation(); }}
              onTouchStart={(e) => { e.stopPropagation(); }}
            />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />
            {loadState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ pointerEvents: 'none' }}>
                <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
              </div>
            )}
            {loadState === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none" style={{ pointerEvents: 'none' }}>
                <AlertCircle className="w-10 h-10 text-white/40" />
                <p className="text-white/50 text-sm">Video unavailable</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ⋯ Owner menu — top left, below back button */}
      {isOwner && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
          className="absolute left-4 z-40 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ top: 'calc(max(12px, env(safe-area-inset-top)) + 56px)', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Owner action sheet */}
      {showMenu && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setShowMenu(false)}>
          <div className="w-full rounded-t-3xl px-5 pt-4 pb-8"
            onClick={e => e.stopPropagation()}
            style={{ background: 'rgba(14,7,24,0.99)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <button
              onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 font-semibold text-sm mb-2"
              style={{ background: 'rgba(220,30,30,0.1)', border: '1px solid rgba(220,30,30,0.25)' }}>
              <Trash2 className="w-5 h-5" /> Delete Clip
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="w-full py-3.5 rounded-2xl text-white/60 font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm sheet */}
      <DeleteConfirmSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this Clip?"
        description="This clip will be permanently removed. This cannot be undone."
      />

      {/* Right actions */}
      <div className="spicey-clip-actions">
        <div className="relative">
          <div className="spicey-clip-avatar-ring"
            style={{ background: 'conic-gradient(from 0deg,#ff5500,#e91e8c,#7700bb,#ff5500)', boxShadow: '0 0 20px rgba(255,80,0,0.6)' }}>
            <img src={avatarSrc} alt={displayAuthorName} onError={handleAvatarError} />
          </div>
          {!following && reel.author_id !== currentUser?.id && (
            <button onClick={(e) => { e.stopPropagation(); onFollow(); }}
              className="spicey-clip-avatar-plus"
              style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 12px rgba(255,80,0,0.8)' }}>
              <Plus size={16} strokeWidth={3} />
            </button>
          )}
        </div>
        <ClipAction icon={Heart} count={likesCount ?? reel.likes_count ?? 0} onClick={onLike} active={liked} label="Like" />
        <ClipAction icon={MessageCircle} count={reel.comments_count || 0} onClick={onComment} label="Comments" />
        <ClipAction icon={Share2} count={reel.shares_count || 0} onClick={onShare} label="Share" />
        <button type="button" onClick={(event) => event.stopPropagation()} className="spicey-clip-more" aria-label="More"><MoreVertical size={27} /></button>
      </div>

      {/* Profile and caption */}
      <div className="spicey-clip-details">
        <div className="spicey-clip-profile-row">
          <img src={avatarSrc} alt={displayAuthorName} onError={handleAvatarError} />
          <strong>{displayAuthorName}</strong>
          <span className="spicey-clip-verified" aria-label="Verified">✓</span>
          {!following && reel.author_id !== currentUser?.id && <button type="button" onClick={(event) => { event.stopPropagation(); onFollow(); }}>Follow</button>}
        </div>
        <ClipCaption text={reel.caption} />
        {reel.location && (
          <p className="spicey-clip-location">📍 {reel.location}</p>
        )}
        {reel.music_title && (
          <p className="spicey-clip-music">♫ {reel.music_title}{reel.music_artist ? ` · ${reel.music_artist}` : ''}</p>
        )}
      </div>

      {!isPhoto && !isTextOnly && videoDuration > 0 && (
        <div className="spicey-clip-player-controls">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              const video = videoRef.current;
              if (!video) return;
              if (video.paused) { video.play().catch(() => {}); setIsPaused(false); }
              else { video.pause(); setIsPaused(true); }
            }}
            className="spicey-clip-play"
          >
            {isPaused ? <Play className="w-5 h-5" fill="currentColor" /> : <Pause className="w-5 h-5" fill="currentColor" />}
          </button>
          <span>0:{String(Math.floor(videoTime)).padStart(2, '0')}</span>
          <div className="spicey-clip-progress">
            <div style={{ width: `${Math.min(100, (videoTime / videoDuration) * 100)}%` }}><i /></div>
          </div>
          <span>0:{String(Math.floor(videoDuration)).padStart(2, '0')}</span>
          <button type="button" onClick={(event) => { event.stopPropagation(); onMuteToggle(); }} className="spicey-clip-volume">
            {isMuted ? <VolumeX size={25} /> : <Volume2 size={25} />}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main page — vertical swipe to navigate reels
───────────────────────────────────────────────────────────────────── */
export default function SpiceyReels() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1); // 1=next, -1=prev for animation
  const isNativeApp = !!(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.platform);
  const [isMuted, setIsMuted] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [likedReels, setLikedReels] = useState({});
  const [firedReels, setFiredReels] = useState({});
  const [reelLikeCounts, setReelLikeCounts] = useState({});
  const [reelFireCounts, setReelFireCounts] = useState({});
  const [followingMap, setFollowingMap] = useState({});
  const [clipTab, setClipTab] = useState('For You');
  const [currentUser, setCurrentUser] = useState(null);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const autoNextRef = useRef(null);
  const videoEndTimerRef = useRef(null);

  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);
  const swipeLocked = useRef(false);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const handleReelDeleted = (deletedId) => {
    setDeletedIds(prev => new Set([...prev, deletedId]));
    queryClient.invalidateQueries({ queryKey: ['spicey-reels-feed-v9'] });
    // Move to next reel if possible
    setCurrentIndex(i => Math.max(0, i));
  };

  const { data: rawReels = [], isLoading, error } = useQuery({
    queryKey: ['spicey-reels-feed-v9'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getReelsFeed', {});
      // Return empty array (not error) if no reels — YouTube will fill in
      return res?.data?.reels || [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });

  // YouTube fallback — load immediately if Spicey reels are empty, or when near end
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytLoaded, setYtLoaded] = useState(false);

  const loadYouTubeFallback = useCallback(async () => {
    if (ytLoaded || ytLoading) return;
    setYtLoading(true);
    try {
      const res = await base44.functions.invoke('getYouTubeReels', {
        query: currentYouTubeReelQuery(),
        limit: 12,
      });
      const videos = rotateReelList(res?.data?.videos || []);
      console.log('[SpiceyReels] YouTube fallback loaded:', videos.length, 'videos');
      setYoutubeVideos(videos);
    } catch (e) {
      console.warn('[SpiceyReels] YouTube fallback failed:', e.message);
    } finally {
      setYtLoading(false);
      setYtLoaded(true);
    }
  }, [ytLoaded, ytLoading]);

  // Trigger YouTube immediately when Spicey reels finish loading (even if 0 reels)
  useEffect(() => {
    if (!isLoading) {
      loadYouTubeFallback();
    }
  }, [isLoading, loadYouTubeFallback]);

  // Hide bottom nav AND stop all audio on unmount
  useEffect(() => {
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = 'none';
    const restore = () => { const n = document.getElementById('bottom-nav'); if (n) n.style.display = ''; };
    window.addEventListener('pagehide', restore);
    
    // Stop ALL audio when leaving reels page
    return () => {
      restore();
      window.removeEventListener('pagehide', restore);
      // Pause all videos and audio
      document.querySelectorAll('video').forEach(v => { v.pause(); v.src = ''; v.load(); });
      // Stop any playing audio
      const allAudio = document.querySelectorAll('audio');
      allAudio.forEach(a => { a.pause(); a.src = ''; a.load(); });
      // Also stop any AudioContext
      if (window.audioContext) {
        try { window.audioContext.close(); } catch {}
      }
    };
  }, []);

  const spiceyReels = rawReels.filter(r => !deletedIds.has(r.id));
  const requestedCreatorId = new URLSearchParams(window.location.search).get('creator');
  const orderedSpiceyReels = requestedCreatorId
    ? [...spiceyReels].sort((a, b) => {
        const aMatches = String(a.author_id || a.user_id || '') === requestedCreatorId;
        const bMatches = String(b.author_id || b.user_id || '') === requestedCreatorId;
        return Number(bMatches) - Number(aMatches);
      })
    : spiceyReels;
  // Combined feed: real Spicey reels first, then YouTube fallback
  const allReels = [
    ...orderedSpiceyReels.map(r => ({ ...r, _source: 'spicey' })),
    ...youtubeVideos.map(v => ({ ...v, id: `yt_${v.youtubeVideoId}`, _source: 'youtube' })),
  ];
  const allReelsRef = useRef([]);
  allReelsRef.current = allReels;

  // Deep-link a notification to the exact Spicey reel once the feed arrives.
  useEffect(() => {
    const requestedReelId = new URLSearchParams(window.location.search).get('reelId');
    if (!requestedReelId || !allReels.length) return;
    const requestedIndex = allReels.findIndex((reel) =>
      String(reel.id) === requestedReelId ||
      String(reel.post_id || '') === requestedReelId ||
      String(reel.youtubeVideoId || '') === requestedReelId
    );
    if (requestedIndex >= 0) setCurrentIndex(requestedIndex);
  }, [allReels.length, rawReels, youtubeVideos]);

  const spiceyCount = spiceyReels.length;
  const ytCount = youtubeVideos.length;

  useEffect(() => {
    if (!allReels.length) return;
    const saved = readSpiceyReelReactionStore();
    const nextLiked = {};
    const nextFired = {};
    const nextLikes = {};
    const nextFires = {};

    allReels.forEach((item) => {
      const key = getSpiceyReelKey(item);
      const savedState = saved[key];
      nextLiked[key] = !!savedState?.liked;
      nextFired[key] = !!savedState?.fired;
      nextLikes[key] = Number.isFinite(savedState?.likesCount) ? savedState.likesCount : Number(item.likes_count || 0);
      nextFires[key] = Number.isFinite(savedState?.fireCount) ? savedState.fireCount : Number(item.fire_count || 0);
    });

    setLikedReels(nextLiked);
    setFiredReels(nextFired);
    setReelLikeCounts(nextLikes);
    setReelFireCounts(nextFires);
  }, [rawReels, youtubeVideos]);

  const handleReelReaction = useCallback((item, type) => {
    const key = getSpiceyReelKey(item);
    const activeMap = type === 'like' ? likedReels : firedReels;
    const countMap = type === 'like' ? reelLikeCounts : reelFireCounts;
    const setActiveMap = type === 'like' ? setLikedReels : setFiredReels;
    const setCountMap = type === 'like' ? setReelLikeCounts : setReelFireCounts;
    const baseCount = type === 'like' ? item.likes_count : item.fire_count;
    const wasActive = !!activeMap[key];
    const nextActive = !wasActive;
    const currentCount = Number(countMap[key] ?? baseCount ?? 0);
    const nextCount = nextActive ? currentCount + 1 : Math.max(0, currentCount - 1);

    setActiveMap(prev => ({ ...prev, [key]: nextActive }));
    setCountMap(prev => ({ ...prev, [key]: nextCount }));
    writeSpiceyReelReactionState(key, {
      liked: type === 'like' ? nextActive : !!likedReels[key],
      fired: type === 'fire' ? nextActive : !!firedReels[key],
      likesCount: type === 'like' ? nextCount : Number(reelLikeCounts[key] ?? item.likes_count ?? 0),
      fireCount: type === 'fire' ? nextCount : Number(reelFireCounts[key] ?? item.fire_count ?? 0),
    });

    if (item._source !== 'youtube' && item.id && currentUser) {
      base44.functions.invoke('toggleReaction', { post_id: item.id, type }).catch(() => {});
    }
  }, [currentUser, firedReels, likedReels, reelFireCounts, reelLikeCounts]);

  const goNext = useCallback(() => {
    setSlideDir(1);
    setCurrentIndex(i => {
      const next = Math.min(allReelsRef.current.length - 1, i + 1);
      // If approaching end of Spicey reels, pre-load YouTube fallback
      const spiceyCount = allReelsRef.current.filter(r => r._source === 'spicey').length;
      if (next >= spiceyCount - 2) loadYouTubeFallback();
      return next;
    });
  }, [loadYouTubeFallback]);

  const goPrev = useCallback(() => {
    setSlideDir(-1);
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  // Auto-advance logic:
  // - Photo reels: 4 seconds per photo
  // - Video reels: wait for video to end naturally (via onVideoEnd callback)
  // - YouTube reels: wait for YouTube video to end (via onVideoEnd callback)
  useEffect(() => {
    clearInterval(autoNextRef.current);
    clearTimeout(videoEndTimerRef.current);

    const currentReel = allReelsRef.current[currentIndex];
    if (!currentReel) return;

    const isPhoto = !!(currentReel.image_url || currentReel.image_urls?.length > 0);
    const isVideo = !isPhoto && currentReel._source !== 'youtube';

    // Photo reel: auto-advance every 4 seconds
    if (isPhoto) {
      autoNextRef.current = setInterval(() => {
        setSlideDir(1);
        setCurrentIndex(i => Math.min(allReelsRef.current.length - 1, i + 1));
      }, 4000);
      return () => clearInterval(autoNextRef.current);
    }

    // Video reel: fallback timer in case 'ended' event doesn't fire
    // Most videos are 15-30 seconds, so we set a 35 second fallback
    if (isVideo) {
      videoEndTimerRef.current = setTimeout(() => {
        console.log('[SpiceyReels] Fallback timer triggered, advancing to next reel');
        setSlideDir(1);
        setCurrentIndex(i => Math.min(allReelsRef.current.length - 1, i + 1));
      }, 35000);
      return () => clearTimeout(videoEndTimerRef.current);
    }

    // YouTube reel: wait for YouTube video to end (handled by YouTubeReelItem)
  }, [currentIndex]);

  // Unlock audio — called when user taps volume button
  const unlockAudio = () => {
    setIsMuted(false);
    setAudioUnlocked(true);
  };

  // Vertical swipe handler on the container
  const handleContainerTouchStart = (e) => {
    // Auto-unlock audio on very first touch anywhere on screen
    if (!audioUnlocked) unlockAudio();
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    swipeLocked.current = false;
  };

  const handleContainerTouchMove = (e) => {
    if (swipeLocked.current) return;
    if (touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    // If clearly vertical, prevent page scroll
    if (Math.abs(dy) > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleContainerTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dt = Date.now() - touchStartTime.current;
    touchStartY.current = null;

    // Swipe up → next reel; swipe down → previous reel
    // Lower threshold for easier swipe (40px or fast flick)
    const speed = Math.abs(dy) / dt;
    const threshold = speed > 0.5 ? 25 : 40;

    if (dy < -threshold) {
      e.preventDefault();
      goNext();
    } else if (dy > threshold) {
      e.preventDefault();
      goPrev();
    }
    swipeLocked.current = true;
  };

  if (isLoading) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4" data-prevent-light-mode="true">
      {/* Always-visible back button — prevents getting stuck */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-0 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ top: 'max(16px, env(safe-area-inset-top))', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      <p className="text-white/60 text-sm">Loading Spicey Clips…</p>
    </div>
  );

  // Show empty state only if BOTH Spicey and YouTube have nothing (and YouTube is done loading)
  if (allReels.length === 0 && ytLoaded && !ytLoading) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4" data-prevent-light-mode="true">
      <button
        onClick={() => navigate('/')}
        className="absolute left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ top: 'max(16px, env(safe-area-inset-top))', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      <span className="text-4xl">🎬</span>
      <p className="text-white/60 text-lg font-semibold">No clips available</p>
      <p className="text-white/35 text-sm">Be the first to post a Spicey Clip!</p>
      <button onClick={() => navigate('/')} className="mt-2 px-6 py-3 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
        Go to Feed
      </button>
    </div>
  );

  // Show loading while YouTube is still fetching and Spicey is empty
  if (allReels.length === 0 && (ytLoading || !ytLoaded)) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4" data-prevent-light-mode="true">
      <button onClick={() => navigate('/')} className="absolute left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ top: 'max(16px, env(safe-area-inset-top))', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      <p className="text-white/60 text-sm">Loading videos…</p>
    </div>
  );

  const reel = allReels[currentIndex] || allReels[0];
  const isYouTubeReel = reel?._source === 'youtube';

  return (
    <>
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.0); }
          100% { transform: scale(1.08); }
        }
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); opacity: 0.6; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .spicey-clips-header {
          padding-bottom: 34px;
          background: linear-gradient(180deg, rgba(3,2,8,.88) 0%, rgba(3,2,8,.52) 58%, transparent 100%);
        }
        .spicey-clips-shell {
          width: min(100vw, 480px);
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%);
          box-shadow: 0 0 80px rgba(231,25,126,.12);
        }
        .spicey-clips-brand {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 5px;
          border: 0;
          padding: 0;
          color: #fff;
          background: transparent;
        }
        .spicey-clips-brand img { width: 42px; height: 42px; object-fit: contain; }
        .spicey-clips-brand strong {
          font-size: 23px;
          line-height: 1;
          font-weight: 950;
          font-style: italic;
          letter-spacing: -.06em;
          background: linear-gradient(90deg,#ff5a12,#ff263c 44%,#f018a0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .spicey-clips-brand span { font-size: 23px; font-weight: 500; letter-spacing: -.05em; color: #fff; }
        .spicey-clips-round {
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          background: rgba(5,4,10,.3);
        }
        .spicey-clips-views {
          height: 38px;
          min-width: 72px;
          padding: 0 12px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #fff;
          background: rgba(4,3,9,.46);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(12px);
          font-size: 13px;
          font-weight: 750;
        }
        .spicey-clips-tabs {
          display: flex;
          gap: 25px;
          margin-top: 9px;
          padding: 0 18px 5px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .spicey-clips-tabs::-webkit-scrollbar { display: none; }
        .spicey-clips-tabs button {
          position: relative;
          flex: 0 0 auto;
          padding: 7px 0 10px;
          border: 0;
          color: rgba(255,255,255,.66);
          background: transparent;
          font-size: 13px;
          font-weight: 650;
        }
        .spicey-clips-tabs button.active { color: #fff; }
        .spicey-clips-tabs button.active::after {
          content: '';
          position: absolute;
          left: 20%;
          right: 20%;
          bottom: 1px;
          height: 2px;
          border-radius: 999px;
          background: #ff2b83;
          box-shadow: 0 0 10px rgba(255,43,131,.9);
        }
        .spicey-clip-actions {
          position: absolute; right: 13px; bottom: max(168px, calc(env(safe-area-inset-bottom) + 154px)); z-index: 40;
          display: flex; flex-direction: column; align-items: center; gap: 13px; color: #fff;
        }
        .spicey-clip-avatar-ring { width: 56px; height: 56px; border-radius: 50%; padding: 2px; }
        .spicey-clip-avatar-ring img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid #08060b; }
        .spicey-clip-avatar-plus {
          position: absolute; left: 50%; bottom: -8px; transform: translateX(-50%); z-index: 2;
          width: 27px; height: 27px; border-radius: 50%; display: grid; place-items: center; border: 2px solid #100812; color: #fff;
        }
        .spicey-clip-action { border: 0; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 3px; color: #fff; background: transparent; }
        .spicey-clip-action-circle {
          width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center;
          background: rgba(9,6,13,.48); border: 1px solid rgba(255,255,255,.16); backdrop-filter: blur(13px);
          box-shadow: 0 8px 24px rgba(0,0,0,.28); text-shadow: 0 2px 8px #000;
        }
        .spicey-clip-action-circle.active { color: #ff2b77; background: rgba(55,5,30,.62); border-color: rgba(255,43,119,.48); }
        .spicey-clip-action-count { color: #fff; font-size: 12px; line-height: 1; font-weight: 750; text-shadow: 0 2px 7px #000; }
        .spicey-clip-more { width: 50px; height: 36px; display: grid; place-items: center; border: 0; color: #fff; background: transparent; filter: drop-shadow(0 2px 7px #000); }
        .spicey-clip-details {
          position: absolute; left: 16px; right: 80px; bottom: max(78px, calc(env(safe-area-inset-bottom) + 68px)); z-index: 40;
          color: #fff; text-shadow: 0 2px 9px rgba(0,0,0,.92); pointer-events: none;
        }
        .spicey-clip-profile-row { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; pointer-events: auto; }
        .spicey-clip-profile-row img { width: 39px; height: 39px; flex: 0 0 auto; object-fit: cover; border-radius: 50%; border: 2px solid #ff397f; }
        .spicey-clip-profile-row strong { min-width: 0; max-width: 148px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; }
        .spicey-clip-profile-row button { margin-left: 5px; min-width: 76px; height: 32px; border-radius: 999px; border: 1px solid #ff2b83; color: #ff4b96; background: rgba(15,5,12,.42); font-size: 13px; font-weight: 750; backdrop-filter: blur(8px); }
        .spicey-clip-verified { width: 17px; height: 17px; flex: 0 0 auto; border-radius: 5px; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg,#b44cff,#7228eb); font-size: 11px; font-weight: 950; text-shadow: none; transform: rotate(8deg); }
        .spicey-clip-caption { font-size: 14px; line-height: 1.35; font-weight: 550; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .spicey-clip-caption span { color: #ff2b78; font-weight: 750; }
        .spicey-clip-location, .spicey-clip-music { margin-top: 5px; color: rgba(255,255,255,.9); font-size: 11px; font-weight: 650; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .spicey-clip-player-controls {
          position: absolute; left: 13px; right: 12px; bottom: max(10px, env(safe-area-inset-bottom)); z-index: 45;
          height: 55px; display: flex; align-items: center; gap: 10px; color: #fff;
        }
        .spicey-clip-player-controls > span { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; text-shadow: 0 2px 8px #000; }
        .spicey-clip-play { width: 36px; height: 44px; flex: 0 0 auto; display: grid; place-items: center; border: 0; color: #fff; background: transparent; filter: drop-shadow(0 2px 7px #000); }
        .spicey-clip-progress { position: relative; height: 5px; flex: 1; border-radius: 999px; background: rgba(255,255,255,.35); box-shadow: 0 2px 8px rgba(0,0,0,.5); }
        .spicey-clip-progress > div { position: absolute; inset: 0 auto 0 0; min-width: 1px; border-radius: inherit; background: linear-gradient(90deg,#ff5c12,#ff1f88); }
        .spicey-clip-progress i { position: absolute; right: -7px; top: 50%; width: 15px; height: 15px; transform: translateY(-50%); border-radius: 50%; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.7); }
        .spicey-clip-volume { width: 48px; height: 48px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; color: #fff; background: rgba(7,5,10,.52); border: 1px solid rgba(255,255,255,.17); backdrop-filter: blur(12px); }
        @media (max-width: 380px) {
          .spicey-clips-brand img { width: 36px; height: 36px; }
          .spicey-clips-brand strong, .spicey-clips-brand span { font-size: 20px; }
          .spicey-clips-tabs { gap: 20px; }
          .spicey-clip-actions { right: 9px; gap: 10px; }
          .spicey-clip-action-circle { width: 48px; height: 48px; }
          .spicey-clip-details { left: 13px; right: 68px; }
        }
      `}</style>

      <div
        className="fixed inset-y-0 bg-black overflow-hidden spicey-clips-shell"
        data-prevent-light-mode="true"
        onTouchStart={handleContainerTouchStart}
        onTouchMove={handleContainerTouchMove}
        onTouchEnd={handleContainerTouchEnd}
        onClick={() => { if (!audioUnlocked) unlockAudio(); }}
        style={{ touchAction: 'none', overscrollBehavior: 'none' }}
      >
        {/* Invisible tap zones: left/right for navigation — narrower to avoid blocking swipe */}
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-0 top-20 bottom-48"
          style={{ width: '25%', background: 'transparent', outline: 'none', border: 'none', zIndex: 10, pointerEvents: 'auto' }}
          onTouchStart={(e) => { e.stopPropagation(); }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-0 top-20 bottom-48"
          style={{ width: '25%', background: 'transparent', outline: 'none', border: 'none', zIndex: 10, pointerEvents: 'auto' }}
          onTouchStart={(e) => { e.stopPropagation(); }}
        />

        {/* Current reel — slides in smoothly on change */}
        <div className="absolute inset-0"
          style={{ animation: `${slideDir >= 0 ? 'slideInFromRight' : 'slideInFromLeft'} 0.35s ease-out` }}>

          {isYouTubeReel ? (
            /* ── YouTube fallback — official iframe embed, fully compliant ── */
            <YouTubeReelItem
              key={`yt-${reel.youtubeVideoId}-${currentIndex}`}
              video={reel}
              onVideoEnd={() => {
                setSlideDir(1);
                setCurrentIndex(i => Math.min(allReelsRef.current.length - 1, i + 1));
              }}
            />
          ) : (
            <ReelItem
              key={`reel-${reel.id}-${currentIndex}`}
              reel={reel}
              isMuted={isMuted}
              audioUnlocked={audioUnlocked}
              onMuteToggle={() => {
                if (isMuted) {
                  unlockAudio();
                } else {
                  setIsMuted(true);
                }
              }}
              currentUser={currentUser}
              liked={!!likedReels[getSpiceyReelKey(reel)]}
              likesCount={reelLikeCounts[getSpiceyReelKey(reel)] ?? reel.likes_count ?? 0}
              onLike={() => handleReelReaction(reel, 'like')}
              fired={!!firedReels[getSpiceyReelKey(reel)]}
              fireCount={reelFireCounts[getSpiceyReelKey(reel)] ?? reel.fire_count ?? 0}
              onFire={() => handleReelReaction(reel, 'fire')}
              onComment={() => setShowComments(true)}
              onShare={() => setShowShare(true)}
              onDelete={handleReelDeleted}
              following={!!followingMap[reel.author_id]}
              onFollow={() => {
                setFollowingMap(prev => ({ ...prev, [reel.author_id]: true }));
                base44.functions.invoke('toggleFollow', { target_user_id: reel.author_id }).catch(() => {});
              }}
              onVideoEnd={() => {
                setSlideDir(1);
                setCurrentIndex(i => Math.min(allReelsRef.current.length - 1, i + 1));
              }}
            />
          )}
        </div>

        <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none spicey-clips-header"
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
          <div className="flex items-center justify-between px-4 pointer-events-auto">
            <button type="button" onClick={() => navigate('/')} className="spicey-clips-brand" aria-label="Back to Spicey">
              <img src="/spicey-assets/spicey-sidebar-neon-logo.png" alt="" />
              <strong>SPICEY</strong><span>clips</span>
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigate('/explore')} className="spicey-clips-round" aria-label="Search clips"><Search className="w-5 h-5" /></button>
              <div className="spicey-clips-views"><Eye className="w-4 h-4" /><span>{allReels.length > 999 ? `${(allReels.length / 1000).toFixed(1)}K` : allReels.length}</span></div>
            </div>
          </div>
          <nav className="spicey-clips-tabs pointer-events-auto" aria-label="Spicey Clips categories">
            {['For You', 'Following', 'Trending', 'Music', 'Travel', 'Funny'].map((tab) => (
              <button type="button" key={tab} className={clipTab === tab ? 'active' : ''} onClick={() => setClipTab(tab)}>{tab}</button>
            ))}
          </nav>
        </header>

        {/* YouTube loading indicator */}
        {ytLoading && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,0,0,0.3)' }}>
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span className="text-white/80 text-xs font-semibold">Loading more videos…</span>
          </div>
        )}



        {/* Progress bar — only for photo reels (videos use natural duration, YouTube uses its own controls) */}
        {!isYouTubeReel && reel && (reel.image_url || reel.image_urls?.length > 0) && (
        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none"
          style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top) + 52px))', paddingLeft: 56, paddingRight: 16 }}>
          <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div key={currentIndex} className="h-full rounded-full"
              style={{
                background: 'linear-gradient(to right,#ff5500,#e91e8c)',
                animation: 'progressBar 4s linear forwards',
              }} />
          </div>
        </div>
        )}
        <style>{`
          @keyframes progressBar {
            from { width: 0%; }
            to   { width: 100%; }
          }
        `}</style>

        {/* First-touch sound prompt — web only, disappears after first interaction */}
        {!audioUnlocked && !(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.platform) && (
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}>
            <VolumeX className="w-4 h-4 text-white/80" />
            <span className="text-white/90 font-semibold text-xs tracking-wide">Tap screen for sound</span>
          </div>
        )}

        {/* Comments/Share only for Spicey reels — YouTube content is not claimable */}
        {!isYouTubeReel && showComments && (
          <CommentsSheet open={showComments} onClose={() => setShowComments(false)}
            post={{ id: reel.id, author_id: reel.author_id || 'stock', comments_count: reel.comments_count || 0 }} />
        )}
        {!isYouTubeReel && showShare && (
          <ShareSheet open={showShare} onClose={() => setShowShare(false)}
            post={{ id: reel.id, caption: reel.caption, author_name: reel.author_name, author_username: reel.author_username }} />
        )}
      </div>
    </>
  );
}
