import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Palette, BarChart2, Shield, ChevronLeft, Check, Star, Flame, Diamond, Users, Heart, Eye, TrendingUp, Megaphone, Zap, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTheme, VIP_THEMES } from '@/lib/ThemeContext';
import ProfileThemePicker from '@/components/profile/ProfileThemePicker';
import VerifiedBadge from '@/components/shared/VerifiedBadge';

const BADGE_OPTIONS = [
  { type: 'vip', label: 'VIP Crown', desc: 'Purple gradient star', plans: ['vip', 'creator', 'business'] },
  { type: 'creator', label: 'Creator', desc: 'Blue/purple gradient star', plans: ['creator', 'business'] },
  { type: 'business', label: 'Business Gold', desc: 'Gold gradient star', plans: ['business'] },
  { type: 'verified', label: 'Verified Blue', desc: 'Classic blue check', plans: ['creator', 'business'] },
];

export default function VIPDashboard() {
  const navigate = useNavigate();
  const { theme: activeTheme, changeTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [badgePickerOpen, setBadgePickerOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [savingBadge, setSavingBadge] = useState(false);
  const [badgeSaved, setBadgeSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-vip-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        if (!u) { navigate('/vip'); return; }
        setUser(u);

        const [profiles, subs] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }),
          base44.entities.Subscription.filter({ user_id: u.id, status: 'active' }, '-created_date', 1),
        ]);

        const p = profiles[0] || null;
        setProfile(p);
        setSelectedBadge(p?.verification_badge || null);

        // Admin gets full access
        if (u.email === 'info@spicey.live') {
          setSubscription({ plan_type: 'business', status: 'active', isAdmin: true });
        } else if (subs.length > 0) {
          setSubscription(subs[0]);
        } else {
          // No subscription — redirect to VIP page
          navigate('/vip');
          return;
        }

        // Load simple analytics
        if (p?.user_id) {
          const [posts, followers] = await Promise.all([
            base44.entities.Post.filter({ author_id: u.id }, '-created_date', 50),
            base44.entities.Follow.filter({ following_id: u.id }, '-created_date', 100),
          ]);
          const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
          const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
          setAnalytics({
            posts: posts.length,
            followers: followers.length,
            totalLikes,
            totalComments,
            avgLikes: posts.length ? Math.round(totalLikes / posts.length) : 0,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveBadge = async () => {
    if (!profile || !selectedBadge) return;
    setSavingBadge(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        verification_badge: selectedBadge,
        verified: true,
      });
      setProfile(prev => ({ ...prev, verification_badge: selectedBadge, verified: true }));
      setBadgeSaved(true);
      setTimeout(() => setBadgeSaved(false), 2000);
      setBadgePickerOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingBadge(false);
    }
  };

  const planLabel = subscription?.plan_type === 'vip' ? 'Spicey VIP 👑'
    : subscription?.plan_type === 'creator' ? 'Spicey Creator 🔥'
    : subscription?.plan_type === 'business' ? 'Spicey Business 💎'
    : 'Spicey VIP';

  const planGradient = subscription?.plan_type === 'creator'
    ? 'linear-gradient(135deg, #f97316, #ef4444)'
    : subscription?.plan_type === 'business'
    ? 'linear-gradient(135deg, #FFD700, #B8860B)'
    : 'linear-gradient(135deg, #9B30FF, #6A0DAD)';

  const bg = isLight ? '#f8f4ff' : '#08030f';
  const cardBg = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)';
  const cardBorder = isLight ? '1px solid rgba(160,80,255,0.15)' : '1px solid rgba(255,255,255,0.08)';
  const textColor = isLight ? '#1a0a2e' : '#ffffff';
  const subColor = isLight ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  const allowedBadges = BADGE_OPTIONS.filter(b => subscription && b.plans.includes(subscription.plan_type));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(155,48,255,0.3)', borderTop: '3px solid #9B30FF', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: 120 }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 12,
          background: isLight ? 'rgba(248,244,255,0.96)' : 'rgba(8,3,15,0.96)',
          backdropFilter: 'blur(20px)',
          borderBottom: isLight ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.05)',
        }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)' }}>
          <ChevronLeft size={20} style={{ color: textColor }} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold" style={{ color: textColor }}>VIP Dashboard</h1>
          <p className="text-xs" style={{ color: subColor }}>{planLabel}</p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
          style={{ background: planGradient }}>
          ACTIVE
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">

        {/* Plan Banner */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="p-5 rounded-3xl"
          style={{ background: planGradient, boxShadow: '0 8px 32px rgba(155,48,255,0.35)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              {subscription?.plan_type === 'creator' ? <Flame className="w-7 h-7 text-white" />
                : subscription?.plan_type === 'business' ? <Diamond className="w-7 h-7 text-white" />
                : <Crown className="w-7 h-7 text-white" />}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-white text-lg">{planLabel}</p>
              <p className="text-sm text-white/70">
                {subscription?.isAdmin ? 'Admin · All features unlocked'
                  : subscription?.current_period_end
                  ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : 'Active subscription'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Analytics */}
        {analytics && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
            <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: textColor }}>
              <BarChart2 size={16} style={{ color: '#9B30FF' }} /> Analytics
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Posts', value: analytics.posts, icon: Zap, color: '#9B30FF' },
                { label: 'Followers', value: analytics.followers, icon: Users, color: '#e91e8c' },
                { label: 'Total Likes', value: analytics.totalLikes, icon: Heart, color: '#ef4444' },
                { label: 'Avg Likes/Post', value: analytics.avgLikes, icon: TrendingUp, color: '#22c55e' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
                  <stat.icon size={18} style={{ color: stat.color, marginBottom: 8 }} />
                  <p className="text-2xl font-extrabold" style={{ color: textColor }}>{stat.value.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: subColor }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIP Actions */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: textColor }}>
            <Crown size={16} style={{ color: '#9B30FF' }} /> VIP Features
          </p>
          <div className="space-y-3">

            {/* Change Badge */}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => setBadgePickerOpen(true)}
              className="w-full p-4 rounded-2xl flex items-center gap-4"
              style={{ background: cardBg, border: cardBorder }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #9B30FF, #6A0DAD)' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm" style={{ color: textColor }}>Verification Badge</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>
                  {profile?.verification_badge
                    ? `Active: ${profile.verification_badge.charAt(0).toUpperCase() + profile.verification_badge.slice(1)} badge`
                    : 'Choose your VIP badge'}
                </p>
              </div>
              {profile?.verification_badge && (
                <VerifiedBadge type={profile.verification_badge} size="lg" />
              )}
              <div className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #9B30FF, #6A0DAD)', color: 'white' }}>
                Change
              </div>
            </motion.button>

            {/* Change Theme */}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => setThemePickerOpen(true)}
              className="w-full p-4 rounded-2xl flex items-center gap-4"
              style={{ background: cardBg, border: cardBorder }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a733ff, #e91e8c)' }}>
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm" style={{ color: textColor }}>App Color Theme</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>
                  {VIP_THEMES[activeTheme]?.label || 'Dark Mode'} · tap to change
                </p>
              </div>
              <div className="flex gap-1">
                {(VIP_THEMES[activeTheme]?.preview || ['#1a0a2e', '#ff5500', '#e91e8c']).map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #a733ff, #e91e8c)', color: 'white' }}>
                Change
              </div>
            </motion.button>

            {/* Boost a Post */}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/profile')}
              className="w-full p-4 rounded-2xl flex items-center gap-4"
              style={{ background: cardBg, border: cardBorder }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm" style={{ color: textColor }}>Boost a Post</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>Amplify your reach on any post</p>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white' }}>
                Go
              </div>
            </motion.button>

            {/* Priority Visibility */}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/explore')}
              className="w-full p-4 rounded-2xl flex items-center gap-4"
              style={{ background: cardBg, border: cardBorder }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm" style={{ color: textColor }}>Priority Visibility</p>
                <p className="text-xs mt-0.5" style={{ color: subColor }}>You appear higher in search & explore</p>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                Active ✓
              </div>
            </motion.button>

            {/* Manage Subscription */}
            {!subscription?.isAdmin && (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/settings')}
                className="w-full p-4 rounded-2xl flex items-center gap-4"
                style={{ background: cardBg, border: cardBorder }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #64748b, #475569)' }}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm" style={{ color: textColor }}>Manage Subscription</p>
                  <p className="text-xs mt-0.5" style={{ color: subColor }}>Cancel or upgrade your plan</p>
                </div>
                <div className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: subColor, border: cardBorder }}>
                  Settings
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Theme Picker */}
      <ProfileThemePicker
        open={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
        currentTheme={activeTheme}
        hasVIP={true}
        onThemeChange={(t) => changeTheme(t)}
      />

      {/* Badge Picker Sheet */}
      <AnimatePresence>
        {badgePickerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBadgePickerOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
                borderTopLeftRadius: 28, borderTopRightRadius: 28,
                background: '#0a0514',
                border: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: 'max(32px, env(safe-area-inset-bottom, 20px))',
              }}>
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
              </div>
              <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: 0 }}>🏅 Choose Your Badge</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Select the badge shown on your profile</p>
              </div>
              <div style={{ padding: '16px 16px' }}>
                {allowedBadges.map((badge) => {
                  const isActive = selectedBadge === badge.type;
                  return (
                    <motion.button key={badge.type} whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedBadge(badge.type)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px', borderRadius: 20, marginBottom: 10,
                        background: isActive ? 'rgba(155,48,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: isActive ? '2px solid rgba(155,48,255,0.6)' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                      }}>
                      <VerifiedBadge type={badge.type} size="xl" />
                      <div className="flex-1 text-left">
                        <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0 }}>{badge.label}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>{badge.desc}</p>
                      </div>
                      {isActive && (
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#9B30FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={handleSaveBadge}
                  disabled={savingBadge || !selectedBadge}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 20, border: 'none',
                    background: 'linear-gradient(135deg, #9B30FF, #6A0DAD)',
                    color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                    boxShadow: '0 6px 28px rgba(155,48,255,0.5)',
                    opacity: savingBadge ? 0.7 : 1,
                  }}>
                  {savingBadge ? 'Saving...' : badgeSaved ? '✓ Saved!' : 'Apply Badge'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}