import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Flame, BarChart3, Users, DollarSign, TrendingUp,
  Video, Image, Target, Zap, Settings, Crown, Award, Check,
  Activity, Calendar, Clock, MessageCircle, Share2, Heart, Eye
} from 'lucide-react';

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
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

      const posts = await base44.entities.Post.filter({ author_id: currentUser.id }, '-created_date', 100);
      const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalFire = posts.reduce((sum, p) => sum + (p.fire_count || 0), 0);
      const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      const totalViews = totalLikes * 3;

      setStats({
        totalPosts: posts.length,
        totalLikes,
        totalFire,
        totalComments,
        totalViews,
        followers: userProfile?.followers_count || 0,
        engagementRate: posts.length > 0 ? (((totalLikes + totalComments) / (posts.length * 100)) * 100).toFixed(1) : 0,
      });
    } catch (error) {
      console.error('Failed to load Creator dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(249,115,22,0.2)', borderTopColor: '#f97316' }} />
      </div>
    );
  }

  const bg = isLightMode ? 'hsl(270,25%,96%)' : 'rgb(6,3,10)';
  const cardBg = isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(20,10,30,0.6)';
  const cardBorder = isLightMode ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(249,115,22,0.3)';
  const textColor = isLightMode ? 'hsl(270,20%,12%)' : 'white';
  const subtextColor = isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)';

  const creatorTools = [
    {
      icon: BarChart3,
      title: 'Content Analytics',
      description: 'Track post performance',
      color: '#f97316',
      action: () => navigate('/vip/analytics'),
    },
    {
      icon: Users,
      title: 'Audience Insights',
      description: 'Know your followers',
      color: '#ec4899',
      action: () => {},
    },
    {
      icon: DollarSign,
      title: 'Monetization',
      description: 'Earn from content',
      color: '#22c55e',
      action: () => {},
    },
    {
      icon: TrendingUp,
      title: 'Post Boosting',
      description: 'Increase reach',
      color: '#8b5cf6',
      action: () => {},
    },
    {
      icon: Video,
      title: 'Video Tools',
      description: 'Advanced video editing',
      color: '#3b82f6',
      action: () => {},
    },
    {
      icon: Target,
      title: 'Promotion Tools',
      description: 'Targeted campaigns',
      color: '#eab308',
      action: () => {},
    },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ 
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          background: isLightMode ? 'rgba(248,244,255,0.96)' : 'rgba(8,4,12,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: isLightMode ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(249,115,22,0.3)',
        }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center" style={{ color: subtextColor }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold" style={{ color: textColor }}>Creator Dashboard</h1>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-xs" style={{ color: subtextColor }}>Grow your audience & earn</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Creator Status */}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.2))',
            border: '1px solid rgba(249,115,22,0.4)',
          }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold" style={{ color: textColor }}>🔥 Spicey Creator</h2>
              <p className="text-sm" style={{ color: subtextColor }}>Content Creator Pro</p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: 'rgba(34,197,94,0.8)' }}>
              ✓ Active
            </div>
          </div>

          {/* Creator Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.totalPosts || 0}</p>
              <p className="text-xs" style={{ color: subtextColor }}>Posts</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.totalViews || 0}</p>
              <p className="text-xs" style={{ color: subtextColor }}>Views</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.engagementRate}%</p>
              <p className="text-xs" style={{ color: subtextColor }}>Engagement</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-lg font-bold" style={{ color: textColor }}>{stats?.followers || 0}</p>
              <p className="text-xs" style={{ color: subtextColor }}>Followers</p>
            </div>
          </div>
        </motion.div>

        {/* Creator Tools */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Creator Tools</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {creatorTools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.96 }}
                  onClick={tool.action}
                  className="p-4 rounded-xl text-left"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${tool.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: tool.color }} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: textColor }}>{tool.title}</p>
                  <p className="text-xs" style={{ color: subtextColor }}>{tool.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Monetization Status */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(168,85,247,0.1))',
            border: '1px solid rgba(34,197,94,0.3)' 
          }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.2)' }}>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold" style={{ color: textColor }}>Monetization Ready</h3>
              <p className="text-xs" style={{ color: subtextColor }}>Start earning from your content</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm" style={{ color: textColor }}>Creator Fund Eligible</span>
              </div>
              <span className="text-xs font-bold text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm" style={{ color: textColor }}>Brand Partnerships</span>
              </div>
              <span className="text-xs font-bold text-green-400">Available</span>
            </div>
            <button
              onClick={() => {}}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              💰 Setup Payout Methods
            </button>
          </div>
        </motion.div>

        {/* Creator Perks */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Creator Benefits</h3>
          </div>
          
          <div className="space-y-2">
            {[
              'Orange Flame verification badge',
              'Advanced content analytics',
              'Audience demographics & insights',
              'Monetization & earning tools',
              'Post boosting & promotion',
              'Priority creator support',
              'Early access to creator features',
              'Creator community access',
            ].map((perk, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span style={{ color: textColor }}>{perk}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}