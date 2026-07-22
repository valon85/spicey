import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, Trash2, Shield, AlertTriangle, Image, Play, BookOpen,
  MessageCircle, UserX, Lock, Ban, Eye, RefreshCw, Search, FileText,
  Camera, Video, MessageSquare, XCircle, CheckCircle, Crown, Activity,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const SUPER_ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com'];

export default function AdminContentManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentType, setContentType] = useState('');
  const [activeTab, setActiveTab] = useState('photos');

  // Verify super admin access
  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (!u || !SUPER_ADMIN_EMAILS.includes((u.email || '').toLowerCase())) {
        toast.error('Super Admin access required');
        navigate('/admin/dashboard');
        return;
      }
    });
  }, []);

  // Fetch recent content
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-all-posts', searchQuery],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetAllPosts', { limit: 100 });
      return res.data?.posts || [];
    },
  });

  // Fetch recent stories
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ['admin-all-stories'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetAllStories', { limit: 100 });
      return res.data?.stories || [];
    },
  });

  // Fetch recent comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['admin-all-comments'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetAllComments', { limit: 100 });
      return res.data?.comments || [];
    },
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }) => {
      if (type === 'post') {
        return await base44.asServiceRole.entities.Post.delete(id);
      } else if (type === 'story') {
        return await base44.asServiceRole.entities.Story.delete(id);
      } else if (type === 'comment') {
        return await base44.asServiceRole.entities.Comment.delete(id);
      }
    },
    onSuccess: () => {
      toast.success('Content deleted successfully');
      queryClient.invalidateQueries(['admin-all-posts']);
      queryClient.invalidateQueries(['admin-all-stories']);
      queryClient.invalidateQueries(['admin-all-comments']);
      setDeleteDialogOpen(false);
      setSelectedContent(null);
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  // Cleanup damaged images mutation
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('cleanupCorruptedImages', {});
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Cleaned up ${data?.removed_count || 0} damaged images`);
      queryClient.invalidateQueries(['admin-all-posts']);
    },
    onError: (error) => {
      toast.error('Cleanup failed: ' + error.message);
    },
  });

  const handleDeleteClick = (content, type) => {
    setSelectedContent(content);
    setContentType(type);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedContent) return;
    deleteMutation.mutate({ type: contentType, id: selectedContent.id });
  };

  const handleCleanupDamaged = () => {
    cleanupMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgb(6,3,10)' }}>
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
      </div>
    );
  }

  // Filter content by type
  const filteredPosts = posts?.filter(post => {
    if (activeTab === 'photos') return post.post_type === 'feed' && post.image_url;
    if (activeTab === 'videos') return post.post_type === 'reel' || post.video_url;
    if (activeTab === 'youtube') return post.youtube_url;
    if (activeTab === 'text') return post.post_type === 'feed' && !post.image_url && post.caption;
    return true;
  }) || [];

  return (
    <div className="min-h-screen pb-28" style={{ background: 'rgb(6,3,10)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', background: 'rgba(6,3,10,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/admin/dashboard')} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-white text-base">Content Management</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Delete & moderate all content</p>
        </div>
        <button onClick={() => queryClient.invalidateQueries()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <RefreshCw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto space-y-6">
        {/* Emergency Actions */}
        <Card className="border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Emergency Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleCleanupDamaged}
              disabled={cleanupMutation.isPending}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {cleanupMutation.isPending ? 'Cleaning...' : 'Remove All Damaged/Black/White Images'}
            </Button>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-white/5">
            <TabsTrigger value="photos" className="data-[state=active]:bg-orange-500">
              <Camera className="w-4 h-4 mr-1" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-pink-500">
              <Play className="w-4 h-4 mr-1" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="youtube" className="data-[state=active]:bg-red-500">
              <Video className="w-4 h-4 mr-1" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="text" className="data-[state=active]:bg-blue-500">
              <FileText className="w-4 h-4 mr-1" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {activeTab === 'photos' && <Camera className="w-5 h-5 text-orange-400" />}
                  {activeTab === 'videos' && <Play className="w-5 h-5 text-pink-400" />}
                  {activeTab === 'youtube' && <Video className="w-5 h-5 text-red-400" />}
                  {activeTab === 'text' && <FileText className="w-5 h-5 text-blue-400" />}
                  Recent {activeTab}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center text-white/40 py-8">Loading...</div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center text-white/40 py-8">No content found</div>
                ) : (
                  <div className="space-y-2">
                    {filteredPosts.slice(0, 50).map((post, idx) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all"
                      >
                        {post.image_url && (
                          <img src={post.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        )}
                        {post.video_url && (
                          <div className="w-16 h-16 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                            <Play className="w-6 h-6 text-white/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">@{post.author_username}</p>
                          <p className="text-xs text-white/50 truncate">{post.caption || 'No caption'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-[10px] bg-white/10 text-white/60">
                              ❤️ {post.likes_count || 0}
                            </Badge>
                            <Badge className="text-[10px] bg-white/10 text-white/60">
                              💬 {post.comments_count || 0}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(post, 'post')}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stories Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Recent Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storiesLoading ? (
              <div className="text-center text-white/40 py-8">Loading...</div>
            ) : stories?.length === 0 ? (
              <div className="text-center text-white/40 py-8">No stories found</div>
            ) : (
              <div className="space-y-2">
                {stories.slice(0, 30).map((story, idx) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all"
                  >
                    {story.image_url && (
                      <img src={story.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">@{story.username}</p>
                      <p className="text-xs text-white/50 truncate">{story.caption || 'No caption'}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        Views: {story.views?.length || 0} • Expires: {new Date(story.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(story, 'story')}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              Recent Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commentsLoading ? (
              <div className="text-center text-white/40 py-8">Loading...</div>
            ) : comments?.length === 0 ? (
              <div className="text-center text-white/40 py-8">No comments found</div>
            ) : (
              <div className="space-y-2">
                {comments.slice(0, 30).map((comment, idx) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">@{comment.author_username}</p>
                      <p className="text-xs text-white/60 truncate">{comment.text}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        Likes: {comment.likes_count || 0}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(comment, 'comment')}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete the {contentType}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedContent && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                {selectedContent.caption && (
                  <p className="text-sm text-white/80 mb-2">{selectedContent.caption.substring(0, 100)}</p>
                )}
                {selectedContent.text && (
                  <p className="text-sm text-white/80 mb-2">{selectedContent.text}</p>
                )}
                <p className="text-xs text-white/40">
                  Author: @{selectedContent.author_username || selectedContent.username}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}