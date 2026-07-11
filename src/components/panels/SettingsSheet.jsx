import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Bell, Moon, Sun, Settings, Lock, Unlock, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import useScrollLock from '@/hooks/useScrollLock';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsSheet({ open, onClose }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  useScrollLock(open);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Load privacy settings
  useEffect(() => {
    base44.auth.me().then(async (user) => {
      if (user) {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        if (profiles.length > 0) {
          setIsPrivate(profiles[0].is_private === true);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleTogglePrivate = async () => {
    const newVal = !isPrivate;
    setIsPrivate(newVal);
    const user = await base44.auth.me();
    if (user) {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { is_private: newVal });
      }
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  // Dynamic styles
  const sheetBg = isLight ? 'rgba(248,244,255,0.99)' : 'rgba(15,8,20,0.98)';
  const sheetBorder = isLight ? '1px solid rgba(160,80,255,0.15)' : '1px solid rgba(255,255,255,0.1)';
  const headerBg = isLight ? 'rgba(246,241,255,0.98)' : 'rgba(15,8,20,0.95)';
  const headerBorder = isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)';
  const titleColor = isLight ? 'hsl(270,20%,12%)' : 'white';
  const closeBtnBg = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)';
  const closeIconColor = isLight ? 'hsl(270,20%,25%)' : 'white';
  const rowBg = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.06)';
  const rowBorder = isLight ? '1px solid rgba(160,80,255,0.14)' : '1px solid rgba(255,255,255,0.08)';
  const labelColor = isLight ? 'hsl(270,20%,15%)' : 'white';
  const descColor = isLight ? 'rgba(80,50,120,0.55)' : 'rgba(255,255,255,0.35)';
  const dividerColor = isLight ? 'rgba(160,80,255,0.1)' : 'rgba(255,255,255,0.08)';

  const ITEMS = [
    { 
      icon: Crown, 
      label: 'Spicey VIP', 
      desc: 'Unlock premium features & badges',
      onClick: () => { onClose(); navigate('/vip'); },
    },
    { icon: Settings, label: 'Account & Safety', desc: 'Delete account, policies, support', onClick: () => { onClose(); navigate('/settings'); } },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto"
            style={{ background: sheetBg, border: sheetBorder, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 pt-5 pb-4"
              style={{ background: headerBg, borderBottom: headerBorder }}>
              <h3 className="font-extrabold text-lg" style={{ color: titleColor }}>Settings</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: closeBtnBg }}>
                <X className="w-4 h-4" style={{ color: closeIconColor }} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-3">
              {ITEMS.map((item, i) => {
              const gradients = [
                'linear-gradient(135deg, #ff6b4a, #ec4899)',
                'linear-gradient(135deg, #06b6d4, #3b82f6)',
                'linear-gradient(135deg, #8b5cf6, #ec4899)',
                'linear-gradient(135deg, #10b981, #06b6d4)',
              ];
              return (
                <button key={i} onClick={item.onClick} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left active:scale-95 transition-transform"
                  style={{ 
                    background: rowBg,
                    border: rowBorder,
                  }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: gradients[i % gradients.length] }}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: labelColor }}>{item.label}</p>
                    <p className="text-xs" style={{ color: descColor }}>{item.desc}</p>
                  </div>
                </button>
              );
            })}

              {/* Privacy Toggle */}
              <div className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl"
                style={{ background: rowBg, border: rowBorder }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>
                  {isPrivate
                    ? <Lock className="w-5 h-5 text-white" />
                    : <Unlock className="w-5 h-5 text-white" />
                  }
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: labelColor }}>Privacy</p>
                  <p className="text-xs" style={{ color: descColor }}>{isPrivate ? 'Private Profile' : 'Public Profile'}</p>
                </div>
                <button
                  onClick={handleTogglePrivate}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50"
                  style={{ 
                    background: isPrivate ? 'rgba(255,80,0,0.18)' : 'rgba(255,255,255,0.18)', 
                    border: isPrivate ? '1px solid rgba(255,80,0,0.4)' : '1px solid rgba(255,255,255,0.4)', 
                    color: isPrivate ? '#ff7733' : labelColor 
                  }}>
                  {isPrivate ? 'Private' : 'Public'}
                </button>
              </div>

              {/* Theme Toggle */}
              <div className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl"
                style={{ background: rowBg, border: rowBorder }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                  {theme === 'dark'
                    ? <Moon className="w-5 h-5 text-white" />
                    : <Sun className="w-5 h-5 text-white" />
                  }
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: labelColor }}>Theme</p>
                  <p className="text-xs" style={{ color: descColor }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,140,0,0.18)', border: '1px solid rgba(255,140,0,0.4)', color: '#e06000' }}>
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              {/* Logout — inline in list */}
              <button onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left active:scale-95 transition-transform"
                style={{ background: 'rgba(220,30,30,0.08)', border: '1px solid rgba(220,30,30,0.25)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>Log Out</p>
                  <p className="text-xs" style={{ color: 'rgba(239,68,68,0.5)' }}>Sign out of your account</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Logout confirmation */}
          <AnimatePresence>
            {showLogoutConfirm && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowLogoutConfirm(false)} className="fixed inset-0 z-50 bg-black/60" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-3xl p-6"
                  style={{ background: isLight ? 'rgba(248,244,255,0.99)' : 'rgba(15,8,20,0.98)', border: isLight ? '1px solid rgba(160,80,255,0.15)' : '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 className="font-bold text-lg mb-2" style={{ color: titleColor }}>Logout?</h4>
                  <p className="text-sm mb-6" style={{ color: descColor }}>You'll be signed out of your account.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 py-2.5 rounded-2xl font-semibold"
                      style={{ background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)', color: labelColor }}>
                      Cancel
                    </button>
                    <button onClick={handleLogout}
                      className="flex-1 py-2.5 rounded-2xl font-semibold text-white"
                      style={{ background: 'rgba(220,30,30,0.75)' }}>
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}