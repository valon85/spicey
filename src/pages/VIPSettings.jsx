import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Palette, Bell, Shield, Zap, Star,
  TrendingUp, Users,
  Crown, Flame, Diamond, Check, Lock, Globe, Eye, Sparkles
} from 'lucide-react';
import { isAdminEmail } from '@/lib/adminAccess';

export default function VIPSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [profileTheme, setProfileTheme] = useState('default');
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    followers: true,
    mentions: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;

      // Check subscription (admin has all access)
      const subscriptions = await base44.entities.Subscription.filter({ 
        user_id: user.id, 
        status: 'active' 
      });
      
      if (isAdminEmail(user)) {
        setPlanType('business');
      } else if (subscriptions.length > 0) {
        setPlanType(subscriptions[0].plan_type);
      } else {
        navigate('/vip');
        return;
      }

      // Load profile settings
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      if (profiles.length > 0) {
        setProfileTheme(profiles[0].verification_badge || 'default');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async (newSettings) => {
    setSavingNotifications(true);
    try {
      // Save to user profile metadata or a dedicated entity
      const user = await base44.auth.me();
      if (!user) return;
      
      // Store notification preferences in localStorage for now
      // In production, this would save to UserProfile entity
      localStorage.setItem(`notification_prefs_${user.id}`, JSON.stringify(newSettings));
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.textContent = '✓ Notification settings saved';
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(34,197,94,0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        animation: slideUp 0.3s ease-out;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setSavingNotifications(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
      </div>
    );
  }

  const bg = isLightMode ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)';
  const cardBg = isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(20,10,30,0.6)';
  const cardBorder = isLightMode ? '1px solid rgba(160,80,255,0.2)' : '1px solid rgba(255,255,255,0.08)';
  const textColor = isLightMode ? 'hsl(270,20%,12%)' : 'white';
  const subtextColor = isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  const features = [
    {
      icon: Palette,
      title: 'Profile Styling',
      description: 'Customize your profile theme',
      color: '#C100FF',
      action: () => navigate('/profile'),
    },
    {
      icon: Bell,
      title: 'Priority Notifications',
      description: 'Manage notification preferences',
      color: '#FF6A00',
      action: () => {
        // Scroll to notification settings section
        document.getElementById('notification-settings')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      icon: Shield,
      title: 'Enhanced Privacy',
      description: 'Advanced privacy controls',
      color: '#3b82f6',
      action: () => navigate('/settings'),
    },
    {
      icon: Zap,
      title: 'Boost Posts',
      description: 'Increase your reach',
      color: '#f97316',
      action: () => navigate('/explore'), // Will show posts that can be boosted
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'View detailed insights',
      color: '#10b981',
      action: () => navigate('/vip/analytics'),
    },
    {
      icon: Users,
      title: 'Audience Insights',
      description: 'Know your followers',
      color: '#ec4899',
      action: () => navigate('/vip/analytics'), // Audience insights are part of analytics
    },
  ];

  const planFeatures = {
    vip: [
      'Blue Star Badge',
      'Verified Profile',
      'Priority Visibility',
      'Advanced Analytics',
      'Profile Styling',
      'Priority Support',
    ],
    creator: [
      'All VIP Features',
      'Creator Badge',
      'Content Analytics',
      'Post Boosting',
      'Monetization Tools',
      'Priority Creator Support',
    ],
    business: [
      'All Creator Features',
      'Business Badge',
      'Business Analytics',
      'Advertising Tools',
      'Team Management',
      'Priority Business Support',
    ],
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ 
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          background: isLightMode ? 'rgba(248,244,255,0.96)' : 'rgba(8,4,12,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: isLightMode ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.05)',
        }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center" style={{ color: subtextColor }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold" style={{ color: textColor }}>VIP Settings</h1>
          <p className="text-xs" style={{ color: subtextColor }}>
            {planType === 'business' ? 'Business Plan' : planType === 'creator' ? 'Creator Plan' : 'VIP Plan'}
          </p>
        </div>
        {planType === 'business' ? (
          <Diamond className="w-5 h-5 text-purple-400" />
        ) : planType === 'creator' ? (
          <Flame className="w-5 h-5 text-orange-400" />
        ) : (
          <Star className="w-5 h-5 text-blue-400" />
        )}
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Current Plan */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="p-5 rounded-2xl" 
          style={{ 
            background: planType === 'business' 
              ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))'
              : planType === 'creator'
                ? 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))'
                : 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
            border: planType === 'business' 
              ? '1px solid rgba(168,85,247,0.4)'
              : planType === 'creator'
                ? '1px solid rgba(249,115,22,0.4)'
                : '1px solid rgba(59,130,246,0.4)',
          }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ 
                background: planType === 'business' 
                  ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                  : planType === 'creator'
                    ? 'linear-gradient(135deg, #f97316, #ef4444)'
                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
              }}>
              {planType === 'business' ? (
                <Diamond className="w-6 h-6 text-white" />
              ) : planType === 'creator' ? (
                <Flame className="w-6 h-6 text-white" />
              ) : (
                <Star className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold" style={{ color: textColor }}>
                {planType === 'business' ? '👑 Business' : planType === 'creator' ? '🔥 Creator' : '⭐ VIP'}
              </h2>
              <p className="text-xs" style={{ color: subtextColor }}>All premium features unlocked</p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'rgba(34,197,94,0.8)' }}>
              Active
            </div>
          </div>

          <div className="space-y-2">
            {(planFeatures[planType] || planFeatures.vip).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span style={{ color: textColor }}>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: textColor }}>Quick Actions</h3>
            <button
              onClick={() => navigate('/vip/analytics')}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,85,0,0.2)', border: '1px solid rgba(255,85,0,0.4)', color: '#ffaa55' }}>
              View All Analytics →
            </button>
          </div>
          
          <div className="space-y-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={feature.action}
                  className="w-full flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${feature.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold" style={{ color: textColor }}>{feature.title}</p>
                    <p className="text-xs" style={{ color: subtextColor }}>{feature.description}</p>
                  </div>
                  <ArrowLeft className="w-4 h-4 rotate-180" style={{ color: subtextColor }} />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          id="notification-settings"
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Priority Notifications</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(notifications).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <span className="text-sm capitalize font-semibold" style={{ color: textColor }}>{key}</span>
                  <p className="text-xs" style={{ color: subtextColor }}>Get notified instantly</p>
                </div>
                <button
                  onClick={() => {
                    const newSettings = { ...notifications, [key]: !enabled };
                    setNotifications(newSettings);
                    saveNotificationSettings(newSettings);
                  }}
                  disabled={savingNotifications}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    enabled ? 'bg-green-500' : 'bg-gray-600'
                  } ${savingNotifications ? 'opacity-50' : ''}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                    enabled ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
          
          {savingNotifications && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs" style={{ color: subtextColor }}>
              <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
              Saving...
            </div>
          )}
        </motion.div>

        {/* VIP Perks */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,85,0,0.1), rgba(233,30,140,0.1))',
            border: '1px solid rgba(255,85,0,0.25)' 
          }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,85,0,0.2)' }}>
            <Crown className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-bold" style={{ color: textColor }}>VIP Perks</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Sparkles, text: 'Early Access' },
              { icon: Globe, text: 'Global Reach' },
              { icon: Eye, text: 'Priority Feed' },
              { icon: Lock, text: 'Enhanced Security' },
            ].map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold" style={{ color: textColor }}>{perk.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
