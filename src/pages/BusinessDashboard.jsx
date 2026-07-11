import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Diamond, BarChart3, Building, Users, DollarSign,
  Target, Megaphone, Briefcase, Settings, Crown, Award, Check,
  TrendingUp, Activity, Calendar, FileText, Shield, Globe, Plus,
  Zap, Eye, MousePointer, TrendingDown, Star, Flame, TrendingUp as TrendingUpIcon
} from 'lucide-react';

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [applyingBadge, setApplyingBadge] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) return;
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      const userProfile = profiles[0];
      setProfile(userProfile);

      // Load real analytics
      const analyticsRes = await base44.functions.invoke('getAnalytics', {});
      const analytics = analyticsRes.data || analyticsRes;
      
      setStats(analytics.overview);
    } catch (error) {
      console.error('Failed to load Business dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBadge = async (badgeType) => {
    setApplyingBadge(badgeType);
    try {
      const res = await base44.functions.invoke('applyBadge', { badgeType });
      const data = res.data || res;
      if (data.success) {
        setProfile(prev => ({ ...prev, verification_badge: badgeType, verified: true }));
        alert(data.message);
      }
    } catch (error) {
      const errData = error?.response?.data || error;
      if (errData.requiresSubscription) {
        alert('You need an active subscription to apply this badge. Please upgrade your plan.');
        navigate('/vip');
      } else {
        alert(errData?.error || 'Failed to apply badge');
      }
    } finally {
      setApplyingBadge(false);
    }
  };

  const bg = isLightMode ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)';
  const cardBg = isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(20,10,30,0.6)';
  const cardBorder = isLightMode ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(168,85,247,0.3)';
  const textColor = isLightMode ? 'hsl(270,20%,12%)' : 'white';
  const subtextColor = isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(168,85,247,0.2)', borderTopColor: '#a855f7' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ 
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          background: isLightMode ? 'rgba(248,244,255,0.96)' : 'rgba(8,4,12,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: isLightMode ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(168,85,247,0.3)',
        }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center" style={{ color: subtextColor }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Business Dashboard</h1>
            <Diamond className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-xs" style={{ color: subtextColor }}>Grow your business on Spicey</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Business Status */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
            border: '1px solid rgba(168,85,247,0.4)',
          }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                <Diamond className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: textColor }}>💎 Spicey Business</h2>
                <p className="text-sm" style={{ color: subtextColor }}>
                  {profile?.verification_badge === 'business' ? '✓ Verified Business' : 'Business Account Pro'}
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: profile?.verification_badge === 'business' ? 'rgba(34,197,94,0.8)' : 'rgba(255,150,0,0.8)' }}>
              {profile?.verification_badge === 'business' ? '✓ Active' : '⏳ Pending'}
            </div>
          </div>

          {/* Business Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.totalPosts || 0}</p>
              <p className="text-xs" style={{ color: subtextColor }}>Posts</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.totalReach || 0}</p>
              <p className="text-xs" style={{ color: subtextColor }}>Reach</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.engagementRate || 0}%</p>
              <p className="text-xs" style={{ color: subtextColor }}>Engagement</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.followers || 0}</p>
              <p className="text-xs" style={{ color: subtextColor }}>Followers</p>
            </div>
          </div>
        </motion.div>

        {/* Apply Badge Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Apply Verification Badge</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleApplyBadge('vip')}
              disabled={applyingBadge === 'vip'}
              className="p-4 rounded-xl text-center"
              style={{ 
                background: profile?.verification_badge === 'vip' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                border: profile?.verification_badge === 'vip' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)'
              }}>
              <Star className="w-6 h-6 mx-auto mb-2" style={{ color: '#3b82f6' }} />
              <p className="text-xs font-bold" style={{ color: textColor }}>VIP Star</p>
              <p className="text-[10px]" style={{ color: subtextColor }}>Blue badge</p>
              {profile?.verification_badge === 'vip' && (
                <Check className="w-4 h-4 mx-auto mt-2 text-green-400" />
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleApplyBadge('creator')}
              disabled={applyingBadge === 'creator'}
              className="p-4 rounded-xl text-center"
              style={{ 
                background: profile?.verification_badge === 'creator' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.03)',
                border: profile?.verification_badge === 'creator' ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.05)'
              }}>
              <Flame className="w-6 h-6 mx-auto mb-2" style={{ color: '#f97316' }} />
              <p className="text-xs font-bold" style={{ color: textColor }}>Creator Fire</p>
              <p className="text-[10px]" style={{ color: subtextColor }}>Orange badge</p>
              {profile?.verification_badge === 'creator' && (
                <Check className="w-4 h-4 mx-auto mt-2 text-green-400" />
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleApplyBadge('business')}
              disabled={applyingBadge === 'business'}
              className="p-4 rounded-xl text-center"
              style={{ 
                background: profile?.verification_badge === 'business' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                border: profile?.verification_badge === 'business' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.05)'
              }}>
              <Diamond className="w-6 h-6 mx-auto mb-2" style={{ color: '#a855f7' }} />
              <p className="text-xs font-bold" style={{ color: textColor }}>Business</p>
              <p className="text-[10px]" style={{ color: subtextColor }}>Purple badge</p>
              {profile?.verification_badge === 'business' && (
                <Check className="w-4 h-4 mx-auto mt-2 text-green-400" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/vip/analytics')}
              className="p-4 rounded-xl text-left"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(34,197,94,0.3)' }}>
              <BarChart3 className="w-6 h-6 mb-2 text-green-400" />
              <p className="text-sm font-bold" style={{ color: textColor }}>Analytics</p>
              <p className="text-xs" style={{ color: subtextColor }}>Detailed insights</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/business/create-ad')}
              className="p-4 rounded-xl text-left"
              style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
              <Megaphone className="w-6 h-6 mb-2 text-pink-400" />
              <p className="text-sm font-bold" style={{ color: textColor }}>Ad Campaign</p>
              <p className="text-xs" style={{ color: subtextColor }}>Create ads</p>
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/profile')}
              className="p-4 rounded-xl text-left"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(59,130,246,0.3)' }}>
              <Building className="w-6 h-6 mb-2 text-blue-400" />
              <p className="text-sm font-bold" style={{ color: textColor }}>Profile</p>
              <p className="text-xs" style={{ color: subtextColor }}>Business info</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {}}
              className="p-4 rounded-xl text-left"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(249,115,22,0.3)' }}>
              <Users className="w-6 h-6 mb-2 text-orange-400" />
              <p className="text-sm font-bold" style={{ color: textColor }}>Team</p>
              <p className="text-xs" style={{ color: subtextColor }}>Manage team</p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}