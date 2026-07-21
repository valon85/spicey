import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Heart, MessageCircle, Share2, Volume2, VolumeX,
  Loader2, AlertCircle, Plus, Flame, MoreVertical, Trash2, Youtube
} from 'lucide-react';
import SideAction from '@/components/feed/SideAction';
import CommentsSheet from '@/components/feed/CommentsSheet';
import ShareSheet from '@/components/panels/ShareSheet';
import DeleteConfirmSheet from '@/components/shared/DeleteConfirmSheet';
import YouTubeReelItem from '@/components/reels/YouTubeReelItem';
import { toast } from 'sonner';

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
  liked, onLike, fired, onFire,
  onComment, onShare, onDelete, onVideoEnd,
}) {
  const videoRef = useRef(null);
  const musicRef = useRef(null);
  const [loadState, setLoadState] = useState('loading');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const isOwner = currentUser && (currentUser.id === reel.author_id || currentUser.role === 'admin');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.Post.delete(reel.id);
      toast.success('Reel deleted');
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

  const avatarSrc = reel.author_avatar
    || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face';

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
              <Trash2 className="w-5 h-5" /> Delete Reel
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
        title="Delete this Reel?"
        description="This reel will be permanently removed. This cannot be undone."
      />

      {/* Mute button — show for ALL post types */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMuteToggle(); }}
        onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className="absolute right-4 z-40 active:scale-125 transition-transform duration-150"
        style={{ top: 'calc(max(12px, env(safe-area-inset-top)) + 56px)' }}
      >
        {isMuted
          ? <VolumeX className="w-7 h-7 text-white/60" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))' }} />
          : <Volume2 className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))' }} />}
      </button>

      {/* Video duration badge */}
      {!isPhoto && videoDuration > 0 && (
        <div className="absolute bottom-4 right-4 z-40 px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span className="text-white text-xs font-bold">
            {Math.floor(videoDuration)}s
          </span>
        </div>
      )}

      {/* Right actions */}
      <div className="absolute right-3 z-40 flex flex-col items-center gap-6"
        style={{ bottom: 'max(2rem, env(safe-area-inset-bottom) + 1.5rem)' }}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full p-[2.5px]"
            style={{ background: 'conic-gradient(from 0deg,#ff5500,#e91e8c,#7700bb,#ff5500)', boxShadow: '0 0 20px rgba(255,80,0,0.6)' }}>
            <img src={avatarSrc} alt="" className="w-full h-full rounded-full object-cover border-[3px] border-black" />
          </div>
          {!following && reel.author_id !== currentUser?.id && (
            <button onClick={(e) => { e.stopPropagation(); onFollow(); }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10 active:scale-90 transition-transform"
              style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 12px rgba(255,80,0,0.8)' }}>
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SideAction icon={Heart} count={reel.likes_count || 0} onClick={onLike} active={liked} type="heart" />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SideAction icon={Flame} count={reel.fire_count || 0} onClick={onFire} active={fired} type="fire" />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SideAction icon={MessageCircle} count={reel.comments_count || 0} onClick={onComment} active={false} type="comment" />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SideAction icon={Share2} count={reel.shares_count || 0} onClick={onShare} active={false} type="share" />
        </div>
      </div>

      {/* Bottom info — caption, location, music */}
      <div className="absolute left-4 right-20 z-40 pointer-events-none"
        style={{ bottom: 'calc(max(2rem, env(safe-area-inset-bottom) + 1.5rem) + 200px)' }}>
        <p className="font-bold text-sm" style={{ color: '#ffffff', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
           @{reel.author_username || reel.author_name || 'user'}
        </p>
        {reel.caption && (
          <p className="text-xs leading-snug line-clamp-3 mt-0.5" style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{reel.caption}</p>
        )}
        {reel.location && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px]">📍</span>
            <p className="text-white/80 text-[11px]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{reel.location}</p>
          </div>
        )}
        {reel.music_title && (
          <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full w-fit"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', animation: 'spin 2s linear infinite' }} />
            <p className="text-white text-[11px] font-semibold truncate" style={{ maxWidth: 160 }}>
              {reel.music_title}{reel.music_artist ? ` · ${reel.music_artist}` : ''}
            </p>
          </div>
        )}
      </div>
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
  const [followingMap, setFollowingMap] = useState({});
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
      const res = await base44.functions.invoke('getYouTubeReels', {});
      const videos = res?.data?.videos || [];
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
  // Combined feed: real Spicey reels first, then YouTube fallback
  const allReels = [
    ...spiceyReels.map(r => ({ ...r, _source: 'spicey' })),
    ...youtubeVideos.map(v => ({ ...v, id: `yt_${v.youtubeVideoId}`, _source: 'youtube' })),
  ];
  const allReelsRef = useRef([]);
  allReelsRef.current = allReels;

  const spiceyCount = spiceyReels.length;
  const ytCount = youtubeVideos.length;

  // Keep the selected reel valid if an unavailable YouTube result is removed.
  useEffect(() => {
    setCurrentIndex((index) => Math.max(0, Math.min(index, allReelsRef.current.length - 1)));
  }, [allReels.length]);

  const handleYouTubeUnavailable = useCallback((videoId, errorCode) => {
    console.warn('[SpiceyReels] Removing unavailable YouTube video:', videoId, errorCode);
    setYoutubeVideos((videos) => videos.filter((video) => video.youtubeVideoId !== videoId));
  }, []);

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
      <p className="text-white/60 text-sm">Loading Reels…</p>
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
      <p className="text-white/60 text-lg font-semibold">No reels available</p>
      <p className="text-white/35 text-sm">Be the first to post a reel!</p>
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
      `}</style>

      <div
        className="fixed inset-0 bg-black overflow-hidden"
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
              onBack={() => navigate('/')}
              onVideoEnd={() => {
                setSlideDir(1);
                setCurrentIndex(i => Math.min(allReelsRef.current.length - 1, i + 1));
              }}
              onVideoUnavailable={handleYouTubeUnavailable}
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
              liked={!!likedReels[reel.id]}
              onLike={() => setLikedReels(prev => ({ ...prev, [reel.id]: !prev[reel.id] }))}
              fired={!!firedReels[reel.id]}
              onFire={() => setFiredReels(prev => ({ ...prev, [reel.id]: !prev[reel.id] }))}
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

        {/* Header — only show for Spicey reels (YouTube item has its own header) */}
        {!isYouTubeReel && (
        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none"
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
          <div className="flex items-center justify-between px-4 pb-2 pointer-events-auto">
            <button
              onClick={() => navigate('/')}
              className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-base tracking-widest">REELS</h1>
              {/* Spicey badge for user-uploaded content */}
              <div className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                Spicey
              </div>
            </div>
            <div className="w-11" />
          </div>
        </div>
        )}

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
