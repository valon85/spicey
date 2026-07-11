export const spiceyColors = {
  black: '#050505',
  blackRaised: '#0A0A0B',
  orange: '#FF7A00',
  pink: '#FF2FAF',
  purple: '#7A2BFF',
  white: '#F5F5F7',
  muted: '#A3A3A3',
  border: 'rgba(255,255,255,0.10)',
  glass: 'rgba(255,255,255,0.06)',
};

export const spiceyFluidGlass = {
  background: '#050505',
  panel: 'rgba(255,255,255,0.06)',
  card: 'rgba(255,255,255,0.045)',
  border: 'rgba(255,255,255,0.10)',
  radius: {
    main: 28,
    card: 34,
    nav: 36,
  },
  shadow: {
    card: '0 22px 60px rgba(0,0,0,0.60)',
    nav: '0 -12px 40px rgba(0,0,0,0.45)',
  },
};

export const spiceyShadows = {
  wordmark: '0 0 14px rgba(255,122,0,0.22), 0 0 22px rgba(255,47,175,0.14)',
  softGlow: '0 0 22px rgba(255,122,0,0.12), 0 0 28px rgba(122,43,255,0.10)',
  glassInset: 'inset 0 1px 0 rgba(255,255,255,0.08)',
};

export const spiceyGlass = {
  panel: {
    background: spiceyColors.glass,
    border: `1px solid ${spiceyColors.border}`,
    backdropFilter: 'blur(18px) saturate(1.18)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.18)',
  },
  search: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))',
    border: `1px solid ${spiceyColors.border}`,
    backdropFilter: 'blur(20px) saturate(1.16)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.16)',
  },
};

export const spiceyRadius = {
  icon: 18,
  search: 24,
  pill: 999,
};
