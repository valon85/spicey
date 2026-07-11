import React, { useEffect, useRef } from 'react';

export default function VideoWithHLS({ src, className, style, autoPlay, loop, muted, onDoubleClick }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const loadHLS = async () => {
      // Check if native HLS support (Safari)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }

      // Load hls.js for other browsers
      if (!window.Hls) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.7/dist/hls.min.js';
        script.onload = () => initHLS();
        document.head.appendChild(script);
      } else {
        initHLS();
      }

      function initHLS() {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 0,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(() => {});
        });
      }
    };

    loadHLS();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted ?? false;
    }
  }, [muted]);

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      autoPlay={autoPlay}
      loop={loop}
      playsInline
      muted={muted}
      onDoubleClick={onDoubleClick}
    />
  );
}