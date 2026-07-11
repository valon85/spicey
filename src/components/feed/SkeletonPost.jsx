import React from 'react';

// Pure CSS shimmer — no JS animation loop, safe on low-memory devices
const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
};

export default function SkeletonPost() {
  return (
    <div className="mb-4 px-2">
      <style>{`@keyframes skeleton-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div className="flex items-center gap-3 mb-3 px-2">
        <div className="w-10 h-10 rounded-full flex-shrink-0" style={shimmerStyle} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded w-24" style={shimmerStyle} />
          <div className="h-2.5 rounded w-16" style={{ ...shimmerStyle, opacity: 0.6 }} />
        </div>
      </div>
      <div className="w-full rounded-3xl" style={{ ...shimmerStyle, aspectRatio: '4/5' }} />
      <div className="flex gap-2 mt-3 px-2">
        <div className="h-6 rounded-full flex-1" style={shimmerStyle} />
      </div>
      <div className="flex gap-2 mt-2 px-2">
        <div className="h-8 rounded-full w-24" style={{ ...shimmerStyle, opacity: 0.7 }} />
        <div className="h-8 rounded-full w-24" style={{ ...shimmerStyle, opacity: 0.7 }} />
        <div className="h-8 rounded-full w-24" style={{ ...shimmerStyle, opacity: 0.7 }} />
      </div>
      <div className="h-px mx-4 mt-3" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}