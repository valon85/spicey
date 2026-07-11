/**
 * AIVoiceButton — Mini orb button matching the AITalkMode orb style
 */
import React from 'react';

export default function AIVoiceButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: 58,
        height: 58,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        background: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
      }}
    >
      {/* Outer glow */}
      <div style={{
        position: 'absolute',
        inset: -6,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(193,0,255,0.35) 0%, rgba(255,45,85,0.2) 50%, transparent 70%)',
        filter: 'blur(10px)',
        animation: 'orb-btn-pulse 3s ease-in-out infinite',
      }} />

      {/* Conic spinning ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #FF6A00, #FF2D55, #C100FF, #FF6A00)',
        filter: 'blur(16px)',
        animation: 'orb-btn-spin 4s linear infinite',
      }} />

      {/* Mid blob */}
      <div style={{
        position: 'absolute',
        inset: 4,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 35% 30%, rgba(200,100,255,0.9) 0%, rgba(124,58,237,0.7) 40%, rgba(255,45,85,0.4) 80%)',
        filter: 'blur(12px)',
      }} />

      {/* Shine highlight */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 28% 22%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 45%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Inner glass */}
      <div style={{
        position: 'absolute',
        inset: 10,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.2)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Mic icon */}
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="0.5" width="6" height="10" rx="3" fill="white" fillOpacity="0.9"/>
          <path d="M2 8.5C2 11.81 4.69 14.5 8 14.5C11.31 14.5 14 11.81 14 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="8" y1="14.5" x2="8" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="5.5" y1="17.5" x2="10.5" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <style>{`
        @keyframes orb-btn-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orb-btn-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </button>
  );
}