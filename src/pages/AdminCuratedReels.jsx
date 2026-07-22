import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, Trash2, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCuratedReels() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    youtube_url: '',
    author_name: '',
    author_username: '',
    caption: '',
    category: 'trending',
    source: 'admin_upload',
  });

  const { data: reels = [], isLoading } = useQuery({
    queryKey: ['curated-reels-admin'],
    queryFn: async () => {
      const result = await base44.functions.invoke('getCuratedReelsAdmin', {});
      return result.data?.reels || result.reels || [];
    },
  });

  const addReelMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('addCuratedReel', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curated-reels-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reels-feed'] });
      setShowAddForm(false);
      setFormData({
        title: '',
        video_url: '',
        youtube_url: '',
        author_name: '',
        author_username: '',
        caption: '',
        category: 'trending',
        source: 'admin_upload',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      await base44.entities.CuratedReel.update(id, { is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curated-reels-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reels-feed'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.CuratedReel.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curated-reels-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reels-feed'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addReelMutation.mutate(formData);
  };

  const CATEGORIES = ['trending', 'music', 'comedy', 'dance', 'sports', 'nature', 'tech', 'fashion', 'food', 'travel'];
  const SOURCES = ['admin_upload', 'youtube_shorts', 'creator_permission'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Curated Spicey Clips</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Reel
        </motion.button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        
        {/* Add Form Modal */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
          >
            <h2 className="text-lg font-bold text-white mb-4">Add Curated Reel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
                  placeholder="Amazing Nature Timelapse"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Video URL *</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">YouTube URL (optional)</label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
                    placeholder="https://youtube.com/shorts/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
                    placeholder="Creator Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.author_username}
                    onChange={(e) => setFormData({ ...formData, author_username: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Caption</label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 resize-none"
                  rows={2}
                  placeholder="Description or caption..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50"
                  >
                    {SOURCES.map(src => (
                      <option key={src} value={src} className="bg-slate-900">{src}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addReelMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {addReelMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add Reel'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-2xl font-bold text-white">{reels.length}</p>
            <p className="text-xs text-white/50">Total Reels</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-2xl font-bold text-white">{reels.filter(r => r.is_active).length}</p>
            <p className="text-xs text-white/50">Active</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-2xl font-bold text-white">{reels.filter(r => !r.is_active).length}</p>
            <p className="text-xs text-white/50">Hidden</p>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : reels.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-10 h-10 text-white/30" />
            </div>
            <p className="text-white/50 text-sm">No curated Reels yet</p>
            <p className="text-white/30 text-xs mt-1">Add your first high-quality reel above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reels.map((reel) => (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {reel.thumbnail_url ? (
                    <img
                      src={reel.thumbnail_url}
                      alt={reel.title}
                      className="w-24 h-32 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-32 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-8 h-8 text-white/30" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{reel.title}</h3>
                        <p className="text-white/50 text-sm mt-0.5">@{reel.author_username}</p>
                        <p className="text-white/40 text-xs mt-1 line-clamp-2">{reel.caption}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/70">
                        {reel.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                      <span>{reel.views_count || 0} views</span>
                      <span>•</span>
                      <span>{reel.likes_count || 0} likes</span>
                      <span>•</span>
                      <span className="capitalize">{reel.source}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: reel.id, is_active: !reel.is_active })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          reel.is_active
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {reel.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {reel.is_active ? 'Active' : 'Hidden'}
                      </button>
                      <a
                        href={reel.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </a>
                      <button
                        onClick={() => deleteMutation.mutate(reel.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}