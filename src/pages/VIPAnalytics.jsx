import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Eye, Heart, Flame, MessageCircle, Share2,
  ArrowLeft, Crown, BarChart3, Award
} from 'lucide-react';
import { isAdminEmail } from '@/lib/adminAccess';

export default function VIPAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [planType, setPlanType] = useState(null);

  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;

      // Check subscription (admin has all access)
      const subscriptions = await base44.entities.Subscription.filter({ 
        user_id: user.id, 
        status: 'active' 
      });
      
      const hasPremium = isAdminEmail(user) || subscriptions.length > 0;
      if (subscriptions.length > 0) {
        setPlanType(subscriptions[0].plan_type);
      }
      if (isAdminEmail(user)) {
        setPlanType('business'); // Admin has all access
      }

      if (!hasPremium) {
        navigate('/vip');
        return;
      }

      // Load analytics data
      const posts = await base44.entities.Post.filter({ author_id: user.id }, '-created_date', 100);
      
      // Calculate stats
      const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalFire = posts.reduce((sum, p) => sum + (p.fire_count || 0), 0);
      const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
      const totalShares = posts.reduce((sum, p) => sum + (p.shares_count || 0), 0);
      const totalViews = totalLikes * 3; // Estimated views

      // Calculate engagement rate
      const totalEngagement = totalLikes + totalFire + totalComments + totalShares;
      const engagementRate = posts.length > 0 ? ((totalEngagement / (posts.length * 100)) * 100).toFixed(1) : 0;

      // Recent performance (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentPosts = posts.filter(p => new Date(p.created_date) > sevenDaysAgo);
      const recentEngagement = recentPosts.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0);

      // Follower growth (mock data for now)
      const followerGrowth = [
        { day: 'Mon', gained: 12, lost: 2 },
        { day: 'Tue', gained: 18, lost: 3 },
        { day: 'Wed', gained: 25, lost: 1 },
        { day: 'Thu', gained: 15, lost: 4 },
        { day: 'Fri', gained: 32, lost: 2 },
        { day: 'Sat', gained: 28, lost: 5 },
        { day: 'Sun', gained: 22, lost: 3 },
      ];

      setStats({
        totalPosts: posts.length,
        totalLikes,
        totalFire,
        totalComments,
        totalShares,
        totalViews,
        engagementRate: parseFloat(engagementRate),
        recentEngagement,
        recentPosts: recentPosts.length,
        followerGrowth,
        topPost: posts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))[0],
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-lg font-bold" style={{ color: textColor }}>VIP Analytics</h1>
          <p className="text-xs" style={{ color: subtextColor }}>
            {planType === 'business' ? 'Business Plan' : planType === 'creator' ? 'Creator Plan' : 'VIP Plan'}
          </p>
        </div>
        <Crown className="w-5 h-5 text-yellow-400" />
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="p-4 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold" style={{ color: subtextColor }}>Total Views</span>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: textColor }}>{stats.totalViews.toLocaleString()}</p>
          </motion.div>

          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }}
            className="p-4 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-semibold" style={{ color: subtextColor }}>Engagement</span>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: textColor }}>{stats.engagementRate}%</p>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Performance Overview</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(233,30,140,0.15)' }}>
                  <Users className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-sm" style={{ color: subtextColor }}>Total Posts</span>
              </div>
              <span className="font-bold" style={{ color: textColor }}>{stats.totalPosts}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.15)' }}>
                  <Heart className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm" style={{ color: subtextColor }}>Total Likes</span>
              </div>
              <span className="font-bold" style={{ color: textColor }}>{stats.totalLikes.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,100,0,0.15)' }}>
                  <Flame className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-sm" style={{ color: subtextColor }}>Fire Reactions</span>
              </div>
              <span className="font-bold" style={{ color: textColor }}>{stats.totalFire.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm" style={{ color: subtextColor }}>Comments</span>
              </div>
              <span className="font-bold" style={{ color: textColor }}>{stats.totalComments.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <Share2 className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm" style={{ color: subtextColor }}>Shares</span>
              </div>
              <span className="font-bold" style={{ color: textColor }}>{stats.totalShares.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Follower Growth */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="font-bold" style={{ color: textColor }}>Follower Growth (7 Days)</h3>
          </div>
          
          <div className="space-y-2">
            {stats.followerGrowth.map((day, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span style={{ color: subtextColor }}>{day.day}</span>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-semibold">+{day.gained}</span>
                  <span className="text-red-400 font-semibold">-{day.lost}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Post */}
        {stats.topPost && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl" style={{ background: cardBg, border: cardBorder }}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold" style={{ color: textColor }}>Top Performing Post</h3>
            </div>
            
            <div className="flex gap-3">
              {stats.topPost.image_url ? (
                <img src={stats.topPost.image_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
              ) : stats.topPost.youtube_thumbnail ? (
                <img src={stats.topPost.youtube_thumbnail} alt="" className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.1)' }}>
                  <Flame className="w-8 h-8 text-orange-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold line-clamp-2 mb-2" style={{ color: textColor }}>
                  {stats.topPost.caption || 'Untitled Post'}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: subtextColor }}>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {stats.topPost.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {stats.topPost.comments_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIP Features Access */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="p-5 rounded-2xl" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.15))',
            border: '1px solid rgba(255,85,0,0.3)' 
          }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,85,0,0.2)' }}>
              <Crown className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: textColor }}>VIP Features Active</h3>
              <p className="text-xs" style={{ color: subtextColor }}>All premium tools unlocked</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {['Advanced Analytics', 'Priority Support', 'Verified Badge', 'Profile Styling'].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ color: subtextColor }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
                  <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
