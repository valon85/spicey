import React, { useEffect, useState, useRef } from 'react';

export default function ReelProgressBar({ videoRef, isActive }) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isActive) { setProgress(0); return; }

    const tick = () => {
      try {
        const v = videoRef?.current;
        if (v && v.duration && !isNaN(v.duration)) {
          setProgress((v.currentTime / v.duration) * 100);
        }
      } catch (e) {
        console.log('[ProgressBar] Error:', e);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, videoRef]);

  return (
    <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
      <div
        className="h-full rounded-full transition-none"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(to right, #ff5500, #e91e8c)',
          boxShadow: '0 0 6px rgba(255,80,0,0.8)',
        }}
      />
    </div>
  );
}