import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import CommentsSheet from '@/components/feed/CommentsSheet';
import ShareSheet from '@/components/panels/ShareSheet';
import DeleteConfirmSheet from '@/components/shared/DeleteConfirmSheet';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SpiceyReelPlayer({ 
  reel, 
  isActive, 
  isMuted, 
  onToggleMute, 
  onNext,
  onLike,
  onComment,
  onShare,
  onDelete,
  currentUser,
}) {
  const videoRef = useRef(null);
  const musicRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const lastTapRef = useRef(null);

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

  // Load HLS.js dynamically for Cloudflare Stream URLs on non-Safari browsers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    setLoaded(false);
    video.muted = isMuted;
    video.volume = 1.0;

    const src = reel.video_url;
    if (!src) { setLoaded(true); return; }

    const isHLS = src.includes('.m3u8') || src.includes('manifest/video');

    // Manual loop handler — needed because HLS streams don't always honor `loop` attr
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    video.addEventListener('ended', handleEnded);

    const playVideo = async () => {
      try {
        video.muted = isMuted;
        await video.play();
        setPlaying(true);
        setLoaded(true);
      } catch (err) {
        // Autoplay blocked — unmute and retry once
        if (err.name === 'NotAllowedError') {
          video.muted = true;
          try { await video.play(); setPlaying(true); } catch {}
        }
        setLoaded(true);
      }
    };

    if (isHLS && !video.canPlayType('application/vnd.apple.mpegurl')) {
      // Chrome/Android — load hls.js dynamically
      import('https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js').then((mod) => {
        const Hls = mod.default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            autoStartLoad: true,
            startLevel: -1,
            enableWorker: true,
            lowLatencyMode: false,
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => playVideo());
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) {
              console.warn('[SpiceyReel] HLS fatal error, falling back to src=', data.type);
              hls.destroy();
              video._hls = null;
              video.src = src;
              video.load();
              playVideo();
            }
          });
          video._hls = hls;
        } else {
          video.src = src;
          video.load();
          playVideo();
        }
      }).catch(() => {
        video.src = src;
        video.load();
        playVideo();
      });
    } else {
      // Safari/iOS supports HLS natively; also handles plain mp4/webm
      video.src = src;
      video.load();
      playVideo();
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
      if (video._hls) { video._hls.destroy(); video._hls = null; }
      video.pause();
      video.src = '';
      setPlaying(false);
      setLoaded(false);
    };
  }, [isActive, reel.id, reel.video_url]);

  // Background music for reels that have music_preview_url
  useEffect(() => {
    if (!isActive || !reel.music_preview_url) return;
    const audio = new Audio(reel.music_preview_url);
    audio.loop = true;
    audio.volume = 0.45;
    audio.muted = isMuted;
    musicRef.current = audio;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.src = '';
      musicRef.current = null;
    };
  }, [isActive, reel.id, reel.music_preview_url]);

  // Sync music mute with video mute
  useEffect(() => {
    if (musicRef.current) musicRef.current.muted = isMuted;
  }, [isMuted]);

  // Sync mute state
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  // Handle play/pause
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().then(() => {
        setPlaying(true);
      }).catch(() => {});
    }
  };

  // Double tap to like
  const handleDoubleTap = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < 300) {
      if (!liked) {
        setLiked(true);
        if (onLike) onLike(reel);
      }
    }
    lastTapRef.current = now;
  };

  // Single tap = play/pause
  const handleSingleTap = (e) => {
    e.stopPropagation();
    handlePlayPause();
  };

  // Touch handling for double tap
  const handleTouchStart = (e) => {
    lastTapRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (!lastTapRef.current) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };
    
    const timeDiff = touchEnd.time - lastTapRef.current.time;
    const xDiff = Math.abs(touchEnd.x - lastTapRef.current.x);
    const yDiff = Math.abs(touchEnd.y - lastTapRef.current.y);
    
    if (timeDiff < 300 && xDiff < 10 && yDiff < 10) {
      handleDoubleTap(e);
    }
    
    lastTapRef.current = null;
  };

  // Like handler
  const handleLike = async () => {
    setLiked(!liked);
    if (onLike) onLike(reel);
  };

  // Comment handler
  const handleComment = () => {
    if (onComment) onComment(reel);
    setShowComments(true);
  };

  // Share handler
  const handleShare = () => {
    if (onShare) onShare(reel);
    setShowShare(true);
  };

  return (
    <>
      <div className="relative w-full h-full bg-black">
        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          loop
          playsInline
          webkit-playsinline="true"
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            e.stopPropagation();
            handleSingleTap(e);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />



        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%, transparent 70%, rgba(0,0,0,0.4) 100%)' }}
        />

        {/* ⋯ Owner menu button — top right */}
        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Owner action menu */}
        {showMenu && (
          <div className="absolute inset-0 z-40 flex items-end" onClick={() => setShowMenu(false)}>
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

        {/* Author info */}
        <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {reel.author_avatar ? (
                <img src={reel.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (reel.author_name || 'S')[0].toUpperCase()
              )}
            </div>
            <div>
              <span className="text-white font-bold text-sm drop-shadow block">
                @{reel.author_username || reel.author_name || 'user'}
              </span>
              {reel.caption && (
                <p className="text-white/90 text-xs leading-snug line-clamp-2 drop-shadow mt-0.5">
                  {reel.caption}
                </p>
              )}
            </div>
          </div>
          {reel.music_title && (
            <div className="flex items-center gap-1.5 max-w-[220px]"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 12px 4px 8px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ fontSize: 12 }}>🎵</span>
              <span className="text-white text-[11px] font-semibold truncate">{reel.music_title}</span>
              {reel.music_artist && <span className="text-white/60 text-[10px] truncate">· {reel.music_artist}</span>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute right-3 z-20 flex flex-col items-center gap-5"
          style={{ bottom: 'max(5rem, env(safe-area-inset-bottom) + 4rem)' }}>
          
          {/* Sound Toggle */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onToggleMute(); 
            }} 
            className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
          >
            <div className={`w-13 h-13 rounded-full flex items-center justify-center transition-all border-2 ${
              isMuted 
                ? 'bg-gray-900/70 border-white/20' 
                : 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 border-white/40'
            }`} style={{
              boxShadow: isMuted 
                ? '0 4px 16px rgba(0,0,0,0.5)' 
                : '0 0 28px rgba(255,85,0,0.7), 0 0 56px rgba(233,30,140,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}>
              {isMuted ? (
                <VolumeX className="w-7 h-7 text-white drop-shadow-lg" />
              ) : (
                <Volume2 className="w-7 h-7 text-white drop-shadow-lg" />
              )}
            </div>
            <span className="text-xs font-extrabold drop-shadow-lg tracking-wide text-white">
              {isMuted ? 'Muted' : 'Sound'}
            </span>
          </button>
          
          {/* Like */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleLike(); 
            }} 
            className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
          >
            <div className={`w-13 h-13 rounded-full flex items-center justify-center transition-all border-2 ${
              liked 
                ? 'bg-gradient-to-br from-pink-500 via-red-500 to-orange-400 border-white/40' 
                : 'bg-gray-900/70 border-white/20'
            }`} style={{
              boxShadow: liked 
                ? '0 0 28px rgba(233,30,140,0.8), 0 0 56px rgba(255,85,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
                : '0 4px 16px rgba(0,0,0,0.5)'
            }}>
              <Heart 
                className={`w-7 h-7 transition-colors drop-shadow-lg ${
                  liked ? 'text-white fill-white' : 'text-white'
                }`} 
              />
            </div>
            <span className="text-xs font-extrabold drop-shadow-lg tracking-wide text-white">
              {reel.likes_count > 0 ? reel.likes_count : 'Like'}
            </span>
          </button>
          
          {/* Comment */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleComment(); 
            }} 
            className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 border-2 border-white/40 flex items-center justify-center"
              style={{ boxShadow: '0 0 28px rgba(139,92,246,0.7), 0 0 56px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-xs font-extrabold drop-shadow-lg tracking-wide">
              {reel.comments_count > 0 ? reel.comments_count : 'Chat'}
            </span>
          </button>
          
          {/* Share */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleShare(); 
            }} 
            className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 border-2 border-white/40 flex items-center justify-center"
              style={{ boxShadow: '0 0 28px rgba(255,165,0,0.7), 0 0 56px rgba(255,85,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <span className="text-white text-xs font-extrabold drop-shadow-lg tracking-wide">
              Share
            </span>
          </button>
        </div>
      </div>

      {/* Comments Panel */}
      {reel.is_curated || reel.is_stock ? (
        <CommentsSheet
          open={showComments}
          onClose={() => setShowComments(false)}
          post={{
            id: reel.id,
            author_id: 'stock',
            comments_count: reel.comments_count || 0,
          }}
        />
      ) : (
        <CommentsSheet
          open={showComments}
          onClose={() => setShowComments(false)}
          post={{
            id: reel.id,
            author_id: reel.author_id,
            comments_count: reel.comments_count || 0,
          }}
        />
      )}

      {/* Share Sheet */}
      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        post={{
          id: reel.id,
          caption: reel.caption,
          author_name: reel.author_name,
          author_username: reel.author_username,
        }}
      />

      {/* Delete confirmation */}
      <DeleteConfirmSheet
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this Reel?"
        description="This reel will be permanently removed. This cannot be undone."
      />
    </>
  );
}