import React from 'react';

export default function AIOrb({ onClick, status = 'idle', size = 42 }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        background: 'transparent',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        flexShrink: 0,
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'aiorb-float 4s ease-in-out infinite',
      }}
    >
      {/* Topi — blur i butë, gradient mix */}
      <div style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF9500 0%, #FF2D55 50%, #C100FF 100%)',
        boxShadow: '0 0 8px rgba(255,120,0,0.6), 0 0 16px rgba(255,45,85,0.35), 0 0 28px rgba(193,0,255,0.2)',
        animation: 'aiorb-glow 3s ease-in-out infinite',
        filter: 'blur(2px)',
      }} />

      {/* Teksti "Talk" — layer i veçantë, i qartë */}
      <span style={{
        position: 'relative',
        zIndex: 1,
        color: 'rgba(255,255,255,0.95)',
        fontSize: size * 0.28,
        fontWeight: 100,
        letterSpacing: '0.12em',
        userSelect: 'none',
        textShadow: '0 0 8px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.3)',
        fontFamily: 'var(--font-inter)',
      }}>Talk</span>

      <style>{`
        @keyframes aiorb-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes aiorb-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(255,120,0,0.6), 0 0 16px rgba(255,45,85,0.35), 0 0 28px rgba(193,0,255,0.2); }
          50%       { box-shadow: 0 0 12px rgba(255,149,0,0.75), 0 0 24px rgba(255,45,85,0.5), 0 0 40px rgba(193,0,255,0.3); }
        }
      `}</style>
    </button>
  );
}