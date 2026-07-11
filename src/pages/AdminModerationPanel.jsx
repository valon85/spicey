import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Shield, UserX, CheckCircle, AlertTriangle, Lock, Eye, Trash2, Ban, Activity, MessageSquare, FileText, Video, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminModerationPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [moderationAction, setModerationAction] = useState('');
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', statusFilter],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetAllUsers', { status: statusFilter });
      return res.data;
    },
  });

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ['admin-search-users', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return { users: [] };
      const res = await base44.functions.invoke('adminSearchUsers', { query: searchQuery });
      return res.data;
    },
    enabled: searchQuery.length >= 2,
  });

  // Get user activity
  const { data: userActivity } = useQuery({
    queryKey: ['admin-user-activity', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return null;
      const res = await base44.functions.invoke('adminGetUserActivity', { user_id: selectedUser.id });
      return res.data;
    },
    enabled: !!selectedUser,
  });

  // Moderation mutation
  const moderateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await base44.functions.invoke('adminModerateUser', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User moderated successfully');
      queryClient.invalidateQueries(['admin-users']);
      setDialogOpen(false);
      setModerationAction('');
      setReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to moderate user');
    },
  });

  const handleModerate = () => {
    if (!selectedUser || !moderationAction) return;
    moderateMutation.mutate({
      target_user_id: selectedUser.id,
      action: moderationAction,
      reason: reason || `${moderationAction} by admin`,
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

  const displayedUsers = searchQuery.length >= 2 ? (searchResults?.users || []) : (usersData?.users || []);

  return (
    <div className="min-h-screen bg-background p-6" data-prevent-light-mode="true">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            Admin Moderation Panel
          </h1>
          <p className="text-white/60">Manage users, review reports, and protect the platform</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{displayedUsers.length}</div>
              <div className="text-xs text-white/60">Total Users</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {displayedUsers.filter(u => u.account_status === 'active').length}
              </div>
              <div className="text-xs text-white/60">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">
                {displayedUsers.filter(u => u.account_status === 'suspended' || u.account_status === 'banned').length}
              </div>
              <div className="text-xs text-white/60">Suspended/Banned</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {displayedUsers.filter(u => u.account_status === 'locked').length}
              </div>
              <div className="text-xs text-white/60">Locked</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">
                {displayedUsers.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-xs text-white/60">Admins</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="bg-card/50 border-white/10 mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search by username, name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-background/50 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-purple-500" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-white/60 py-8">Loading users...</div>
            ) : displayedUsers.length === 0 ? (
              <div className="text-center text-white/60 py-8">No users found</div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {displayedUsers.map((user, idx) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="p-4 rounded-xl bg-background/30 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">{user.username || 'Unknown'}</span>
                              {user.role === 'admin' && (
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Admin</Badge>
                              )}
                              {user.verified && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Verified</Badge>
                              )}
                            </div>
                            <div className="text-xs text-white/50">{user.email || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(user.account_status || 'active')}>
                            {user.account_status || 'active'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-white hover:bg-purple-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setDialogOpen(true);
                            }}
                          >
                            Moderate
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-card border-white/10 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                Moderate User: {selectedUser?.username || 'Unknown'}
              </DialogTitle>
            </DialogHeader>

            {selectedUser && userActivity && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-background/30 border-white/10">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">{userActivity.activity.posts_count}</div>
                      <div className="text-xs text-white/60 flex items-center justify-center gap-1">
                        <Image className="w-3 h-3" /> Posts
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/30 border-white/10">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-white">{userActivity.activity.comments_count}</div>
                      <div className="text-xs text-white/60 flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Comments
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/30 border-white/10">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">{userActivity.activity.reports_count}</div>
                      <div className="text-xs text-white/60 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Reports
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Details */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Account Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-white/60">Email:</div>
                    <div className="text-white">{selectedUser.email}</div>
                    <div className="text-white/60">Full Name:</div>
                    <div className="text-white">{selectedUser.full_name || 'N/A'}</div>
                    <div className="text-white/60">Status:</div>
                    <div><Badge className={getStatusColor(selectedUser.account_status || 'active')}>{selectedUser.account_status || 'active'}</Badge></div>
                    <div className="text-white/60">Role:</div>
                    <div className="text-white">{selectedUser.role || 'user'}</div>
                    <div className="text-white/60">Joined:</div>
                    <div className="text-white">{new Date(selectedUser.created_date).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="space-y-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                      onClick={() => setModerationAction('warn')}
                    >
                      ⚠️ Warn User
                    </Button>
                    <Button
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                      onClick={() => setModerationAction('lock')}
                    >
                      🔒 Lock Account
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                      onClick={() => setModerationAction('suspend')}
                    >
                      🚫 Suspend
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-600/30 text-red-500 hover:bg-red-600/20"
                      onClick={() => setModerationAction('ban')}
                    >
                      ❌ Permanent Ban
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                      onClick={() => setModerationAction('disable_posting')}
                    >
                      📝 Disable Posting
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                      onClick={() => setModerationAction('disable_messaging')}
                    >
                      💬 Disable Messaging
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                      onClick={() => setModerationAction('restore')}
                      disabled={selectedUser.account_status === 'active'}
                    >
                      ✓ Restore Account
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-700/30 text-red-600 hover:bg-red-700/20"
                      onClick={() => setModerationAction('delete')}
                    >
                      🗑️ Delete Account
                    </Button>
                  </div>

                  {/* Reason Input */}
                  {moderationAction && (
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <Textarea
                        placeholder="Enter reason for this action..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
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
                            setReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Reports */}
                {userActivity.activity.reports_against?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Reports Against This User ({userActivity.activity.reports_against.length})
                    </h3>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {userActivity.activity.reports_against.map((report, idx) => (
                          <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="text-sm text-red-400 font-semibold">{report.reason}</div>
                            <div className="text-xs text-white/60 mt-1">
                              Reported by: {report.reporter_info?.username || 'Unknown'} • {new Date(report.created_date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}