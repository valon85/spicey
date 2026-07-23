import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Lock, Shield, EyeOff, Users, HelpCircle, Flag, AlertTriangle, LogOut, Crown, Settings as SettingsIcon, Database, Bell, X, Key, Languages, FileText, Mail, Rocket } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import SpiceyLogoText from '@/components/shared/SpiceyLogoText';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileSheet from '@/components/panels/EditProfileSheet';
import { hasAdminAccess } from '@/lib/adminAccess';

function SettingsRow({ label, sub, onClick, danger, right, isLight }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
      className="w-full flex items-center px-4 py-3 active:opacity-70 transition-all"
      style={{
        background: 'transparent',
        borderBottom: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
      }}>
      <div className="flex-1 text-left">
        <p className="font-semibold text-[13px]" style={{ color: danger ? '#FF3B30' : (isLight ? '#1C1C1E' : 'rgba(255,255,255,0.9)') }}>{label}</p>
        {sub && <p className="text-[10.5px] mt-0.5" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.35)' }}>{sub}</p>}
      </div>
      {right !== undefined ? (
        <span style={{ color: '#FF6B35', fontSize: 11.5, fontWeight: 600 }}>{right}</span>
      ) : (
        <ChevronRight size={14} style={{ color: isLight ? '#C7C7CC' : 'rgba(255,255,255,0.2)' }} />
      )}
    </motion.button>
  );
}

function SectionCard({ title, icon: TitleIcon, iconColor, children, isLight }) {
  return (
    <div style={{ margin: '0 16px 12px' }}>
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        {TitleIcon && <TitleIcon size={14} style={{ color: iconColor || '#FF6B35' }} />}
        <span className="text-[12px] font-bold" style={{ color: isLight ? '#1C1C1E' : 'rgba(255,255,255,0.9)' }}>{title}</span>
      </div>
      <div style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.05)',
        boxShadow: isLight ? '0 2px 16px rgba(255,107,53,0.08)' : 'none',
        border: isLight ? '1px solid rgba(255,107,53,0.1)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        {children}
      </div>
    </div>
  );
}

const isVideoAvatarUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));

function UserAvatarMedia({ src, alt, style }) {
  if (isVideoAvatarUrl(src)) {
    return (
      <span className="spicey-video-avatar-frame" style={style} aria-label={alt}>
        <video
          src={`${src}#t=0.1`}
          muted
          playsInline
          loop
          autoPlay
          className="spicey-video-avatar-crop"
        />
      </span>
    );
  }

  return <img src={src} alt={alt} style={style} />;
}

// Generic bottom sheet panel
function InfoPanel({ open, onClose, title, children, isLight }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50 bg-black/60" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto"
            style={{
              background: isLight ? '#FFFFFF' : '#1C1C1E',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)',
              scrollPaddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 104px)',
              WebkitOverflowScrolling: 'touch',
            }}>
            <div className="sticky top-0 flex items-center justify-between px-5 pt-5 pb-4"
              style={{ background: isLight ? '#FFFFFF' : '#1C1C1E', borderBottom: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="font-bold text-lg" style={{ color: isLight ? '#1C1C1E' : 'white' }}>{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)' }}>
                <X size={16} style={{ color: isLight ? '#1C1C1E' : 'white' }} />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showAdvancedAccount, setShowAdvancedAccount] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const refreshProfileUser = useCallback(async (userId = currentUser?.id) => {
    if (!userId) return;
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_id: userId }, '-updated_date', 1)
        .catch(() => base44.entities.UserProfile.filter({ user_id: userId }, '-created_date', 1))
        .catch(() => base44.entities.UserProfile.filter({ user_id: userId }));
      if (profiles[0]) {
        setProfileUser(profiles[0]);
        setIsPrivate(profiles[0].is_private === true);
      }
    } catch (_) {}
  }, [currentUser?.id]);

  useEffect(() => {
    setIsLight(theme === 'light');
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (hasAdminAccess(authUser)) {
      setIsAdmin(true);
    }
  }, [authUser]);

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) return;
      setCurrentUser(u);
      if (hasAdminAccess(u)) setIsAdmin(true);
      if (u?.id) {
        base44.entities.Subscription.filter({ user_id: u.id, status: 'active' }, '-created_date', 1).then(subs => {
          if (subs.length > 0) setIsVIP(true);
        }).catch(() => {});
        base44.functions.invoke('getUserSubscription', {}).then(response => {
          const data = response.data || response;
          if (data.hasSubscription || u.email === 'info@spicey.live') setIsVIP(true);
        }).catch(() => {
          if (u.email === 'info@spicey.live') setIsVIP(true);
        });
        refreshProfileUser(u.id);
        base44.entities.Block.filter({ blocker_id: u.id }).then(blocks => {
          setBlockedUsers(Array.isArray(blocks) ? blocks : []);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [refreshProfileUser]);

  useEffect(() => {
    const refresh = () => refreshProfileUser();
    window.addEventListener('focus', refresh);
    window.addEventListener('spicey-avatar-updated', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('spicey-avatar-updated', refresh);
    };
  }, [refreshProfileUser]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const result = await base44.functions.invoke('deleteUserAccount', {});
      const data = result?.data ?? result;
      if (data?.error) { setDeleteError(data.error); setDeleting(false); return; }
      await logout();
    } catch (err) {
      setDeleteError(err?.message || 'Something went wrong.');
      setDeleting(false);
    }
  };

  const handleTogglePrivate = async () => {
    const newVal = !isPrivate;
    setIsPrivate(newVal);
    if (currentUser?.id) {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { is_private: newVal });
      }
    }
  };

  const handleUnblock = async (blockRecord) => {
    await base44.entities.Block.delete(blockRecord.id);
    setBlockedUsers(prev => prev.filter(b => b.id !== blockRecord.id));
  };

  const displayName = profileUser?.full_name || currentUser?.full_name || currentUser?.email?.split('@')[0] || 'User';
  const username = profileUser?.username || currentUser?.email?.split('@')[0] || 'user';
  const avatarSrc = profileUser?.avatar_url || currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff5500&color=fff&size=256`;
  const followersCount = profileUser?.followers_count || 0;
  const followingCount = profileUser?.following_count || 0;

  const pageBg = usePageBackground();

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
    background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.07)',
    border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
    color: isLight ? '#1C1C1E' : 'white', outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100dvh', height: '100dvh', overflowY: 'auto',
      WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain',
      background: pageBg, position: 'relative',
    }}>

      {/* Header */}
      <div className="sticky top-0 z-40"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          background: isLight ? 'transparent' : (document.documentElement.getAttribute('data-vip-theme') ? 'rgba(0,0,0,0.3)' : 'rgba(6,3,10,0.97)'),
          backdropFilter: 'blur(20px)',
        }}>
        <div className="flex items-center justify-between px-4 pb-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)' }}>
            <ChevronLeft size={20} style={{ color: isLight ? '#1C1C1E' : 'white' }} />
          </motion.button>
          <SpiceyLogoText height={38} />
          <div className="w-9 h-9" />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)' }}>

        {/* Profile Card */}
        <div style={{ margin: '0 16px 16px' }}>
          <div style={{
            borderRadius: 20,
            background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
            border: isLight ? '1px solid rgba(255,107,53,0.12)' : '1px solid rgba(255,255,255,0.06)',
            padding: '16px',
          }}>
            <div className="flex items-center gap-3">
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ padding: 2, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #e91e8c)' }}>
                  <div style={{ padding: 2, borderRadius: '50%', background: isLight ? 'white' : '#000' }}>
                    <UserAvatarMedia src={avatarSrc} alt={displayName} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                  </div>
                </div>
                {isVIP && (
                  <div style={{ position: 'absolute', top: -5, right: -5, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.45))' }}>
                    <VerifiedBadge type="vip" size="md" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: isLight ? '#1C1C1E' : 'white', fontSize: 16, fontWeight: 700 }}>{displayName}</span>
                </div>
                <p style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.45)', fontSize: 13, margin: '2px 0 6px' }}>@{username}</p>
                {isVIP && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: 20, padding: '3px 10px' }}>
                    <span style={{ fontSize: 11 }}>⭐</span>
                    <span style={{ color: '#FF6B35', fontSize: 11, fontWeight: 700 }}>VIP</span>
                  </div>
                )}
              </div>
              <button onClick={() => setShowEditProfile(true)}>
                <ChevronRight size={18} style={{ color: isLight ? '#C7C7CC' : 'rgba(255,255,255,0.2)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', marginTop: 14, paddingTop: 14, borderTop: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { val: followersCount, label: 'Followers', highlight: true },
                { val: followingCount, label: 'Following' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ color: s.highlight ? '#e91e8c' : (isLight ? '#1C1C1E' : 'white'), fontSize: 18, fontWeight: 800, margin: 0 }}>{s.val}</p>
                  <p style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Account */}
        <SectionCard title="Account" icon={User} iconColor="#8b5cf6" isLight={isLight}>
          <SettingsRow icon={User} iconBg="linear-gradient(135deg, #8b5cf6, #5E5CE6)" label="Edit Profile" sub="Update your info and photo" onClick={() => setShowEditProfile(true)} isLight={isLight} />
          <SettingsRow icon={Key} iconBg="linear-gradient(135deg, #8b5cf6, #e91e8c)" label="Security" sub="Password and login activity" onClick={() => setShowSecurity(true)} isLight={isLight} />
        </SectionCard>

        {/* Privacy */}
        <SectionCard title="Privacy" icon={Lock} iconColor="#8b5cf6" isLight={isLight}>
          <div className="flex items-center px-4 py-3" style={{ borderBottom: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex-1 text-left">
              <p className="font-semibold text-[13px]" style={{ color: isLight ? '#1C1C1E' : 'rgba(255,255,255,0.9)' }}>Private Account</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.35)' }}>{isPrivate ? 'Only followers see your content' : 'Everyone can see your content'}</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleTogglePrivate}
              style={{ width: 40, height: 23, borderRadius: 12, background: isPrivate ? '#FF6B35' : 'rgba(120,120,128,0.2)', position: 'relative', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background 0.25s' }}>
              <motion.div animate={{ x: isPrivate ? 19 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ position: 'absolute', top: 2, width: 19, height: 19, borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }} />
            </motion.button>
          </div>
          <SettingsRow icon={EyeOff} iconBg="linear-gradient(135deg, #8b5cf6, #e91e8c)" label="Blocked Users" sub={`${blockedUsers.length} blocked accounts`} onClick={() => setShowBlocked(true)} isLight={isLight} />
        </SectionCard>

        {/* Preferences */}
        <SectionCard title="Preferences" icon={SettingsIcon} iconColor="#8b5cf6" isLight={isLight}>
          <SettingsRow icon={Bell} iconBg="linear-gradient(135deg, #8b5cf6, #e91e8c)" label="Notifications" sub="Customize alerts" onClick={() => setShowNotifications(true)} isLight={isLight} />
          <SettingsRow icon={Languages} iconBg="linear-gradient(135deg, #8b5cf6, #5E5CE6)" label="Language" sub="Choose your language" onClick={() => setShowLanguage(true)} isLight={isLight} right="English" />
          {/* Dark Mode toggle */}
          <div className="flex items-center px-4 py-3">
            <div className="flex-1 text-left">
              <p className="font-semibold text-[13px]" style={{ color: isLight ? '#1C1C1E' : 'rgba(255,255,255,0.9)' }}>Dark Mode</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.35)' }}>Switch between light and dark</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={toggleTheme}
              style={{ width: 40, height: 23, borderRadius: 12, background: isDarkMode ? '#FF6B35' : 'rgba(120,120,128,0.2)', position: 'relative', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background 0.25s' }}>
              <motion.div animate={{ x: isDarkMode ? 19 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ position: 'absolute', top: 2, width: 19, height: 19, borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }} />
            </motion.button>
          </div>
        </SectionCard>

        {/* VIP */}
        <SectionCard title="VIP & Creator" icon={Crown} iconColor="#FF9500" isLight={isLight}>
          <SettingsRow icon={Crown} iconBg="linear-gradient(135deg, #FF9500, #FF6B35)" label="Spicey VIP" sub="Unlock premium features & badges" onClick={() => navigate('/vip')} isLight={isLight} />
        </SectionCard>

        {/* Admin */}
        {isAdmin && (
          <SectionCard title="Admin Panel" icon={Shield} iconColor="#FF3B30" isLight={isLight}>
            <SettingsRow icon={Rocket} iconBg="linear-gradient(135deg, #FF6B35, #e91e8c, #8b5cf6)" label="Publish & Downloads" sub="Web publish, iOS and Android release tools" onClick={() => navigate('/admin/release')} isLight={isLight} />
            <SettingsRow icon={Database} iconBg="linear-gradient(135deg, #FF3B30, #FF6B35)" label="Admin Dashboard" sub="Manage users & content" onClick={() => navigate('/admin/dashboard')} isLight={isLight} />
            <SettingsRow icon={Users} iconBg="linear-gradient(135deg, #FF3B30, #e91e8c)" label="User Management" onClick={() => navigate('/admin/users')} isLight={isLight} />
            <SettingsRow icon={Shield} iconBg="linear-gradient(135deg, #FF3B30, #8b5cf6)" label="Moderation Panel" onClick={() => navigate('/admin/moderation')} isLight={isLight} />
            <SettingsRow icon={Bell} iconBg="linear-gradient(135deg, #FF3B30, #30B0C7)" label="Communication Center" onClick={() => navigate('/admin/comms')} isLight={isLight} />
            <SettingsRow icon={Crown} iconBg="linear-gradient(135deg, #FF3B30, #FF9500)" label="VIP Management" onClick={() => navigate('/admin/vip-management')} isLight={isLight} />
          </SectionCard>
        )}

        {/* Support */}
        <SectionCard title="Support & About" icon={HelpCircle} iconColor="#8b5cf6" isLight={isLight}>
          <SettingsRow icon={HelpCircle} iconBg="linear-gradient(135deg, #8b5cf6, #5E5CE6)" label="Help Center" sub="Get help and support" onClick={() => setShowHelp(true)} isLight={isLight} />
          <SettingsRow icon={Flag} iconBg="linear-gradient(135deg, #8b5cf6, #e91e8c)" label="Report a Problem" onClick={() => setShowReport(true)} isLight={isLight} />
          <SettingsRow icon={FileText} iconBg="linear-gradient(135deg, #8b5cf6, #5E5CE6)" label="About Spicey" sub="Version 1.0.0" onClick={() => setShowAbout(true)} isLight={isLight} />
        </SectionCard>

        {/* Logout stays accessible, but always requires confirmation. */}
        <div style={{ margin: '0 16px 12px' }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: '100%', borderRadius: 14, background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
              border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
              padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
            <div className="flex-1 text-left">
              <p style={{ color: isLight ? '#1C1C1E' : '#FFFFFF', fontSize: 13, fontWeight: 700, margin: 0 }}>Log Out</p>
              <p style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.35)', fontSize: 10.5, margin: '2px 0 0' }}>Confirmation required</p>
            </div>
            <ChevronRight size={14} style={{ color: isLight ? '#C7C7CC' : 'rgba(255,255,255,0.2)' }} />
          </motion.button>
        </div>

      </div>

      {/* ── PANELS ── */}

      {/* Edit Profile */}
      <EditProfileSheet open={showEditProfile} onClose={() => setShowEditProfile(false)} user={currentUser}
        onSaved={(data) => { setProfileUser(prev => ({ ...prev, ...data })); setShowEditProfile(false); }} />

      {/* Security Panel */}
      <InfoPanel open={showSecurity} onClose={() => setShowSecurity(false)} title="Security" isLight={isLight}>
        <div className="space-y-4">
          <div style={{ padding: 16, borderRadius: 14, background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.06)', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: isLight ? '#1C1C1E' : 'white' }}>Change Password</p>
            <p className="text-xs" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)' }}>To change your password, use the "Forgot Password" option on the login screen after logging out.</p>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.06)', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: isLight ? '#1C1C1E' : 'white' }}>Account Email</p>
            <p className="text-xs" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)' }}>{currentUser?.email || '—'}</p>
          </div>
          <div style={{ padding: 16, borderRadius: 14, background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.06)', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: isLight ? '#1C1C1E' : 'white' }}>Login Sessions</p>
            <p className="text-xs" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)' }}>You are currently logged in on this device.</p>
          </div>
          <button type="button" onClick={() => { setShowSecurity(false); setShowAdvancedAccount(true); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: 'transparent', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)', color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.45)' }}>
            <span className="text-xs font-semibold">Advanced Account Controls</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </InfoPanel>

      <InfoPanel open={showAdvancedAccount} onClose={() => setShowAdvancedAccount(false)} title="Advanced Account Controls" isLight={isLight}>
        <div className="space-y-3">
          <p className="text-xs px-1 pb-1" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)' }}>These actions can hide or permanently remove your account. Review each option carefully.</p>
          <SettingsRow label="Deactivate Account" sub="Temporarily hide your profile" onClick={() => setShowDeactivateConfirm(true)} danger isLight={isLight} />
          <SettingsRow label="Permanently Delete Account" sub="Requires typing DELETE to continue" onClick={() => { setDeleteConfirmationText(''); setShowDeleteConfirm(true); }} danger isLight={isLight} />
        </div>
      </InfoPanel>

      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutConfirm(false)} className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }} className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-[60] max-w-sm mx-auto rounded-3xl p-6" style={{ background: isLight ? '#FFFFFF' : '#1C1C1E', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,59,48,0.12)' }}><LogOut size={25} style={{ color: '#FF3B30' }} /></div>
              <p className="font-bold text-lg text-center mb-2" style={{ color: isLight ? '#1C1C1E' : 'white' }}>Log out of Spicey?</p>
              <p className="text-sm text-center mb-6" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.55)' }}>You will need to sign in again on this device.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-2xl font-semibold text-sm" style={{ background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.1)', color: isLight ? '#1C1C1E' : 'white' }}>Cancel</button>
                <button onClick={async () => { setShowLogoutConfirm(false); await logout(); }} className="flex-1 py-3 rounded-2xl font-bold text-sm text-white" style={{ background: '#FF3B30' }}>Log Out</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Blocked Users Panel */}
      <InfoPanel open={showBlocked} onClose={() => setShowBlocked(false)} title="Blocked Users" isLight={isLight}>
        {blockedUsers.length === 0 ? (
          <div className="text-center py-8">
            <EyeOff size={40} style={{ color: isLight ? '#C7C7CC' : 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
            <p style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)', fontSize: 14 }}>No blocked users</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map(b => (
              <div key={b.id} className="flex items-center justify-between" style={{ padding: '12px 14px', borderRadius: 12, background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.06)' }}>
                <p className="font-semibold text-sm" style={{ color: isLight ? '#1C1C1E' : 'white' }}>@{b.blocked_username || b.blocked_id}</p>
                <button onClick={() => handleUnblock(b)} className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,59,48,0.12)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.25)' }}>
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </InfoPanel>

      {/* Notifications Panel */}
      <InfoPanel open={showNotifications} onClose={() => setShowNotifications(false)} title="Notifications" isLight={isLight}>
        <div className="space-y-3">
          {['Likes & Reactions', 'Comments', 'New Followers', 'Direct Messages', 'Live Streams'].map(label => (
            <div key={label} className="flex items-center justify-between" style={{ padding: '12px 14px', borderRadius: 12, background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.06)' }}>
              <p className="font-semibold text-sm" style={{ color: isLight ? '#1C1C1E' : 'white' }}>{label}</p>
              <div style={{ width: 40, height: 24, borderRadius: 12, background: '#FF6B35', position: 'relative' }}>
                <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-center" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.35)', marginTop: 8 }}>Manage device-level notifications from your phone's Settings app.</p>
        </div>
      </InfoPanel>

      {/* Language Panel */}
      <InfoPanel open={showLanguage} onClose={() => setShowLanguage(false)} title="Language" isLight={isLight}>
        <div className="space-y-2">
          {['English', 'Albanian (Shqip)', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Arabic'].map((lang, i) => (
            <button key={lang} className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: i === 0 ? 'rgba(255,107,53,0.1)' : (isLight ? '#F2F2F7' : 'rgba(255,255,255,0.05)'), border: i === 0 ? '1px solid rgba(255,107,53,0.3)' : 'none' }}>
              <span className="font-semibold text-sm" style={{ color: i === 0 ? '#FF6B35' : (isLight ? '#1C1C1E' : 'white') }}>{lang}</span>
              {i === 0 && <span style={{ color: '#FF6B35', fontSize: 12, fontWeight: 700 }}>✓ Active</span>}
            </button>
          ))}
        </div>
      </InfoPanel>



      {/* About Panel */}
      <InfoPanel open={showAbout} onClose={() => setShowAbout(false)} title="About Spicey" isLight={isLight}>
        <div className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <SpiceyLogoText height={90} />
          </div>
          <p style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)', fontSize: 13 }}>Version 1.0.0</p>
          <div style={{ height: 1, background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)', margin: '12px 0' }} />
          <p style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>
            Spicey is the high-energy social platform for authentic connection, creativity, and community.
          </p>
          <div className="flex gap-2 justify-center flex-wrap pt-2">
            <button onClick={() => window.open('mailto:info@spicey.live', '_blank')} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,107,53,0.12)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.25)' }}>Contact Us</button>
            <button onClick={() => navigate('/privacy-policy')} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.07)', color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.5)' }}>Privacy Policy</button>
            <button onClick={() => navigate('/terms-of-service')} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.07)', color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.5)' }}>Terms of Service</button>
          </div>
        </div>
      </InfoPanel>

      {/* Help Center Panel */}
      <InfoPanel open={showHelp} onClose={() => setShowHelp(false)} title="Help Center" isLight={isLight}>
        <div className="space-y-3">
          {[
            { q: '🔒 How do I make my account private?', a: 'Go to Settings → Privacy → toggle "Private Account" on.' },
            { q: '🖼️ How do I change my avatar?', a: 'Go to your Profile and tap the camera icon on your avatar.' },
            { q: '🚫 How do I block someone?', a: 'Go to their profile, tap the 3-dot menu, and select "Block".' },
            { q: '🗑️ How do I delete a post?', a: 'Long-press on any post in your profile grid and tap "Delete Post".' },
            { q: '💎 What is Spicey VIP?', a: 'VIP gives you exclusive badges, boosted visibility, and premium features. Tap "Spicey VIP" in settings to learn more.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '14px', borderRadius: 14, background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.06)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: isLight ? '#1C1C1E' : 'white' }}>{item.q}</p>
              <p className="text-xs" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.45)' }}>{item.a}</p>
            </div>
          ))}
          <button onClick={() => window.open('mailto:info@spicey.live', '_blank')}
            className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #5E5CE6)', color: 'white', marginTop: 8 }}>
            <Mail size={16} /> Email Support
          </button>
        </div>
      </InfoPanel>

      {/* Report a Problem Panel */}
      <InfoPanel open={showReport} onClose={() => { setShowReport(false); setReportText(''); setReportSent(false); }} title="Report a Problem" isLight={isLight}>
        {reportSent ? (
          <div className="text-center py-8">
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p className="font-bold text-lg mb-2" style={{ color: isLight ? '#1C1C1E' : 'white' }}>Report Sent!</p>
            <p className="text-sm" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.45)' }}>Thank you for your feedback. Our team will review it shortly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.45)' }}>Describe the problem you encountered and we'll look into it.</p>
            <textarea
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              style={{ width: '100%', padding: '12px', borderRadius: 14, fontSize: 14, background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.07)', border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)', color: isLight ? '#1C1C1E' : 'white', outline: 'none', resize: 'none' }}
            />
            <button
              onClick={async () => {
                if (!reportText.trim()) return;
                await base44.integrations.Core.SendEmail({ to: 'info@spicey.live', subject: `Bug Report from ${currentUser?.email || 'user'}`, body: reportText });
                setReportSent(true);
              }}
              disabled={!reportText.trim()}
              className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: reportText.trim() ? 'linear-gradient(135deg, #8b5cf6, #e91e8c)' : 'rgba(255,255,255,0.08)', color: 'white', opacity: reportText.trim() ? 1 : 0.4 }}>
              <Flag size={16} /> Send Report
            </button>
          </div>
        )}
      </InfoPanel>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteConfirm(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto rounded-3xl p-6"
              style={{ background: isLight ? '#FFFFFF' : '#1C1C1E', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,59,48,0.12)' }}>
                <AlertTriangle size={26} style={{ color: '#FF3B30' }} />
              </div>
              <p className="font-bold text-lg text-center mb-2" style={{ color: isLight ? '#1C1C1E' : 'white' }}>Delete Account?</p>
              <p className="text-sm text-center mb-6" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.55)' }}>This cannot be undone. All your posts, messages, and profile data will be permanently deleted.</p>
              <label className="block text-xs font-semibold mb-2" style={{ color: isLight ? '#636366' : 'rgba(255,255,255,0.65)' }}>Type DELETE to confirm</label>
              <input value={deleteConfirmationText} onChange={(event) => setDeleteConfirmationText(event.target.value)} autoCapitalize="characters" autoCorrect="off" placeholder="DELETE" className="w-full px-4 py-3 rounded-2xl mb-4 text-sm font-bold outline-none" style={{ background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,59,48,0.25)', color: isLight ? '#1C1C1E' : 'white' }} />
              {deleteError && <p className="text-xs text-center mb-4" style={{ color: '#FF3B30' }}>{deleteError}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmationText(''); }} disabled={deleting} className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.1)', color: isLight ? '#1C1C1E' : 'white' }}>Cancel</button>
                <button onClick={handleDeleteAccount} disabled={deleting || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'} className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: '#FF3B30', opacity: deleteConfirmationText.trim().toUpperCase() === 'DELETE' ? 1 : 0.4 }}>{deleting ? 'Deleting…' : 'Delete'}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deactivate Modal */}
      <AnimatePresence>
        {showDeactivateConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeactivateConfirm(false)}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto rounded-3xl p-6"
              style={{ background: isLight ? '#FFFFFF' : '#1C1C1E', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,149,0,0.12)' }}>
                <AlertTriangle size={26} style={{ color: '#FF9500' }} />
              </div>
              <p className="font-bold text-lg text-center mb-2" style={{ color: isLight ? '#1C1C1E' : 'white' }}>Deactivate Account?</p>
              <p className="text-sm text-center mb-6" style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.55)' }}>Your profile will be hidden until you log back in. Your content will be preserved.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeactivateConfirm(false)} className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.1)', color: isLight ? '#1C1C1E' : 'white' }}>Cancel</button>
                <button onClick={() => setShowDeactivateConfirm(false)} className="flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: '#FF9500' }}>Deactivate</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
