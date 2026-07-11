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

const ALL_VIP_CSS_VARS = ['--background','--foreground','--card','--card-foreground','--border','--primary','--primary-foreground','--accent','--accent-foreground','--muted','--muted-foreground'];

function applyVIPTheme(themeKey) {
  const theme = VIP_THEMES[themeKey];
  if (!theme) return;

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
    const saved = localStorage.getItem('spicey-theme') || 'dark';
    setTheme(saved);
    applyVIPTheme(saved);
    setMounted(true);
  }, []);

  const changeTheme = (newTheme) => {
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