import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Lock, Moon, Sun } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { VIP_THEMES, useTheme } from '@/lib/ThemeContext';

export const PROFILE_THEMES = VIP_THEMES;

// Mini fake phone preview showing the theme color
function MiniPreview({ themeKey, themeData }) {
  let bg, headerBg, cardBg, textColor;

  if (themeKey === 'dark') {
    bg = 'linear-gradient(180deg, #1a0a2e 0%, #0a0516 100%)';
    headerBg = 'rgba(20,10,40,0.9)';
    cardBg = 'rgba(30,15,50,0.8)';
    textColor = '#fff';
  } else if (themeKey === 'light') {
    bg = 'linear-gradient(160deg, #fff5f5, #ffe8ef)';
    headerBg = 'rgba(255,255,255,0.9)';
    cardBg = '#fff';
    textColor = '#1a0a2e';
  } else {
    bg = themeData.gradient;
    headerBg = 'rgba(0,0,0,0.25)';
    cardBg = 'rgba(0,0,0,0.2)';
    textColor = '#fff';
  }

  return (
    <div style={{
      width: '100%', height: 90, borderRadius: 10,
      background: bg, overflow: 'hidden', position: 'relative',
      flexShrink: 0,
    }}>
      {/* Header bar */}
      <div style={{
        background: headerBg, backdropFilter: 'blur(8px)',
        padding: '5px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: themeData.accent || '#ff5500' }} />
          <div style={{ color: textColor, fontSize: 7, fontWeight: 800, opacity: 0.9 }}>SPICEY</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,100,100,0.8)' }} />
      </div>

      {/* Search bar */}
      <div style={{
        margin: '4px 6px', background: 'rgba(255,255,255,0.12)',
        borderRadius: 6, height: 10, display: 'flex', alignItems: 'center', padding: '0 5px',
      }}>
        <div style={{ width: 30, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
      </div>

      {/* Story circles */}
      <div style={{ display: 'flex', gap: 5, padding: '3px 6px' }}>
        {[themeData.accent || '#ff5500', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.25)'].map((c, i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '50%', background: c,
            border: '1.5px solid rgba(255,255,255,0.3)',
          }} />
        ))}
      </div>

      {/* Card rows */}
      <div style={{ padding: '2px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ background: cardBg, borderRadius: 4, height: 12, backdropFilter: 'blur(4px)' }} />
        <div style={{ background: cardBg, borderRadius: 4, height: 12, backdropFilter: 'blur(4px)' }} />
      </div>
    </div>
  );
}

export default function ProfileThemePicker({ open, onClose, currentTheme = 'dark', hasVIP, onThemeChange }) {
  const { theme, changeTheme } = useTheme();
  const [selected, setSelected] = React.useState(theme || currentTheme);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setSelected(theme || currentTheme);
  }, [open, theme, currentTheme]);

  const handleSelect = (key) => {
    setSelected(key);
    changeTheme(key);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { profile_theme: selected });
      }
      onThemeChange?.(selected);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const freeThemes = Object.entries(VIP_THEMES).filter(([, t]) => !t.vipOnly);
  const vipThemes = Object.entries(VIP_THEMES).filter(([, t]) => t.vipOnly);

  const renderRow = (key, themeData, locked = false) => {
    const isActive = selected === key;

    // Row left bg
    let rowBg;
    if (key === 'dark') rowBg = 'linear-gradient(135deg, #1a0a2e, #2a1050)';
    else if (key === 'light') rowBg = 'linear-gradient(135deg, #f8f8fc, #ffe8ef)';
    else rowBg = themeData.gradient;

    const textColor = key === 'light' ? '#1a0a2e' : '#fff';

    return (
      <motion.button
        key={key}
        whileTap={locked ? {} : { scale: 0.98 }}
        onClick={() => !locked && handleSelect(key)}
        style={{
          width: '100%',
          borderRadius: 18,
          overflow: 'hidden',
          border: isActive
            ? `2.5px solid rgba(255,255,255,0.9)`
            : '2px solid rgba(255,255,255,0.08)',
          boxShadow: isActive
            ? '0 0 0 3px rgba(255,255,255,0.3), 0 8px 30px rgba(0,0,0,0.4)'
            : '0 2px 12px rgba(0,0,0,0.3)',
          cursor: locked ? 'default' : 'pointer',
          opacity: locked ? 0.5 : 1,
          background: rowBg,
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          marginBottom: 10,
          position: 'relative',
          minHeight: 80,
        }}>

        {/* Left info panel */}
        <div style={{
          width: '40%', padding: '14px 14px', display: 'flex',
          flexDirection: 'column', justifyContent: 'center', flexShrink: 0,
        }}>
          {/* Icon */}
          <div style={{ marginBottom: 6 }}>
            {key === 'dark' && <Moon style={{ width: 20, height: 20, color: '#c4b5fd' }} />}
            {key === 'light' && <Sun style={{ width: 20, height: 20, color: '#f97316' }} />}
            {themeData.vipOnly && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.4)',
              }} />
            )}
          </div>

          <div style={{ color: textColor, fontWeight: 800, fontSize: 13, lineHeight: 1.2, marginBottom: 3 }}>
            {themeData.label}
          </div>

          {/* Badge */}
          {!themeData.vipOnly ? (
            <div style={{
              display: 'inline-block', fontSize: 9, fontWeight: 700,
              color: key === 'light' ? '#ff5500' : 'rgba(255,255,255,0.7)',
              background: key === 'light' ? 'rgba(255,85,0,0.12)' : 'rgba(255,255,255,0.15)',
              borderRadius: 6, padding: '2px 6px', width: 'fit-content',
            }}>
              FREE
            </div>
          ) : locked ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 9, fontWeight: 700, color: '#fbbf24',
              background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '2px 6px', width: 'fit-content',
            }}>
              <Lock style={{ width: 8, height: 8 }} /> VIP
            </div>
          ) : (
            <div style={{
              display: 'inline-block', fontSize: 9, fontWeight: 700,
              color: '#fbbf24', background: 'rgba(0,0,0,0.2)',
              borderRadius: 6, padding: '2px 6px', width: 'fit-content',
            }}>
              ⭐ VIP
            </div>
          )}

          <div style={{
            color: textColor, fontSize: 9, marginTop: 4, opacity: 0.7, lineHeight: 1.3,
          }}>
            {themeData.description}
          </div>
        </div>

        {/* Right — mini phone preview */}
        <div style={{
          flex: 1, padding: '8px 10px 8px 0',
          display: 'flex', alignItems: 'center',
        }}>
          <MiniPreview themeKey={key} themeData={themeData} />
        </div>

        {/* Active checkmark */}
        {isActive && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <Check style={{ width: 13, height: 13, color: '#111' }} />
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 9999,
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              background: '#0a0514',
              border: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: 'max(96px, calc(72px + env(safe-area-inset-bottom, 16px)))',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
            }}>

            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
            </div>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
            }}>
              <div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: 0 }}>🎨 VIP Theme Collection</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>
                  Choose your vibe · Changes the whole app color
                </p>
              </div>
              <button onClick={onClose} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <X style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>

            {/* Scrollable list */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '14px 14px 8px', WebkitOverflowScrolling: 'touch' }}>

              {/* Free */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Free</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
              {freeThemes.map(([key, themeData]) => renderRow(key, themeData, false))}

              {/* VIP */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 10px' }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#f59e0b', textTransform: 'uppercase' }}>⭐ VIP Exclusive</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(245,158,11,0.2)' }} />
              </div>

              {!hasVIP && (
                <div style={{
                  marginBottom: 12, padding: '10px 14px', borderRadius: 14,
                  background: 'rgba(255,85,0,0.08)', border: '1px solid rgba(255,85,0,0.25)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <Lock style={{ width: 15, height: 15, color: '#f97316', flexShrink: 0 }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
                    Upgrade to <span style={{ color: '#f97316', fontWeight: 700 }}>Spicey VIP</span> to unlock all color themes
                  </p>
                </div>
              )}

              {vipThemes.map(([key, themeData]) => renderRow(key, themeData, !hasVIP))}
            </div>

            {/* Apply Button */}
            <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%', padding: '16px', borderRadius: 20, border: 'none',
                  cursor: 'pointer',
                  background: VIP_THEMES[selected]?.gradient || 'linear-gradient(135deg, #ff5500, #e91e8c)',
                  color: '#fff', fontWeight: 800, fontSize: 16,
                  boxShadow: `0 6px 28px ${VIP_THEMES[selected]?.accent || '#ff5500'}55`,
                  opacity: saving ? 0.7 : 1,
                }}>
                {saving ? 'Saving...' : `✓ Apply ${VIP_THEMES[selected]?.label || ''} Theme`}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}