import React from 'react';

/**
 * EffectOverlay — Professional camera effect overlays.
 * These enhance the image with lighting, cinematic grades, and glow effects
 * rather than placing stickers or particles.
 * All pointer-events: none so they never block camera controls.
 */
export default function EffectOverlay({ type }) {
  if (!type) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 12 }}>
      <style>{`
        @keyframes eff-leak { 0%{opacity:0;transform:translateX(-40%) skewX(-8deg)} 20%{opacity:.65} 80%{opacity:.65} 100%{opacity:0;transform:translateX(140%) skewX(-8deg)} }
        @keyframes eff-pulse { 0%,100%{opacity:.55} 50%{opacity:.85} }
        @keyframes eff-neon  { 0%{filter:hue-rotate(0deg) drop-shadow(0 0 12px #e91e8c)} 50%{filter:hue-rotate(30deg) drop-shadow(0 0 22px #a733ff)} 100%{filter:hue-rotate(0deg) drop-shadow(0 0 12px #e91e8c)} }
        @keyframes eff-glow  { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.75;transform:scale(1.05)} }
        @keyframes eff-drift { 0%,100%{transform:translate(0,0)} 33%{transform:translate(12px,-10px)} 66%{transform:translate(-8px,14px)} }
      `}</style>

      {/* ── CINEMATIC — letterbox bars + subtle warm grade ── */}
      {type === 'cinematic' && (
        <>
          <div className="absolute inset-x-0 top-0" style={{ height: '10%', background: 'rgba(0,0,0,0.82)' }} />
          <div className="absolute inset-x-0 bottom-0" style={{ height: '10%', background: 'rgba(0,0,0,0.82)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(180,100,20,0.12) 0%, transparent 50%, rgba(120,60,0,0.1) 100%)' }} />
        </>
      )}

      {/* ── LIGHT LEAK — cinematic warm color sweep ── */}
      {type === 'lightleak' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0" style={{
            left: '-50%', right: '-50%',
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,140,30,0.55) 40%, rgba(255,80,180,0.45) 55%, rgba(120,40,255,0.3) 70%, transparent 85%)',
            animation: 'eff-leak 7s ease-in-out infinite',
          }} />
        </div>
      )}

      {/* ── SUNSET GLOW — warm orange/pink from bottom corners ── */}
      {type === 'sunsetglow' && (
        <>
          <div className="absolute inset-x-0 bottom-0" style={{ height: '45%', background: 'linear-gradient(to top, rgba(255,80,20,0.38), rgba(255,150,40,0.22), transparent)', animation: 'eff-pulse 4s ease-in-out infinite' }} />
          <div className="absolute inset-y-0 left-0" style={{ width: '30%', background: 'linear-gradient(to right, rgba(255,100,0,0.2), transparent)' }} />
          <div className="absolute inset-y-0 right-0" style={{ width: '30%', background: 'linear-gradient(to left, rgba(200,60,40,0.18), transparent)' }} />
        </>
      )}

      {/* ── NEON EDGE — animated neon border glow ── */}
      {type === 'neonedge' && (
        <div className="absolute inset-0" style={{
          boxShadow: 'inset 0 0 40px rgba(233,30,140,0.5), inset 0 0 80px rgba(167,51,255,0.25)',
          animation: 'eff-neon 3.5s ease-in-out infinite',
        }} />
      )}

      {/* ── STUDIO LIGHT — soft radial center light ── */}
      {type === 'studio' && (
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 65% 80% at 50% 38%, rgba(255,255,255,0.22) 0%, transparent 65%)',
          animation: 'eff-glow 3s ease-in-out infinite',
        }} />
      )}

      {/* ── BOKEH LIGHT — soft out-of-focus light circles ── */}
      {type === 'bokehlight' && (
        <>
          {[
            { left:12, top:18, size:90, color:'rgba(255,180,80,0.3)' },
            { left:72, top:10, size:70, color:'rgba(200,120,255,0.28)' },
            { left:55, top:55, size:110, color:'rgba(80,180,255,0.25)' },
            { left:8,  top:62, size:80, color:'rgba(255,100,160,0.28)' },
            { left:80, top:68, size:65, color:'rgba(255,200,100,0.25)' },
            { left:38, top:20, size:55, color:'rgba(160,80,255,0.22)' },
          ].map((b, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${b.left}%`, top: `${b.top}%`,
              width: b.size, height: b.size,
              background: b.color, filter: 'blur(18px)',
              transform: 'translate(-50%, -50%)',
              animation: `eff-drift ${5 + i * 0.8}s ease-in-out ${i * 0.6}s infinite`,
            }} />
          ))}
        </>
      )}

      {/* ── PORTRAIT — edge vignette softening ── */}
      {type === 'portrait' && (
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 85% at 50% 40%, transparent 40%, rgba(0,0,0,0.45) 100%)',
        }} />
      )}

      {/* ── NIGHT BRIGHTENING — subtle warm brightening lift ── */}
      {type === 'nightbright' && (
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 90% at 50% 45%, rgba(255,220,180,0.12) 0%, transparent 60%)',
          animation: 'eff-pulse 4.5s ease-in-out infinite',
        }} />
      )}

      {/* ── GOLDEN HOUR — warm golden wrap ── */}
      {type === 'goldenhour' && (
        <>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(255,160,40,0.14) 0%, transparent 50%)' }} />
          <div className="absolute inset-x-0 bottom-0" style={{ height: '35%', background: 'linear-gradient(to top, rgba(220,100,20,0.2), transparent)' }} />
        </>
      )}

      {/* ── SOFT LIGHT — gentle even fill from above ── */}
      {type === 'softlight' && (
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 60%)',
          animation: 'eff-pulse 5s ease-in-out infinite',
        }} />
      )}
    </div>
  );
}