import React, { useState, useRef, useCallback, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];

/**
 * PostCarousel — Multi-photo carousel (slides only, no dots).
 * Returns current index via ref for parent to show dots.
 */
const PostCarousel = React.forwardRef(({ images, onDoubleTap, onIndexChange }, ref) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const safeImages = asArray(images);
  const total = safeImages.length;

  const prev = useCallback(() => {
    const newIdx = Math.max(0, index - 1);
    setIndex(newIdx);
    onIndexChange?.(newIdx);
  }, [index, onIndexChange]);

  const next = useCallback(() => {
    const newIdx = Math.min(total - 1, index + 1);
    setIndex(newIdx);
    onIndexChange?.(newIdx);
  }, [index, total, onIndexChange]);

  useImperativeHandle(ref, () => ({ index }), [index]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) isDragging.current = true;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isDragging.current) {
      if (dx < -40) next();
      else if (dx > 40) prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  // Double tap = open reel viewer, single tap = next photo
  const lastTapRef = useRef(0);
  const singleTapTimerRef = useRef(null);
  const handleTap = (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap — open photo reel viewer
      clearTimeout(singleTapTimerRef.current);
      lastTapRef.current = 0;
      onDoubleTap?.();
    } else {
      lastTapRef.current = now;
      clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = setTimeout(() => {
        // Single tap confirmed — go to next photo
        setIndex(prev => {
          const newIdx = prev < total - 1 ? prev + 1 : 0;
          onIndexChange?.(newIdx);
          return newIdx;
        });
      }, 310);
    }
  };

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: '4/5', background: '#000', overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={handleTap}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {safeImages.map((url, i) => (
          <div key={i} className="h-full flex-shrink-0" style={{ width: '100%', minWidth: '100%', background: '#000', position: 'relative', overflow: 'hidden' }}>
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="spicey-wow-photo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'relative', zIndex: 1 }}
              draggable={false}
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                if (parent && !parent.querySelector('.img-err')) {
                  const d = document.createElement('div');
                  d.className = 'img-err';
                  d.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:13px;background:#000;';
                  d.textContent = 'Image unavailable';
                  parent.appendChild(d);
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark gradient — inside carousel at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, transparent 80%)' }} />


      {/* Dots — inside carousel at bottom */}
      {total > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20">
          {safeImages.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIndex(i); onIndexChange?.(i); }}
              style={{
                transition: 'all 0.3s ease',
                borderRadius: 9999,
                width: i === index ? 8 : 6,
                height: i === index ? 8 : 6,
                background: i === index
                  ? 'linear-gradient(90deg, #ff5500, #a733ff)'
                  : 'rgba(255,255,255,0.5)',
                boxShadow: i === index
                  ? '0 0 8px rgba(255,85,0,0.7), 0 0 16px rgba(167,51,255,0.5)'
                  : 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}


    </div>
  );
});

PostCarousel.displayName = 'PostCarousel';
export default PostCarousel;
