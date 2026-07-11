import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

// Global cache — URLs that have already been loaded stay "pre-loaded"
// so re-mounting the component (page navigation) never shows the flash again
const loadedUrls = new Set();

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  style,
  onLoad,
  isAvatar = false 
}) {
  const alreadyLoaded = src && loadedUrls.has(src);
  const [loaded, setLoaded] = useState(alreadyLoaded);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    if (src) loadedUrls.add(src);
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
  };

  if (isAvatar) {
    const initials = alt?.charAt(0).toUpperCase() || 'U';
    return (
      <>
        {!loaded && !error && (
          <div className={`${className} bg-gradient-to-br from-orange-500/20 to-pink-500/20 animate-pulse flex items-center justify-center`}>
            <ImageIcon className="w-6 h-6 text-white/20" />
          </div>
        )}
        {error ? (
          <div className={`${className} bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            <span className="text-white font-bold text-lg relative z-10">{initials}</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={`${className} ${!loaded ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-150`}
            style={style}
            onLoad={handleLoad}
            onError={handleError}
            loading="eager"
            decoding="async"
          />
        )}
      </>
    );
  }

  return (
    <>
      {!loaded && !error && (
        <div className={`${className} bg-white/5 animate-pulse flex items-center justify-center`}>
          <ImageIcon className="w-8 h-8 text-white/10" />
        </div>
      )}
      {error ? (
        <div className={`${className} bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-500/10" />
          </div>
          <ImageIcon className="w-12 h-12 text-white/20 relative z-10" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} ${!loaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150`}
          onLoad={handleLoad}
          onError={handleError}
          loading="eager"
          decoding="async"
        />
      )}
    </>
  );
}