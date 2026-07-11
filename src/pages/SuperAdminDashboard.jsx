import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, Users, Trash2, Ban, Lock, Eye, AlertTriangle, FileText, Flag,
  Image as ImageIcon, Video, MessageSquare, Crown, Zap, Settings,
  Activity, BarChart3, Mail, Search, RefreshCw, CheckCircle, XCircle,
  Flame, Heart, Play, Camera, BookOpen, TrendingUp, Download, Upload,
  AlertCircle, ShieldAlert, UserCheck, UserX, Edit, Key, Globe, Mic, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const SUPER_ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com'];

function StatCard({ icon: Icon, label, value, sub, color = '#ff5500' }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
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

function SectionHeader({ icon: Icon, title, subtitle, color = '#ff5500' }) {
  return (
    <div className="flex items-start gap-3 mb-4 mt-6">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1">
        <h2 className="font-extrabold text-lg text-white">{title}</h2>
        {subtitle && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState('all');

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u || !SUPER_ADMIN_EMAILS.includes((u.email || '').toLowerCase())) {
        toast.error('Super Admin access required');
        navigate('/');
        return;
      }
      setUser(u);
    });
  }, []);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['super-admin-analytics'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAdminAnalytics', {});
      return res.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch all posts/photos/videos for moderation
  const { data: allPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['super-admin-all-content'],
    queryFn: async () => {
      const posts = await base44.asServiceRole.entities.Post.list('-created_date', 500);
      return posts;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['super-admin-all-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetAllUsers', {});
      return res.data.users || [];
    },
    staleTime: 60000,
  });

  const { data: reportsData } = useQuery({
    queryKey: ['super-admin-reports'],
    queryFn: async () => {
      const reports = await base44.entities.Report.list('-created_date', 100);
      return reports;
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const { data: postsData } = useQuery({
    queryKey: ['super-admin-all-posts'],
    queryFn: async () => {
      const posts = await base44.asServiceRole.entities.Post.list('-created_date', 200);
      return posts;
    },
    staleTime: 30000,
  });

  const moderateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('adminModerateUser', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User moderated successfully');
      queryClient.invalidateQueries(['super-admin-all-users']);
      setModerationDialogOpen(false);
      setModerationAction('');
      setModerationReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to moderate user');
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async ({ type, id }) => {
      await base44.asServiceRole.entities[type].delete(id);
      return { type, id };
    },
    onSuccess: () => {
      toast.success('Content deleted successfully');
      queryClient.invalidateQueries(['super-admin-all-posts']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete content');
    },
  });

  const sendAnnouncementMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('sendAdminBroadcast', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Announcement sent successfully');
      setAnnouncementText('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send announcement');
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('cleanupCorruptedImages', {});
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Cleaned up ${data.cleaned_count || 0} corrupted images`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cleanup images');
    },
  });

  const handleModerate = () => {
    if (!selectedUser || !moderationAction) return;
    moderateMutation.mutate({
      target_user_id: selectedUser.user_id || selectedUser.id,
      action: moderationAction,
      reason: moderationReason || `${moderationAction} by Super Admin`,
    });
  };

  const handleDeleteContent = (type, id) => {
    if (!confirm('Are you sure you want to delete this content permanently?')) return;
    deleteContentMutation.mutate({ type, id });
  };

  const handleSendAnnouncement = () => {
    if (!announcementText.trim()) return;
    sendAnnouncementMutation.mutate({
      message: announcementText,
      type: announcementType,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'banned': return 'bg-red-600/20 text-red-500 border-red-600/30';
      case 'locked': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredUsers = usersData?.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const pendingReports = reportsData?.filter(r => r.status === 'pending') || [];

  if (!user) return null;

  if (analyticsLoading || usersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'rgb(6,3,10)' }}>
        <div className="w-12 h-12 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
        <p className="text-white/40 text-sm">Loading Super Admin Dashboard…</p>
      </div>
    );
  }

  const { users = {}, content = {}, engagement = {}, vip = {}, moderation = {} } = analytics || {};

  return (
    <div className="min-h-screen pb-32" style={{ background: 'rgb(6,3,10)' }} data-prevent-light-mode="true">
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', background: 'rgba(6,3,10,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg">Super Admin Dashboard</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email} · Full Platform Control</p>
            </div>
          </div>
          <Button
            onClick={() => queryClient.invalidateQueries(['super-admin-analytics', 'super-admin-all-users'])}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Total Users" value={users.totalUsers} color="#ff5500" />
          <StatCard icon={FileText} label="Total Posts" value={content.totalPosts} color="#e91e8c" />
          <StatCard icon={AlertTriangle} label="Pending Reports" value={moderation.pendingReports} color="#ef4444" />
          <StatCard icon={Crown} label="Active VIP" value={vip.totalVIP} color="#f59e0b" />
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-white/10 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/10">Users</TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-white/10">Posts & Media</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-white/10">Reports</TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-white/10">Announcements</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-white/10">System</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <SectionHeader icon={BarChart3} title="Platform Overview" subtitle="Real-time analytics and system status" color="#ff5500" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {['API', 'Database', 'Email', 'AI'].map((service) => (
                <Card key={service} className="bg-card/50 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-white/60">{service} Status</span>
                    </div>
                    <p className="text-lg font-bold text-white">Operational</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Growth Trend (14 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={(analytics?.growthTrend || []).slice(-14)}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff5500" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ff5500" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(20,10,30,0.98)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          {payload.map((p, i) => (
                            <p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
                          ))}
                        </div>
                      );
                    }} />
                    <Area type="monotone" dataKey="users" stroke="#ff5500" strokeWidth={2} fill="url(#colorUsers)" name="Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <SectionHeader icon={Zap} title="Quick Actions" subtitle="Instant access to critical tools" color="#e91e8c" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Moderation Panel', icon: Shield, path: '/admin/moderation', color: '#ef4444' },
                { label: 'VIP Management', icon: Crown, path: '/admin/vip-management', color: '#f59e0b' },
                { label: 'Email Automation', icon: Mail, path: '/admin/email-automation', color: '#00aaff' },
                { label: 'AI Assistant', icon: Mic, path: '/admin/ai', color: '#8b5cf6' },
                { label: 'Video Library', icon: Play, path: '/admin/video-library', color: '#e91e8c' },
                { label: 'Backup & Export', icon: Download, path: '/admin/backup', color: '#22c55e' },
                { label: 'Push Diagnostics', icon: Activity, path: '/admin/push-diagnostics', color: '#ff5500' },
                { label: 'Curated Reels', icon: Video, path: '/admin/curated-reels', color: '#7700cc' },
              ].map(({ label, icon: Icon, path, color }) => (
                <Button
                  key={path}
                  onClick={() => navigate(path)}
                  className="h-auto py-4 px-3 rounded-2xl flex flex-col items-start gap-2 bg-card/50 border-white/10 hover:bg-white/5"
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                  <span className="text-sm font-semibold text-white">{label}</span>
                </Button>
              ))}
            </div>
          </TabsContent>

          {/* USER MANAGEMENT TAB */}
          <TabsContent value="users" className="space-y-6">
            <SectionHeader icon={Users} title="User Management" subtitle="Full control over all user accounts" color="#ff5500" />

            <div className="flex gap-4 flex-wrap mb-4">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search by username, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <Button onClick={() => setSearchQuery('')} variant="outline" className="border-white/10 text-white">
                Clear
              </Button>
            </div>

            <Card className="bg-card/50 border-white/10">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y divide-white/5">
                    {filteredUsers.map((profile) => (
                     <div key={profile.id} className="p-3 flex flex-col gap-2 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {profile.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-semibold text-sm">@{profile.username || 'Unknown'}</span>
                              {SUPER_ADMIN_EMAILS.includes(profile.email) && <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Super Admin</Badge>}
                              <Badge className={`text-xs ${getStatusColor(profile.account_status || 'active')}`}>
                                {profile.account_status || 'active'}
                              </Badge>
                            </div>
                            <div className="text-xs text-white/50 truncate">{profile.email || 'N/A'}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-white/10 text-white hover:bg-purple-500/20 h-8 text-xs"
                          onClick={() => {
                            setSelectedUser(profile);
                            setModerationDialogOpen(true);
                          }}
                        >
                          ⚡ Moderate @{profile.username || 'user'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Dialog open={moderationDialogOpen} onOpenChange={setModerationDialogOpen}>
              <DialogContent className="bg-card border-white/10 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    Moderate User: {selectedUser?.username || 'Unknown'}
                  </DialogTitle>
                </DialogHeader>

                {selectedUser && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-background/30 border border-white/10">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-white/60">Email:</div>
                        <div className="text-white">{selectedUser.email}</div>
                        <div className="text-white/60">Status:</div>
                        <div><Badge className={getStatusColor(selectedUser.account_status || 'active')}>{selectedUser.account_status || 'active'}</Badge></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-white font-semibold">Select Action</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'warn', label: '⚠️ Warn', color: 'border-yellow-500/30 text-yellow-400' },
                          { value: 'lock', label: '🔒 Lock', color: 'border-orange-500/30 text-orange-400' },
                          { value: 'suspend', label: '🚫 Suspend', color: 'border-red-500/30 text-red-400' },
                          { value: 'ban', label: '❌ Ban', color: 'border-red-600/30 text-red-500' },
                          { value: 'restore', label: '✓ Restore', color: 'border-green-500/30 text-green-400' },
                          { value: 'delete', label: '🗑️ Delete', color: 'border-red-700/30 text-red-600' },
                        ].map(({ value, label, color }) => (
                          <Button
                            key={value}
                            variant="outline"
                            className={`${color} hover:bg-white/5`}
                            onClick={() => setModerationAction(value)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {moderationAction && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Enter reason for this action..."
                          value={moderationReason}
                          onChange={(e) => setModerationReason(e.target.value)}
                          className="bg-background/50 border-white/10 text-white placeholder:text-white/40"
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            onClick={handleModerate}
                            disabled={moderateMutation.isPending}
                          >
                            {moderateMutation.isPending ? 'Processing...' : `Confirm ${moderationAction}`}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/10 text-white"
                            onClick={() => {
                              setModerationAction('');
                              setModerationReason('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* CONTENT MODERATION TAB - Posts, Photos, Videos ONLY */}
          <TabsContent value="content" className="space-y-6">
            <SectionHeader icon={FileText} title="Content Moderation" subtitle="Control all posts, photos, videos & reels" color="#e91e8c" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={ImageIcon} label="Total Posts" value={content.totalPosts || (allPosts?.length || 0)} color="#ff5500" />
              <StatCard icon={Video} label="Total Reels" value={content.totalReels} color="#e91e8c" />
              <StatCard icon={BookOpen} label="Total Stories" value={content.totalStories} color="#7700cc" />
              <StatCard icon={Flag} label="Reported Content" value={moderation.postReports || 0} color="#ef4444" />
            </div>

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                  Recent Posts & Media ({allPosts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {(allPosts || []).map((post) => (
                      <div key={post.id} className="p-4 rounded-xl bg-background/30 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'U')}&background=8b5cf6&color=fff&size=40`}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-white font-semibold">@{post.author_username || 'Unknown'}</p>
                              <p className="text-xs text-white/50">{new Date(post.created_date).toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs capitalize">
                            {post.post_type || 'feed'}
                          </Badge>
                        </div>
                        
                        {/* Media preview */}
                        {(post.image_url || post.video_url) && (
                          <div className="mb-3 rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                            {post.video_url ? (
                              <video src={post.video_url} className="w-full h-32 object-cover" controls={false} />
                            ) : (
                              <img src={post.image_url} alt="" className="w-full h-32 object-cover" />
                            )}
                          </div>
                        )}
                        
                        {post.caption && <p className="text-sm text-white/70 mb-3 line-clamp-2">{post.caption}</p>}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes_count || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments_count || 0}</span>
                            <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {post.fire_count || 0}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteContent('Post', post.id)}
                            className="h-8"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  Cleanup Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => cleanupMutation.mutate()}
                  disabled={cleanupMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${cleanupMutation.isPending ? 'animate-spin' : ''}`} />
                  {cleanupMutation.isPending ? 'Cleaning...' : 'Remove Damaged/Black/White Images'}
                </Button>
                <p className="text-xs text-white/40">
                  This will scan and remove corrupted, black, or white images from the platform
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS & SAFETY TAB */}
          <TabsContent value="reports" className="space-y-6">
            <SectionHeader icon={AlertTriangle} title="Reports & Safety" subtitle="Review suspicious activity and user reports" color="#ef4444" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={AlertTriangle} label="Total Reports" value={moderation.totalReports} color="#ef4444" />
              <StatCard icon={Eye} label="Pending Review" value={moderation.pendingReports} color="#f59e0b" />
              <StatCard icon={FileText} label="Post Reports" value={moderation.postReports} color="#e91e8c" />
              <StatCard icon={Users} label="User Reports" value={moderation.userReports} color="#7700cc" />
            </div>

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Pending Reports ({pendingReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {pendingReports.map((report) => (
                      <div key={report.id} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-semibold capitalize">{report.reason.replace('_', ' ')}</p>
                            <p className="text-xs text-white/50">Reported by: {report.reporter_id}</p>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Pending</Badge>
                        </div>
                        {report.details && <p className="text-sm text-white/70 mb-3">{report.details}</p>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANNOUNCEMENTS TAB */}
          <TabsContent value="announcements" className="space-y-6">
            <SectionHeader icon={Mail} title="Announcements" subtitle="Send emails and notifications to all users" color="#00aaff" />

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Send Platform Announcement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Audience</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', label: 'All Users' },
                      { value: 'vip', label: 'VIP Only' },
                      { value: 'creators', label: 'Creators' },
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={announcementType === value ? 'default' : 'outline'}
                        className={announcementType === value ? 'bg-purple-500 text-white' : 'border-white/10 text-white'}
                        onClick={() => setAnnouncementType(value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60">Message</label>
                  <Textarea
                    placeholder="Enter your announcement message..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="bg-background/50 border-white/10 text-white placeholder:text-white/40 min-h-[150px]"
                  />
                </div>

                <Button
                  onClick={handleSendAnnouncement}
                  disabled={sendAnnouncementMutation.isPending || !announcementText.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendAnnouncementMutation.isPending ? 'Sending...' : 'Send Announcement'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SYSTEM CONTROL TAB */}
          <TabsContent value="system" className="space-y-6">
            <SectionHeader icon={Settings} title="System Control" subtitle="Platform settings and permissions" color="#7700cc" />

            <div className="grid gap-4">
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    VIP & Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={Crown} label="Active VIP" value={vip.totalVIP} color="#f59e0b" />
                    <StatCard icon={Gift} label="Gifted VIP" value={vip.giftedVip} color="#e91e8c" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate('/admin/vip-management')} className="flex-1 bg-purple-500 text-white">
                      Manage VIP
                    </Button>
                    <Button onClick={() => navigate('/admin/gift-vip')} className="flex-1 bg-pink-500 text-white">
                      Gift VIP Access
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-500" />
                    Admin Roles & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-white/60">Current role: Super Admin (Full Control)</p>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">Super Admin</p>
                        <p className="text-xs text-white/50">Full platform control</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI SETTINGS TAB */}
          <TabsContent value="ai" className="space-y-6">
            <SectionHeader icon={Mic} title="AI Settings" subtitle="Control AI voices, languages, and permissions" color="#8b5cf6" />

            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                  AI Voice Chat Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/60">Manage AI voices and languages</p>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-background/30 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-white font-semibold mb-1">Available Voices</p>
                      <p className="text-2xl font-bold text-purple-400">6</p>
                      <p className="text-xs text-white/50">Nova, Alloy, Echo, Fable, Onyx, Shimmer</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/30 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-white font-semibold mb-1">Supported Languages</p>
                      <p className="text-2xl font-bold text-pink-400">50+</p>
                      <p className="text-xs text-white/50">Including Albanian, Macedonian, Serbian</p>
                    </CardContent>
                  </Card>
                </div>
                <Button onClick={() => navigate('/admin/ai')} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure AI Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}