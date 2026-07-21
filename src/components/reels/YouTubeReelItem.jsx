/**
 * YouTubeReelItem
 *
 * COMPLIANCE NOTICE:
 * - YouTube videos are embedded ONLY via the official YouTube iframe player.
 * - No YouTube video files are downloaded, stored, modified, or re-hosted.
 * - YouTube branding, controls, channel attribution, and "Watch on YouTube" link
 *   are always shown — they must never be hidden or removed.
 * - Users cannot claim, edit, repost, or download YouTube content from Spicey.
 * - Compliant with YouTube API Services Terms of Service:
 *   https://developers.google.com/youtube/terms/api-services-tos
 */
import React, { useState, useCallback, useEffect, useId, useRef } from 'react';
import { ExternalLink, Youtube, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

export default function YouTubeReelItem({ video, onBack, onVideoEnd, onVideoUnavailable }) {
  const [embedError, setEmbedError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('spicey-youtube-sound') === 'on');
  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);
  const unavailableTimerRef = useRef(null);
  const soundEnabledRef = useRef(soundEnabled);
  const playerId = `youtube-player-${useId().replace(/:/g, '')}`;

  const watchOnYouTube = useCallback(() => {
    window.open(video.watchUrl, '_blank', 'noopener,noreferrer');
  }, [video.watchUrl]);

  const toggleSound = useCallback(() => {
    const nextEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = nextEnabled;
    setSoundEnabled(nextEnabled);
    localStorage.setItem('spicey-youtube-sound', nextEnabled ? 'on' : 'off');
    const player = playerRef.current;
    if (!player) return;
    if (nextEnabled) {
      player.unMute?.();
      player.setVolume?.(100);
      player.playVideo?.();
    } else {
      player.mute?.();
    }
  }, []);

  // Load YouTube IFrame Player API and initialize player
  useEffect(() => {
    let cancelled = false;
    console.log('[YouTubeReel] Setting up player for video:', video.youtubeVideoId);
    
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (cancelled || !playerContainerRef.current || !window.YT?.Player) return;
      
      console.log('[YouTubeReel] Initializing YouTube player');
      
      const player = new window.YT.Player(playerId, {
        host: 'https://www.youtube-nocookie.com',
        videoId: video.youtubeVideoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: 'https://spicey.live',
        },
        events: {
          onReady: (event) => {
            console.log('[YouTubeReel] Player ready, attempting autoplay');
            setPlayerReady(true);
            // Try to play - muted for autoplay policy
            event.target.playVideo();
            event.target.setVolume(100);
            if (soundEnabledRef.current) event.target.unMute();
          },
          onStateChange: (event) => {
            // PlayerState.ENDED = 0
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log('[YouTubeReel] Video ended, advancing to next');
              onVideoEnd?.();
            }
            // PlayerState.PLAYING = 1
            if (event.data === window.YT.PlayerState.PLAYING) {
              console.log('[YouTubeReel] Video is playing');
              if (soundEnabledRef.current) {
                player.unMute?.();
                player.setVolume?.(100);
              }
            }
          },
          onError: (event) => {
            console.error('[YouTubeReel] Player error:', event.data);
            setEmbedError(true);
            unavailableTimerRef.current = setTimeout(() => {
              onVideoUnavailable?.(video.youtubeVideoId, event.data);
            }, 1200);
          }
        }
      });
      
      playerRef.current = player;
    };

    // Wait for YT API to be ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        console.log('[YouTubeReel] YouTube API ready');
        initPlayer();
      };
    }

    // Cleanup on unmount
    return () => {
      cancelled = true;
      clearTimeout(unavailableTimerRef.current);
      console.log('[YouTubeReel] Cleaning up player');
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [video.youtubeVideoId, onVideoEnd, onVideoUnavailable, playerId]);

  // Auto-advance fallback timer based on video duration
  React.useEffect(() => {
    if (!onVideoEnd || !playerReady) return;
    
    const duration = video.durationSeconds || 60;
    const bufferSeconds = 2;
    
    console.log(`[YouTubeReel] Starting fallback timer for ${duration}s video`);
    
    const timer = setTimeout(() => {
      console.log('[YouTubeReel] Fallback timer fired, advancing to next reel');
      onVideoEnd();
    }, (duration + bufferSeconds) * 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [onVideoEnd, video.durationSeconds, video.youtubeVideoId, playerReady]);

  return (
    <div className="relative bg-black w-full h-full flex flex-col" data-prevent-light-mode="true">

      {/* Back button — top left only */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-0 left-4 z-40 w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ top: 'max(12px, env(safe-area-inset-top))', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* ── Official YouTube Iframe Player ── */}
      <div className="absolute inset-0">
        {!embedError ? (
          <div ref={playerContainerRef} id={playerId} className="w-full h-full" />
        ) : (
          /* Embed blocked / unavailable fallback */
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-8 text-center"
            style={{ background: '#0f0f0f' }}>
            {video.thumbnailUrl && (
              <img src={video.thumbnailUrl} alt={video.title} className="w-48 rounded-xl mb-2 object-cover" style={{ aspectRatio: '16/9' }} />
            )}
            <p className="text-white/70 text-sm font-medium px-4">{video.title}</p>
            <p className="text-white/40 text-xs">This video cannot be embedded here.</p>
            <button
              onClick={watchOnYouTube}
              className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white"
              style={{ background: '#FF0000', boxShadow: '0 4px 16px rgba(255,0,0,0.4)' }}>
              <Youtube className="w-4 h-4" />
              Watch on YouTube
            </button>
          </div>
        )}
      </div>

      {/* iOS requires a real user gesture before autoplay audio can be enabled. */}
      {!embedError && (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute z-50 right-4 flex items-center gap-2 rounded-full px-3 py-2 text-white font-semibold active:scale-95 transition-transform"
          style={{
            top: 'max(66px, calc(env(safe-area-inset-top) + 54px))',
            background: soundEnabled ? 'rgba(236,72,153,0.9)' : 'rgba(0,0,0,0.72)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
          }}
          aria-label={soundEnabled ? 'Mute YouTube video' : 'Turn on YouTube sound'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <span className="text-xs">{soundEnabled ? 'Sound on' : 'Tap for sound'}</span>
        </button>
      )}



      {/* ── Bottom attribution bar — REQUIRED by YouTube ToS, must NOT be removed ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-16"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        {/* Creator attribution — required */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Source label */}
            <div className="flex items-center gap-1.5 mb-1">
              <Youtube className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FF0000' }} />
              <span className="text-white/60 text-[11px] font-semibold tracking-wide uppercase">Source: YouTube</span>
            </div>
            {/* Creator / Channel name */}
            <p className="text-white font-bold text-sm leading-tight" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
              {video.channelName}
            </p>
            {/* Video title */}
            <p className="text-white/70 text-xs mt-0.5 line-clamp-2" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
              {video.title}
            </p>
          </div>

          {/* Watch on YouTube button — required, must always be visible */}
          <button
            onClick={watchOnYouTube}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-white active:scale-95 transition-transform flex-shrink-0"
            style={{
              background: '#FF0000',
              boxShadow: '0 2px 12px rgba(255,0,0,0.5)',
              pointerEvents: 'auto',
            }}>
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[12px]">Watch on YouTube</span>
          </button>
        </div>

        {/* Spicey does not own this content — disclosure */}
        <p className="text-white/30 text-[10px] mt-2" style={{ pointerEvents: 'none' }}>
          Content by {video.channelName} on YouTube · Not uploaded by Spicey
        </p>
      </div>
    </div>
  );
}
