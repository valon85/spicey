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
import React, { useState, useCallback, useEffect } from 'react';
import { ExternalLink, Youtube, ArrowLeft, Play } from 'lucide-react';

export default function YouTubeReelItem({ video, onBack, onVideoEnd }) {
  const [embedError, setEmbedError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const iframeRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const onVideoEndRef = React.useRef(onVideoEnd);
  const skipTimerRef = React.useRef(null);
  const playbackNudgeRef = React.useRef(null);

  useEffect(() => {
    onVideoEndRef.current = onVideoEnd;
  }, [onVideoEnd]);

  const watchOnYouTube = useCallback(() => {
    window.open(video.watchUrl, '_blank', 'noopener,noreferrer');
  }, [video.watchUrl]);

  // WKWebView uses a capacitor:// origin, which YouTube does not accept as the
  // iframe API origin. Include origin only on normal http(s) web pages.
  const embedParams = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '1',
    rel: '0',
    playsinline: '1',
    enablejsapi: '1',
    loop: '1',
    playlist: video.youtubeVideoId,
  });
  if (typeof window !== 'undefined' && /^https?:\/\//.test(window.location.origin)) {
    embedParams.set('origin', window.location.origin);
  }
  const embedSrc = `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?${embedParams.toString()}`;

  const requestPlayback = useCallback(() => {
    try {
      if (playerRef.current?.playVideo) {
        playerRef.current.mute?.();
        playerRef.current.setVolume?.(0);
        playerRef.current.playVideo();
      } else {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [0] }), '*');
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      }
    } catch {
      // The visible YouTube controls remain available if the API is still loading.
    }
  }, []);

  // Load YouTube IFrame Player API and initialize player
  useEffect(() => {
    console.log('[YouTubeReel] Setting up player for video:', video.youtubeVideoId);
    setEmbedError(false);
    setPlayerReady(false);
    setIsPlaying(false);
    setApiReady(false);
    window.clearTimeout(skipTimerRef.current);
    window.clearInterval(playbackNudgeRef.current);
    
    // Load YouTube IFrame API once. Polling avoids losing the global ready
    // callback when another player or script initialized it first.
    if (!window.YT && !document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (!iframeRef.current) return;
      
      console.log('[YouTubeReel] Initializing YouTube player');
      
      const player = new window.YT.Player(iframeRef.current, {
        events: {
          onReady: (event) => {
            console.log('[YouTubeReel] Player ready, attempting autoplay');
            setPlayerReady(true);
            // Muted autoplay is the only reliable autoplay mode in iOS WKWebView.
            event.target.mute();
            event.target.setVolume?.(0);
            event.target.playVideo();
            window.setTimeout(() => {
              event.target.mute();
              event.target.playVideo();
            }, 350);
            window.setTimeout(() => {
              event.target.mute();
              event.target.playVideo();
            }, 1100);
          },
          onStateChange: (event) => {
            // PlayerState.ENDED = 0
            if (event.data === window.YT.PlayerState.ENDED) {
              console.log('[YouTubeReel] Video ended, advancing to next');
              setIsPlaying(false);
              onVideoEndRef.current?.();
            }
            // PlayerState.PLAYING = 1
            if (event.data === window.YT.PlayerState.PLAYING) {
              console.log('[YouTubeReel] Video is playing');
              setIsPlaying(true);
            }
            if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.CUED) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
            console.error('[YouTubeReel] Player error:', event.data);
            setEmbedError(true);
          }
        }
      });
      
      playerRef.current = player;
    };

    let attempts = 0;
    const readyTimer = window.setInterval(() => {
      attempts += 1;
      if (window.YT?.Player) {
        window.clearInterval(readyTimer);
        setApiReady(true);
        initPlayer();
      } else if (attempts >= 100) {
        window.clearInterval(readyTimer);
      }
    }, 100);

    // iOS/WKWebView sometimes ignores the first iframe command until the frame
    // fully wakes up. A short muted retry makes YouTube Shorts start reliably.
    let nudgeAttempts = 0;
    playbackNudgeRef.current = window.setInterval(() => {
      nudgeAttempts += 1;
      requestPlayback();
      if (nudgeAttempts >= 8) {
        window.clearInterval(playbackNudgeRef.current);
      }
    }, 650);

    // Cleanup on unmount
    return () => {
      console.log('[YouTubeReel] Cleaning up player');
      window.clearInterval(readyTimer);
      window.clearInterval(playbackNudgeRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      window.clearTimeout(skipTimerRef.current);
    };
  }, [video.youtubeVideoId]);

  useEffect(() => {
    if (!embedError) return;
    skipTimerRef.current = window.setTimeout(() => onVideoEndRef.current?.(), 1800);
    return () => window.clearTimeout(skipTimerRef.current);
  }, [embedError, video.youtubeVideoId]);

  // Auto-advance fallback timer based on video duration
  React.useEffect(() => {
    if (!playerReady || !isPlaying) return;
    
    const duration = video.durationSeconds || 60;
    const bufferSeconds = 2;
    
    console.log(`[YouTubeReel] Starting fallback timer for ${duration}s video`);
    
    const timer = setTimeout(() => {
      console.log('[YouTubeReel] Fallback timer fired, advancing to next reel');
      onVideoEndRef.current?.();
    }, (duration + bufferSeconds) * 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [video.durationSeconds, video.youtubeVideoId, playerReady, isPlaying]);

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
          <iframe
            ref={iframeRef}
            src={embedSrc}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setEmbedError(true)}
            style={{ border: 'none', background: '#000' }}
            id={`youtube-player-${video.youtubeVideoId}`}
          />
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

      {!embedError && !isPlaying && (
        <button
          type="button"
          onClick={requestPlayback}
          className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{
            color: '#fff',
            background: 'linear-gradient(145deg, #ff6a00 0%, #ff2d8f 54%, #8b2cff 100%)',
            border: '2px solid rgba(255,255,255,0.72)',
            boxShadow: '0 18px 44px rgba(255,45,143,0.46), inset 0 2px 0 rgba(255,255,255,0.28)',
          }}
          aria-label="Play YouTube clip"
        >
          <Play className="w-8 h-8 fill-white translate-x-0.5" />
        </button>
      )}

      {!embedError && !apiReady && (
        <div
          className="absolute left-1/2 top-[58%] z-30 -translate-x-1/2 rounded-full px-3 py-1.5 text-[11px] font-bold text-white/70"
          style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
        >
          Tap play if the clip does not start
        </div>
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
