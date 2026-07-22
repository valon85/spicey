import { useState, useEffect } from 'react';

const VIP_SOLID_COLORS = {
  sunset_glow: '#c43800',
  royal_purple: '#2d0060',
  ocean_blue: '#001faa',
  mint_fresh: '#005540',
  cherry_blossom: '#aa0050',
  lavender_dream: '#4433aa',
};

const VIP_TOP_COLORS = {
  sunset_glow: '#e84d00',
  royal_purple: '#4a1090',
  ocean_blue: '#0033cc',
  mint_fresh: '#007755',
  cherry_blossom: '#cc0066',
  lavender_dream: '#6644cc',
};

function computeBg() {
  const html = document.documentElement;
  const isLight = html.classList.contains('light-mode');
  const vipTheme = html.getAttribute('data-vip-theme');
  const globalThemeBackground = html.style.getPropertyValue('--spicey-page-bg').trim();

  if (globalThemeBackground && (isLight || vipTheme)) return globalThemeBackground;
  if (isLight) return 'linear-gradient(145deg, #ffffff 0%, #fff0f6 70%, #fff3e8 100%)';
  if (vipTheme && VIP_SOLID_COLORS[vipTheme]) {
    const top = VIP_TOP_COLORS[vipTheme];
    const solid = VIP_SOLID_COLORS[vipTheme];
    return `linear-gradient(180deg, ${top} 0%, ${solid} 40%, ${solid} 100%)`;
  }
  return '#000000';
}

/**
 * Returns the correct full-page background for the current active theme.
 * Reacts to light-mode class AND data-vip-theme attribute changes.
 */
export function usePageBackground() {
  const [bg, setBg] = useState(computeBg);

  useEffect(() => {
    const update = () => {
      const next = computeBg();
      setBg(prev => (prev === next ? prev : next));
    };
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-vip-theme', 'data-spicey-theme', 'style'],
    });
    return () => obs.disconnect();
  }, []);

  return bg;
}

/**
 * Returns isLight boolean reacting to theme changes.
 */
export function useIsLightMode() {
  const [isLight, setIsLight] = useState(
    () => document.documentElement.classList.contains('light-mode')
  );
  useEffect(() => {
    const update = () => {
      const next = document.documentElement.classList.contains('light-mode');
      setIsLight(prev => (prev === next ? prev : next));
    };
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-vip-theme', 'data-spicey-theme', 'style'] });
    return () => obs.disconnect();
  }, []);
  return isLight;
}
