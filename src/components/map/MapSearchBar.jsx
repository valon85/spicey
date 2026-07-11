import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Building2, Trees, Coffee, Wine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const TYPE_ICONS = {
  place: MapPin,
  locality: MapPin,
  neighborhood: MapPin,
  address: MapPin,
  poi: Building2,
  restaurant: Coffee,
  bar: Wine,
  park: Trees,
};

function getIcon(result) {
  const text = (result.place_type?.[0] || '') + ' ' + (result.properties?.category || '');
  if (/restaurant|food|cafe|coffee/i.test(text)) return Coffee;
  if (/bar|pub|nightclub|drink/i.test(text)) return Wine;
  if (/park|garden|nature|forest/i.test(text)) return Trees;
  return TYPE_ICONS[result.place_type?.[0]] || MapPin;
}

const isLightMode = () => typeof document !== 'undefined' && document.documentElement.classList.contains('light-mode');

export default function MapSearchBar({ mapRef, onResultSelect }) {
  const [isLight, setIsLight] = React.useState(isLightMode);

  React.useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        if (!MAPBOX_TOKEN) {
          setResults([]);
          return;
        }

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=6&types=place,locality,neighborhood,address,poi&language=en`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.features || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (result) => {
    const [lng, lat] = result.center;
    const isCity = ['place', 'locality', 'region'].includes(result.place_type?.[0]);
    const zoom = isCity ? 12 : 15;

    if (mapRef?.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom,
        pitch: 45,
        speed: 1.4,
        curve: 1.4,
      });
    }

    setQuery(result.place_name || result.text || '');
    setResults([]);
    setFocused(false);
    onResultSelect?.({ name: result.text, place_name: result.place_name, lat, lng });
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: 'relative', zIndex: 50 }}>
      {/* Search input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: isLight
          ? 'linear-gradient(135deg, rgba(255,240,245,0.95) 0%, rgba(255,220,235,0.9) 50%, rgba(245,220,255,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(160,32,240,0.15), rgba(233,30,140,0.15), rgba(255,107,0,0.15))',
        border: isLight
          ? '1.5px solid rgba(255,150,180,0.5)'
          : '1.5px solid transparent',
        backgroundClip: 'padding-box',
        borderRadius: 16,
        padding: '10px 14px',
        backdropFilter: 'blur(20px)',
        boxShadow: isLight
          ? '0 4px 24px rgba(255,107,53,0.15), 0 1px 6px rgba(233,30,140,0.1), inset 0 1px 3px rgba(255,255,255,0.8)'
          : '0 4px 12px rgba(160,32,240,0.3), inset 0 0 20px rgba(233,30,140,0.1)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}>
        {/* Gradient border — only in dark mode */}
        {!isLight && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            padding: '1.5px',
            background: 'linear-gradient(135deg, #A020F0, #E91E8C, #FF6B00)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }} />
        )}
        <Search style={{
          width: 16, height: 16, flexShrink: 0,
          color: isLight ? '#e91e8c' : 'rgba(255,255,255,0.6)',
        }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search cities, restaurants, parks…"
          className={`map-search-input${isLight ? ' map-search-input-light' : ''}`}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            color: isLight ? '#1a0a2e' : '#ffffff',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: '-apple-system, sans-serif',
          }}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={clear}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <X style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.7)' }} />
            </motion.button>
          )}
        </AnimatePresence>
        {loading && (
          <div style={{
            width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
            border: '2px solid rgba(160,32,240,0.3)',
            borderTopColor: '#d946ef',
            animation: 'map-search-spin 0.7s linear infinite',
          }} />
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {results.length > 0 && focused && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(12, 3, 25, 0.98)',
              border: '1px solid rgba(160,32,240,0.4)',
              borderRadius: 16,
              overflow: 'hidden',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(160,32,240,0.2)',
            }}
          >
            {/* Top gradient bar */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, #FF6B00, #FF4FD8, #A020F0)' }} />

            {results.map((result, i) => {
              const Icon = getIcon(result);
              const mainText = result.text || result.place_name;
              const subText = result.place_name?.replace(mainText + ', ', '') || '';
              return (
                <button
                  key={result.id || i}
                  onMouseDown={() => handleSelect(result)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: i < results.length - 1 ? '1px solid rgba(160,32,240,0.12)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(160,32,240,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(160,32,240,0.25), rgba(255,80,0,0.15))',
                    border: '1px solid rgba(160,32,240,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: 16, height: 16, color: '#d946ef' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, margin: 0, fontFamily: '-apple-system, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mainText}
                    </p>
                    {subText && (
                      <p style={{ color: 'rgba(180,130,255,0.55)', fontSize: 11, margin: '2px 0 0', fontFamily: '-apple-system, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {subText}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes map-search-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .map-search-input {
          background: transparent !important;
          background-color: transparent !important;
          -webkit-box-shadow: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }
        .map-search-input:-webkit-autofill,
        .map-search-input:-webkit-autofill:hover,
        .map-search-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(30, 5, 50, 0.01) inset !important;
          box-shadow: 0 0 0px 1000px rgba(30, 5, 50, 0.01) inset !important;
          -webkit-text-fill-color: #ffffff !important;
          background-color: transparent !important;
          transition: background-color 5000s ease-in-out 0s !important;
          color: #ffffff !important;
        }
        .light-mode .map-search-input:-webkit-autofill,
        .light-mode .map-search-input:-webkit-autofill:hover,
        .light-mode .map-search-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 240, 255, 0.01) inset !important;
          box-shadow: 0 0 0px 1000px rgba(255, 240, 255, 0.01) inset !important;
          -webkit-text-fill-color: #1a0a2e !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        .map-search-input::placeholder {
          color: rgba(255,255,255,0.45) !important;
        }
        .light-mode .map-search-input::placeholder {
          color: rgba(100,40,140,0.5) !important;
        }
      `}</style>
    </div>
  );
}
