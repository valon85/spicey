import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminVisualEditor from './AdminVisualEditor';
import {
  ChevronLeft, Users, FileText, Heart, MessageCircle, TrendingUp,
  Crown, AlertTriangle, Shield, Play, Camera, BookOpen, BarChart3,
  RefreshCw, Eye, Flame, UserCheck, Activity, Download, Trash2, LogOut, Rocket, Palette
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com'];

function StatCard({ icon: Icon, label, value, sub, color = '#ff5500', bg }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: bg || 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-white">{(value ?? 0).toLocaleString()}</p>
      {sub && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = '#ff5500' }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h2 className="font-extrabold text-base text-white">{title}</h2>
    </div>
  );
}

function PeriodRow({ label, today, week, month }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex gap-4 text-right">
        <div>
          <p className="text-xs text-white/35 mb-0.5">Today</p>
          <p className="text-sm font-bold text-white">{(today ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-white/35 mb-0.5">Week</p>
          <p className="text-sm font-bold text-white">{(week ?? 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-white/35 mb-0.5">Month</p>
          <p className="text-sm font-bold text-white">{(month ?? 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(20,10,30,0.98)', border: '1px solid rgba(255,255,255,0.12)' }}>
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState('users');
  const [showVisualEditor, setShowVisualEditor] = useState(
    typeof window !== 'undefined' && window.location.hash === '#visual-editor'
  );

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('getAdminAnalytics', {});
      setData(res.data || res);
    } catch (e) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      setShowVisualEditor(window.location.hash === '#visual-editor');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (!u || !ADMIN_EMAILS.includes((u.email || '').toLowerCase())) {
        navigate('/');
        return;
      }
      loadData();
    });
  }, []);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'rgb(6,3,10)' }}>
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
        <p className="text-white/40 text-sm">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: 'rgb(6,3,10)' }}>
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-white text-center">{error}</p>
        <button onClick={() => loadData()} className="px-6 py-2.5 rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>Retry</button>
      </div>
    );
  }

  const { users = {}, content = {}, engagement = {}, vip = {}, moderation = {}, topPosts = [], topCreators = [], growthTrend = [] } = data || {};

  // Only show last 14 days in chart for readability
  const chartData = growthTrend.slice(-14);

  const chartTabs = [
    { key: 'users', label: 'Users', color: '#ff5500' },
    { key: 'posts', label: 'Posts', color: '#e91e8c' },
    { key: 'stories', label: 'Moments', color: '#7700cc' },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate('/');
  };

  if (showVisualEditor) {
    return <AdminVisualEditor />;
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'rgb(6,3,10)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', background: 'rgba(6,3,10,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-white text-base">Admin Dashboard</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Spicey Platform Analytics</p>
        </div>
        <button onClick={() => loadData(true)} disabled={refreshing}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={handleLogout}
          className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <LogOut className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="px-4 py-4 space-y-1 max-w-2xl mx-auto">

        {/* ── USER ANALYTICS ── */}
        <SectionHeader icon={Users} title="User Analytics" color="#ff5500" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} label="Total Users" value={users.totalUsers} color="#ff5500" />
          <StatCard icon={Activity} label="New Today" value={users.newUsersToday} color="#e91e8c" />
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <PeriodRow label="New Users" today={users.newUsersToday} week={users.newUsersWeek} month={users.newUsersMonth} />
        </div>

        {/* ── GROWTH CHART ── */}
        <SectionHeader icon={TrendingUp} title="Growth Trend (14 days)" color="#7700cc" />
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Chart tabs */}
          <div className="flex gap-2 mb-4">
            {chartTabs.map(t => (
              <button key={t.key} onClick={() => setActiveChart(t.key)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: activeChart === t.key ? t.color : 'rgba(255,255,255,0.06)',
                  color: activeChart === t.key ? 'white' : 'rgba(255,255,255,0.4)',
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTabs.find(t => t.key === activeChart)?.color || '#ff5500'} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={chartTabs.find(t => t.key === activeChart)?.color || '#ff5500'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={activeChart}
                stroke={chartTabs.find(t => t.key === activeChart)?.color || '#ff5500'}
                strokeWidth={2}
                fill="url(#colorGrad)"
                name={chartTabs.find(t => t.key === activeChart)?.label}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── CONTENT ANALYTICS ── */}
        <SectionHeader icon={FileText} title="Content Analytics" color="#e91e8c" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={FileText} label="Total Posts" value={content.totalPosts} color="#e91e8c" />
          <StatCard icon={Camera} label="Total Photos" value={content.totalPhotos} color="#ff5500" />
          <StatCard icon={Play} label="Total Reels" value={content.totalReels} color="#7700cc" />
          <StatCard icon={BookOpen} label="Total Stories" value={content.totalStories} color="#00aaff" />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <PeriodRow label="Posts" today={content.postsToday} week={content.postsWeek} month={content.postsMonth} />
          <PeriodRow label="Photos" today={content.photosToday} week={content.photosWeek} month={content.photosMonth} />
          <PeriodRow label="Reels" today={content.reelsToday} week={content.reelsWeek} month={content.reelsMonth} />
          <PeriodRow label="Stories" today={content.storiesToday} week={content.storiesWeek} month={content.storiesMonth} />
        </div>

        {/* Content type bar chart */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Content Type Breakdown</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={[
              { name: 'Photos', count: content.totalPhotos || 0, fill: '#ff5500' },
              { name: 'Reels', count: content.totalReels || 0, fill: '#e91e8c' },
              { name: 'Stories', count: content.totalStories || 0, fill: '#7700cc' },
              { name: 'YouTube', count: content.totalYoutube || 0, fill: '#ff0000' },
              { name: 'Text', count: content.totalText || 0, fill: '#00aaff' },
            ]} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Count">
                {[
                  { fill: '#ff5500' }, { fill: '#e91e8c' }, { fill: '#7700cc' }, { fill: '#ff0000' }, { fill: '#00aaff' }
                ].map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── ENGAGEMENT ANALYTICS ── */}
        <SectionHeader icon={Heart} title="Engagement Analytics" color="#e91e8c" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Heart} label="Total Likes" value={engagement.totalLikes} color="#e91e8c" />
          <StatCard icon={Flame} label="Total Fire 🔥" value={engagement.totalPostFire} color="#ff5500" />
          <StatCard icon={MessageCircle} label="Total Comments" value={engagement.totalComments} color="#7700cc" />
          <StatCard icon={UserCheck} label="Total Follows" value={engagement.totalFollows} color="#00aaff" />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <PeriodRow label="Likes" today={engagement.likesToday} week={engagement.likesWeek} month={engagement.likesMonth} />
          <PeriodRow label="Comments" today={engagement.commentsToday} week={engagement.commentsWeek} month={engagement.commentsMonth} />
          <PeriodRow label="New Follows" today={engagement.followsToday} week={engagement.followsWeek} month={engagement.followsMonth} />
        </div>

        {/* ── VIP ANALYTICS ── */}
        <SectionHeader icon={Crown} title="VIP Analytics" color="#f59e0b" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Crown} label="Active VIP" value={vip.totalVIP} color="#f59e0b" />
          <StatCard icon={Users} label="Gifted VIP" value={vip.giftedVip} color="#ff5500" />
          <StatCard icon={Crown} label="Paid VIP" value={vip.paidVip} color="#e91e8c" />
          <StatCard icon={AlertTriangle} label="Expired" value={vip.expiredVip} color="#6b7280" />
        </div>

        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">VIP by Plan</p>
          {[
            { label: 'VIP', count: vip.vipByPlan?.vip || 0, color: '#f59e0b' },
            { label: 'Creator', count: vip.vipByPlan?.creator || 0, color: '#e91e8c' },
            { label: 'Business', count: vip.vipByPlan?.business || 0, color: '#7700cc' },
          ].map(({ label, count, color }) => {
            const total = vip.totalVIP || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{label}</span>
                  <span className="text-white font-bold">{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <PeriodRow label="New VIP" today={vip.vipToday} week={vip.vipWeek} month={vip.vipMonth} />
        </div>

        {/* ── MODERATION ── */}
        <SectionHeader icon={Shield} title="Moderation & Reports" color="#ef4444" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={AlertTriangle} label="Total Reports" value={moderation.totalReports} color="#ef4444" />
          <StatCard icon={AlertTriangle} label="Pending Review" value={moderation.pendingReports} color="#f59e0b" />
          <StatCard icon={FileText} label="Post Reports" value={moderation.postReports} color="#e91e8c" />
          <StatCard icon={Users} label="User Reports" value={moderation.userReports} color="#7700cc" />
          <StatCard icon={Shield} label="Blocked Pairs" value={moderation.totalBlocks} color="#6b7280" />
        </div>

        {moderation.pendingReports > 0 && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-300">{moderation.pendingReports} pending reports need review</p>
              <p className="text-xs text-red-300/60">Review and take action in Admin Comms Center</p>
            </div>
          </div>
        )}

        {/* ── TOP CREATORS ── */}
        <SectionHeader icon={BarChart3} title="Top Creators" color="#7700cc" />
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {topCreators.slice(0, 8).map((creator, i) => (
            <div key={creator.userId} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < topCreators.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span className="text-sm font-extrabold w-5 text-center" style={{ color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>#{i + 1}</span>
              <img
                src={creator.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.username)}&background=ff5500&color=fff&size=40`}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">@{creator.username}</p>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-white/30" />
                <span className="text-sm font-bold text-white">{creator.posts}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── TOP POSTS ── */}
        <SectionHeader icon={Eye} title="Top Spicey Posts by Engagement" color="#e91e8c" />
        <div className="space-y-2">
          {topPosts.slice(0, 8).map((post, i) => (
            <div key={post.id} className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-xs font-extrabold w-4 text-center" style={{ color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: post.type === 'reel' ? 'rgba(119,0,204,0.3)' : post.type === 'youtube' ? 'rgba(255,0,0,0.3)' : 'rgba(255,85,0,0.3)', color: post.type === 'reel' ? '#c084fc' : post.type === 'youtube' ? '#f87171' : '#fb923c' }}>
                    {post.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/40">@{post.author}</span>
                </div>
                <p className="text-xs text-white/70 truncate">{post.caption || 'No caption'}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50 flex-shrink-0">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>

        {/* SUPER ADMIN ACCESS */}
        <div className="mt-8 mb-6 p-5 rounded-2xl border-2 border-purple-500/30" style={{ background: 'rgba(139,92,246,0.1)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Super Admin Dashboard</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Full Platform Control</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/super')}
            className="w-full py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #e91e8c)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>
            🎯 Access Super Admin Dashboard
          </button>
          <p className="text-[10px] text-white/40 mt-2 text-center">Complete control over users, content, AI, and platform settings</p>
        </div>

        {/* ── CONTENT MANAGEMENT ── */}
        <div className="mt-8 mb-6 p-5 rounded-2xl border-2 border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Content Management</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Delete Posts, Photos, Reels, Stories, Comments</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => navigate('/admin/content')}
              className="py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}>
              🗑️ Manage All Content
            </button>
            <button onClick={() => navigate('/admin/moderation')}
              className="py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #f97316, #e91e8c)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
              👥 User Management
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => navigate('/admin/content')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
              📸 Delete Photos
            </button>
            <button onClick={() => navigate('/admin/content')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
              🎥 Delete Reels
            </button>
            <button onClick={() => navigate('/admin/content')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
              📝 Delete Posts
            </button>
            <button onClick={() => navigate('/admin/content')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
              ⏱️ Delete Stories
            </button>
            <button onClick={() => navigate('/admin/content')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
              💬 Delete Comments
            </button>
            <button onClick={() => navigate('/admin/content')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
              🧹 Clean Damaged
            </button>
          </div>
        </div>

        {/* ── USER MANAGEMENT ── */}
        <div className="mt-8 mb-6 p-5 rounded-2xl border-2 border-orange-500/30" style={{ background: 'rgba(249,115,22,0.1)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #e91e8c)' }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">User Management</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Lock, Suspend, Ban, Delete User Accounts</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/moderation')}
            className="w-full py-3 rounded-xl font-bold text-white text-sm active:scale-95 transition-transform mb-3"
            style={{ background: 'linear-gradient(135deg, #f97316, #e91e8c)', boxShadow: '0 0 20px rgba(249,115,22,0.4)' }}>
            👥 Open User Management Panel
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate('/admin/moderation')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(249,115,22,0.3)', border: '1px solid rgba(249,115,22,0.5)' }}>
              🔒 Lock Account
            </button>
            <button onClick={() => navigate('/admin/moderation')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(249,115,22,0.3)', border: '1px solid rgba(249,115,22,0.5)' }}>
              🚫 Suspend User
            </button>
            <button onClick={() => navigate('/admin/moderation')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(249,115,22,0.3)', border: '1px solid rgba(249,115,22,0.5)' }}>
              ❌ Ban Permanently
            </button>
            <button onClick={() => navigate('/admin/moderation')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white active:scale-95 transition-transform"
              style={{ background: 'rgba(249,115,22,0.3)', border: '1px solid rgba(249,115,22,0.5)' }}>
              🗑️ Delete Account
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <SectionHeader icon={Shield} title="Quick Actions" color="#ff5500" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Home Feed V2 Test', path: '/admin/home-feed-v2', icon: Camera, color: '#ff2faf' },
            { label: 'Visual Editor', path: '/admin/visual-editor', icon: Palette, color: '#ff5500' },
            { label: 'VIP Management', path: '/admin/vip-management', icon: Crown, color: '#f59e0b' },
            { label: 'Gift VIP Access', path: '/admin/gift-vip', icon: Crown, color: '#e91e8c' },
            { label: 'Comms Center', path: '/admin/comms', icon: MessageCircle, color: '#7700cc' },
            { label: 'Email Automation', path: '/admin/email-automation', icon: Activity, color: '#00aaff' },
            { label: 'Backup & Export', path: '/admin/backup', icon: Users, color: '#22c55e' },
            { label: 'Release Center', path: '/admin/release', icon: Rocket, color: '#ff5500' },
            { label: 'Moderation Panel', path: '/admin/moderation', icon: Shield, color: '#ef4444' },
            { label: 'Admin AI Assistant', path: '/admin/ai', icon: Shield, color: '#8b5cf6' },
            { label: 'Video Library', path: '/admin/video-library', icon: Play, color: '#e91e8c' },
            { label: 'Bulk Import Videos', path: '/admin/bulk-import', icon: Download, color: '#ff5500' },
            { label: 'Content Management', path: '/admin/content', icon: Trash2, color: '#ef4444' },
          ].map(({ label, path, icon: Icon, color }) => (
            <button key={path} onClick={() => navigate(path)}
              className="rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-sm font-semibold text-white">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
