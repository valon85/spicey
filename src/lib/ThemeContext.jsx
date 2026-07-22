import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// All app themes — free + VIP
export const VIP_THEMES = {
  dark: {
    label: 'Dark Mode',
    description: 'Sleek, modern and easy on the eyes.',
    vipOnly: false,
    preview: ['#1a0a2e', '#ff5500', '#e91e8c'],
    accent: '#ff5500',
    gradient: 'linear-gradient(135deg, #ff5500, #e91e8c)',
  },
  light: {
    label: 'Light Mode',
    description: 'Clean, bright and perfect for daytime.',
    vipOnly: false,
    preview: ['#ffffff', '#ff5500', '#ffe8ef'],
    accent: '#ff5500',
    gradient: 'linear-gradient(135deg, #ff5500, #e91e8c)',
  },
  sunset_glow: {
    label: 'Sunset Glow',
    description: 'Warm sunset tones that light up your vibe.',
    vipOnly: true,
    preview: ['#ff4500', '#ff8c00', '#ffb347'],
    accent: '#ff6a00',
    gradient: 'linear-gradient(135deg, #ff4500, #ff8c00, #ffb347)',
    // solid strong color applied everywhere
    solidBg: '#e84d00',
    cssVars: {
      '--background': '18 100% 10%',
      '--foreground': '30 100% 97%',
      '--card': '18 100% 16%',
      '--card-foreground': '30 100% 97%',
      '--border': '22 80% 30%',
      '--primary': '25 100% 55%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '40 100% 60%',
      '--muted': '18 70% 20%',
      '--muted-foreground': '25 50% 65%',
      '--popover': '18 100% 16%',
      '--popover-foreground': '30 100% 97%',
      '--secondary': '18 80% 20%',
      '--secondary-foreground': '30 100% 97%',
      '--input': '18 80% 20%',
      '--ring': '25 100% 55%',
    },
  },
  royal_purple: {
    label: 'Royal Purple',
    description: 'Rich purple vibes fit for royalty.',
    vipOnly: true,
    preview: ['#4a0080', '#7b2fff', '#9b4fff'],
    accent: '#7b2fff',
    gradient: 'linear-gradient(135deg, #3d0070, #7b2fff)',
    solidBg: '#4a1090',
    cssVars: {
      '--background': '265 70% 12%',
      '--foreground': '280 100% 97%',
      '--card': '265 65% 18%',
      '--card-foreground': '280 100% 97%',
      '--border': '265 55% 30%',
      '--primary': '270 90% 60%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '285 80% 65%',
      '--muted': '265 50% 22%',
      '--muted-foreground': '270 40% 65%',
      '--popover': '265 65% 18%',
      '--popover-foreground': '280 100% 97%',
      '--secondary': '265 55% 22%',
      '--secondary-foreground': '280 100% 97%',
      '--input': '265 55% 22%',
      '--ring': '270 90% 60%',
    },
  },
  ocean_blue: {
    label: 'Ocean Blue',
    description: 'Cool purple energy that keeps you calm.',
    vipOnly: true,
    preview: ['#0033cc', '#0055ff', '#4488ff'],
    accent: '#1155ff',
    gradient: 'linear-gradient(135deg, #0022aa, #0055ff)',
    solidBg: '#0033cc',
    cssVars: {
      '--background': '220 100% 12%',
      '--foreground': '210 100% 97%',
      '--card': '220 90% 18%',
      '--card-foreground': '210 100% 97%',
      '--border': '220 70% 30%',
      '--primary': '215 100% 60%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '200 100% 55%',
      '--muted': '220 70% 22%',
      '--muted-foreground': '215 50% 65%',
      '--popover': '220 90% 18%',
      '--popover-foreground': '210 100% 97%',
      '--secondary': '220 70% 22%',
      '--secondary-foreground': '210 100% 97%',
      '--input': '220 70% 22%',
      '--ring': '215 100% 60%',
    },
  },
  mint_fresh: {
    label: 'Mint Fresh',
    description: 'Fresh, clean and refreshingly unique.',
    vipOnly: true,
    preview: ['#007755', '#00bb88', '#00ddaa'],
    accent: '#00cc88',
    gradient: 'linear-gradient(135deg, #007755, #00bb88)',
    solidBg: '#007755',
    cssVars: {
      '--background': '160 80% 10%',
      '--foreground': '155 100% 95%',
      '--card': '160 75% 16%',
      '--card-foreground': '155 100% 95%',
      '--border': '160 60% 25%',
      '--primary': '162 100% 40%',
      '--primary-foreground': '0 0% 0%',
      '--accent': '170 100% 45%',
      '--muted': '160 60% 20%',
      '--muted-foreground': '160 40% 60%',
      '--popover': '160 75% 16%',
      '--popover-foreground': '155 100% 95%',
      '--secondary': '160 60% 20%',
      '--secondary-foreground': '155 100% 95%',
      '--input': '160 60% 20%',
      '--ring': '162 100% 40%',
    },
  },
  cherry_blossom: {
    label: 'Cherry Blossom',
    description: 'Soft, playful and beautifully vibrant.',
    vipOnly: true,
    preview: ['#cc0066', '#ff3399', '#ff77bb'],
    accent: '#ff3399',
    gradient: 'linear-gradient(135deg, #bb0055, #ff3399)',
    solidBg: '#cc0066',
    cssVars: {
      '--background': '330 90% 12%',
      '--foreground': '340 100% 97%',
      '--card': '330 80% 18%',
      '--card-foreground': '340 100% 97%',
      '--border': '330 65% 30%',
      '--primary': '335 100% 58%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '350 90% 68%',
      '--muted': '330 65% 22%',
      '--muted-foreground': '335 45% 65%',
      '--popover': '330 80% 18%',
      '--popover-foreground': '340 100% 97%',
      '--secondary': '330 65% 22%',
      '--secondary-foreground': '340 100% 97%',
      '--input': '330 65% 22%',
      '--ring': '335 100% 58%',
    },
  },
  lavender_dream: {
    label: 'Lavender Dream',
    description: 'Dreamy lavender tones for a chill vibe.',
    vipOnly: true,
    preview: ['#6644cc', '#9966ff', '#cc99ff'],
    accent: '#9966ff',
    gradient: 'linear-gradient(135deg, #5533bb, #9966ff)',
    solidBg: '#6644cc',
    cssVars: {
      '--background': '255 55% 14%',
      '--foreground': '260 100% 97%',
      '--card': '255 50% 20%',
      '--card-foreground': '260 100% 97%',
      '--border': '255 45% 32%',
      '--primary': '258 85% 65%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '265 75% 72%',
      '--muted': '255 45% 24%',
      '--muted-foreground': '258 35% 65%',
      '--popover': '255 50% 20%',
      '--popover-foreground': '260 100% 97%',
      '--secondary': '255 45% 24%',
      '--secondary-foreground': '260 100% 97%',
      '--input': '255 45% 24%',
      '--ring': '258 85% 65%',
    },
  },
};

const ALL_VIP_CSS_VARS = ['--background','--foreground','--card','--card-foreground','--border','--primary','--primary-foreground','--accent','--accent-foreground','--muted','--muted-foreground','--popover','--popover-foreground','--secondary','--secondary-foreground','--input','--ring'];

const GLOBAL_THEME_VARS = [
  '--spicey-page-bg', '--spicey-page-surface', '--spicey-page-surface-strong',
  '--spicey-page-text', '--spicey-page-muted', '--spicey-page-border',
  '--spicey-page-accent', '--spicey-page-accent-2', '--spicey-theme-gradient',
  '--spicey-theme-soft', '--spicey-theme-ring', '--spicey-theme-shadow',
];

const GLOBAL_THEME_PALETTES = {
  dark: {
    bg: 'linear-gradient(145deg, #08030f 0%, #11061d 55%, #1a0a2e 100%)',
    surface: 'rgba(16,7,27,0.92)', strong: '#160a24', text: '#ffffff', muted: 'rgba(255,255,255,0.68)',
    border: 'rgba(255,255,255,0.14)', accent: '#ff6a00', accent2: '#ff2d8f',
    gradient: 'linear-gradient(135deg, #ff6a00, #ff2d8f 55%, #8b2cff)',
    soft: 'linear-gradient(145deg, rgba(255,106,0,0.16), rgba(255,45,143,0.12), rgba(139,44,255,0.14))',
    ring: 'linear-gradient(135deg, rgba(255,106,0,0.82), rgba(255,45,143,0.72), rgba(139,44,255,0.78))',
    shadow: 'rgba(255,45,143,0.24)',
  },
  light: {
    bg: 'linear-gradient(145deg, #ffffff 0%, #ffffff 42%, #fff0f6 70%, #fff3e8 100%)',
    surface: 'rgba(255,255,255,0.88)', strong: '#ffffff', text: '#201523', muted: '#736875',
    border: 'rgba(255,91,24,0.20)', accent: '#ff6a00', accent2: '#ff2d8f',
    gradient: 'linear-gradient(135deg, #ff6a00, #ff2d8f 55%, #8b2cff)',
    soft: 'linear-gradient(145deg, rgba(255,106,0,0.12), rgba(255,45,143,0.10), rgba(139,44,255,0.12))',
    ring: 'linear-gradient(135deg, rgba(255,106,0,0.78), rgba(255,45,143,0.66), rgba(139,44,255,0.74))',
    shadow: 'rgba(255,45,143,0.22)',
  },
  sunset_glow: {
    bg: 'linear-gradient(145deg, #321006 0%, #a83208 52%, #ff6a00 100%)',
    surface: 'rgba(79,20,5,0.92)', strong: '#8f2608', text: '#ffffff', muted: 'rgba(255,255,255,0.72)',
    border: 'rgba(255,255,255,0.20)', accent: '#ff6a00', accent2: '#ff2d8f',
    gradient: 'linear-gradient(135deg, #ff5a00, #ff8c00 52%, #ff2d8f)',
    soft: 'linear-gradient(145deg, rgba(255,106,0,0.24), rgba(255,140,0,0.16), rgba(255,45,143,0.12))',
    ring: 'linear-gradient(135deg, rgba(255,106,0,0.88), rgba(255,140,0,0.78), rgba(255,45,143,0.68))',
    shadow: 'rgba(255,106,0,0.30)',
  },
  royal_purple: {
    bg: 'linear-gradient(145deg, #160525 0%, #4a1090 55%, #8b2cff 100%)',
    surface: 'rgba(42,9,72,0.92)', strong: '#5c19a7', text: '#ffffff', muted: 'rgba(255,255,255,0.72)',
    border: 'rgba(255,255,255,0.20)', accent: '#8b2cff', accent2: '#ff2d8f',
    gradient: 'linear-gradient(135deg, #7b2fff, #b02cff 48%, #ff2d8f)',
    soft: 'linear-gradient(145deg, rgba(123,47,255,0.24), rgba(176,44,255,0.16), rgba(255,45,143,0.12))',
    ring: 'linear-gradient(135deg, rgba(123,47,255,0.88), rgba(176,44,255,0.78), rgba(255,45,143,0.68))',
    shadow: 'rgba(139,44,255,0.31)',
  },
  ocean_blue: {
    bg: 'linear-gradient(145deg, #020d31 0%, #0033a6 55%, #126dff 100%)',
    surface: 'rgba(3,29,92,0.92)', strong: '#0646c7', text: '#ffffff', muted: 'rgba(255,255,255,0.72)',
    border: 'rgba(255,255,255,0.20)', accent: '#2378ff', accent2: '#ff2d8f',
    gradient: 'linear-gradient(135deg, #136dff, #00b8ff 48%, #8b2cff)',
    soft: 'linear-gradient(145deg, rgba(35,120,255,0.24), rgba(0,184,255,0.16), rgba(139,44,255,0.12))',
    ring: 'linear-gradient(135deg, rgba(35,120,255,0.88), rgba(0,184,255,0.74), rgba(139,44,255,0.68))',
    shadow: 'rgba(35,120,255,0.30)',
  },
  mint_fresh: {
    bg: 'linear-gradient(145deg, #03271d 0%, #007755 55%, #00c990 100%)',
    surface: 'rgba(3,67,50,0.92)', strong: '#008866', text: '#ffffff', muted: 'rgba(255,255,255,0.72)',
    border: 'rgba(255,255,255,0.20)', accent: '#00cc8f', accent2: '#ff6a00',
    gradient: 'linear-gradient(135deg, #00cc8f, #00e0b0 48%, #ff8a00)',
    soft: 'linear-gradient(145deg, rgba(0,204,143,0.24), rgba(0,224,176,0.14), rgba(255,138,0,0.13))',
    ring: 'linear-gradient(135deg, rgba(0,204,143,0.88), rgba(0,224,176,0.74), rgba(255,138,0,0.68))',
    shadow: 'rgba(0,204,143,0.30)',
  },
  cherry_blossom: {
    bg: 'linear-gradient(145deg, #3a061f 0%, #b3005c 55%, #ff3399 100%)',
    surface: 'rgba(88,5,48,0.92)', strong: '#ca0b70', text: '#ffffff', muted: 'rgba(255,255,255,0.72)',
    border: 'rgba(255,255,255,0.20)', accent: '#ff3399', accent2: '#8b2cff',
    gradient: 'linear-gradient(135deg, #ff3399, #ff66b8 48%, #8b2cff)',
    soft: 'linear-gradient(145deg, rgba(255,51,153,0.24), rgba(255,102,184,0.15), rgba(139,44,255,0.12))',
    ring: 'linear-gradient(135deg, rgba(255,51,153,0.9), rgba(255,102,184,0.74), rgba(139,44,255,0.68))',
    shadow: 'rgba(255,51,153,0.31)',
  },
  lavender_dream: {
    bg: 'linear-gradient(145deg, #1e103d 0%, #6644cc 55%, #a477ff 100%)',
    surface: 'rgba(48,28,99,0.92)', strong: '#7653dd', text: '#ffffff', muted: 'rgba(255,255,255,0.72)',
    border: 'rgba(255,255,255,0.20)', accent: '#a477ff', accent2: '#ff2d8f',
    gradient: 'linear-gradient(135deg, #9966ff, #c59bff 48%, #ff2d8f)',
    soft: 'linear-gradient(145deg, rgba(153,102,255,0.24), rgba(197,155,255,0.15), rgba(255,45,143,0.12))',
    ring: 'linear-gradient(135deg, rgba(153,102,255,0.88), rgba(197,155,255,0.74), rgba(255,45,143,0.68))',
    shadow: 'rgba(153,102,255,0.31)',
  },
};

function applyGlobalPalette(themeKey) {
  GLOBAL_THEME_VARS.forEach((key) => document.documentElement.style.removeProperty(key));
  document.documentElement.setAttribute('data-spicey-theme', themeKey);
  const palette = GLOBAL_THEME_PALETTES[themeKey];
  if (!palette) return;
  document.documentElement.style.setProperty('--spicey-page-bg', palette.bg);
  document.documentElement.style.setProperty('--spicey-page-surface', palette.surface);
  document.documentElement.style.setProperty('--spicey-page-surface-strong', palette.strong);
  document.documentElement.style.setProperty('--spicey-page-text', palette.text);
  document.documentElement.style.setProperty('--spicey-page-muted', palette.muted);
  document.documentElement.style.setProperty('--spicey-page-border', palette.border);
  document.documentElement.style.setProperty('--spicey-page-accent', palette.accent);
  document.documentElement.style.setProperty('--spicey-page-accent-2', palette.accent2);
  document.documentElement.style.setProperty('--spicey-theme-gradient', palette.gradient || `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`);
  document.documentElement.style.setProperty('--spicey-theme-soft', palette.soft || `linear-gradient(145deg, color-mix(in srgb, ${palette.accent} 16%, transparent), color-mix(in srgb, ${palette.accent2} 12%, transparent))`);
  document.documentElement.style.setProperty('--spicey-theme-ring', palette.ring || `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})`);
  document.documentElement.style.setProperty('--spicey-theme-shadow', palette.shadow || 'rgba(255,45,143,0.22)');
}

function applyVIPTheme(themeKey) {
  const theme = VIP_THEMES[themeKey];
  if (!theme) return;
  applyGlobalPalette(themeKey);

  // Reset everything first
  ALL_VIP_CSS_VARS.forEach(k => document.documentElement.style.removeProperty(k));
  document.documentElement.removeAttribute('data-vip-theme');
  document.documentElement.classList.remove('light-mode');
  document.body.style.removeProperty('background');
  document.documentElement.style.removeProperty('background');
  const root = document.getElementById('root');
  if (root) root.style.removeProperty('background');

  if (themeKey === 'light') {
    document.documentElement.classList.add('light-mode');
    return;
  }

  if (themeKey === 'dark') {
    return;
  }

  // VIP theme — set data attribute (CSS in index.css handles the bg gradients)
  document.documentElement.setAttribute('data-vip-theme', themeKey);

  // Apply CSS vars for colors
  if (theme.cssVars) {
    Object.entries(theme.cssVars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const requestedTheme = new URLSearchParams(window.location.search).get('previewTheme');
    const saved = localStorage.getItem('spicey-theme') || 'dark';
    const initialTheme = requestedTheme && VIP_THEMES[requestedTheme]
      ? requestedTheme
      : (VIP_THEMES[saved] ? saved : 'dark');
    setTheme(initialTheme);
    applyVIPTheme(initialTheme);
    if (requestedTheme && VIP_THEMES[requestedTheme]) localStorage.setItem('spicey-theme', initialTheme);
    setMounted(true);
  }, []);

  const changeTheme = (newTheme) => {
    if (!VIP_THEMES[newTheme]) return;
    // Clear VIP body bg when switching to free themes
    if (newTheme === 'dark' || newTheme === 'light') {
      document.body.style.removeProperty('background');
      const root = document.getElementById('root');
      if (root) root.style.removeProperty('background');
    }
    setTheme(newTheme);
    applyVIPTheme(newTheme);
    localStorage.setItem('spicey-theme', newTheme);
  };

  const toggleTheme = () => {
    changeTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
