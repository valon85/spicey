import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, Star, Upload, ExternalLink, Loader2, Search, Filter, Download } from 'lucide-react';
import BottomNav from '../components/feed/BottomNav';

const CATEGORIES = ['comedy', 'cars', 'travel', 'food', 'sports', 'animals', 'technology', 'motivation', 'luxury', 'entertainment', 'nature', 'fashion', 'music', 'dance', 'fitness'];
const SOURCES = ['pexels', 'pixabay', 'mixkit', 'admin_upload'];

export default function AdminVideoLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState({
    source: 'pexels',
    category: 'comedy',
    count: '20',
  });
  const [uploadData, setUploadData] = useState({
    video_url: '',
    title: '',
    category: 'entertainment',
    author_name: '',
    author_username: '',
    thumbnail_url: '',
    duration_seconds: '',
    tags: '',
    is_featured: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stock-videos-admin'],
    queryFn: async () => {
      const result = await base44.functions.invoke('getStockVideosAdmin', {});
      return result.data || result;
    },
  });

  const importMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('importStockVideos', {
        ...data,
        count: Number(data.count) || 20,
      });
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['stock-videos-admin'] });
      setShowImportModal(false);
      alert(`Successfully imported ${result.imported || 0} videos from ${importData.source}!`);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('addStockVideo', {
        ...data,
        duration_seconds: Number(data.duration_seconds) || 0,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-videos-admin'] });
      setShowUploadForm(false);
      setUploadData({
        video_url: '',
        title: '',
        category: 'entertainment',
        author_name: '',
        author_username: '',
        thumbnail_url: '',
        duration_seconds: '',
        tags: '',
        is_featured: false,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ video_id, ...data }) => {
      await base44.functions.invoke('updateStockVideo', { video_id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-videos-admin'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (video_id) => {
      await base44.functions.invoke('deleteStockVideo', { video_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-videos-admin'] });
    },
  });

  const videos = data?.videos || [];
  const stats = data?.stats || {};

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #0a0014, #0d0520, #050010)' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/admin/dashboard')} className="text-white/60 hover:text-white">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-white">Admin Video Library</h1>
          <div className="w-20" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
            <p className="text-xs text-white/50">Total Videos</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-2xl font-bold text-white">{stats.active || 0}</p>
            <p className="text-xs text-white/50">Active</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
          >
            <option value="all">All</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Auto Import Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/admin/bulk-import')}
          className="w-full py-5 rounded-2xl text-white font-bold text-base mb-6 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 30px rgba(255,80,0,0.6)' }}>
          <Download className="w-6 h-6" />
          Auto Import 400-800 Videos (One-Click)
        </motion.button>

        {/* Manual Import & Upload */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowImportModal(true)}
            className="py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #e91e8c)', boxShadow: '0 0 24px rgba(139,92,246,0.5)' }}>
            <Upload className="w-5 h-5" />
            Import by Category
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadForm(true)}
            className="py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 24px rgba(255,80,0,0.5)' }}>
            <Plus className="w-5 h-5" />
            Add Manual URL
          </motion.button>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-[#0a0014] rounded-3xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Import Stock Videos</h2>
                <button onClick={() => setShowImportModal(false)} className="text-white/50 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Source</label>
                  <select
                    value={importData.source}
                    onChange={(e) => setImportData({ ...importData, source: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  >
                    <option value="pexels">Pexels (requires API key)</option>
                    <option value="pixabay">Pixabay (requires API key)</option>
                  </select>
                  <p className="text-xs text-white/30 mt-1">
                    {importData.source === 'pexels' 
                      ? 'Get free API key at pexels.com/api/new/'
                      : 'Get free API key at pixabay.com/api/docs/'}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Category</label>
                  <select
                    value={importData.category}
                    onChange={(e) => setImportData({ ...importData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Number of Videos</label>
                  <input
                    type="number"
                    value={importData.count}
                    onChange={(e) => setImportData({ ...importData, count: e.target.value })}
                    placeholder="20"
                    min="1"
                    max="50"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                  <p className="text-xs text-white/30 mt-1">Max 50 per import</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => importMutation.mutate(importData)}
                  disabled={importMutation.isPending}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #e91e8c)' }}>
                  {importMutation.isPending ? 'Importing...' : `Import ${importData.count} Videos`}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg bg-[#0a0014] rounded-3xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Add Stock Video</h2>
                <button onClick={() => setShowUploadForm(false)} className="text-white/50 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Video URL *</label>
                  <input
                    type="url"
                    value={uploadData.video_url}
                    onChange={(e) => setUploadData({ ...uploadData, video_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Title *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="Video title"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 font-semibold mb-1 block">Category *</label>
                    <select
                      value={uploadData.category}
                      onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-semibold mb-1 block">Source *</label>
                    <select
                      value={uploadData.source}
                      onChange={(e) => setUploadData({ ...uploadData, source: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                    >
                      {SOURCES.map(src => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 font-semibold mb-1 block">Author Name *</label>
                    <input
                      type="text"
                      value={uploadData.author_name}
                      onChange={(e) => setUploadData({ ...uploadData, author_name: e.target.value })}
                      placeholder="Creator name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-semibold mb-1 block">Author Username</label>
                    <input
                      type="text"
                      value={uploadData.author_username}
                      onChange={(e) => setUploadData({ ...uploadData, author_username: e.target.value })}
                      placeholder="@username"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Thumbnail URL</label>
                  <input
                    type="url"
                    value={uploadData.thumbnail_url}
                    onChange={(e) => setUploadData({ ...uploadData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Duration (seconds)</label>
                  <input
                    type="number"
                    value={uploadData.duration_seconds}
                    onChange={(e) => setUploadData({ ...uploadData, duration_seconds: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1 block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                    placeholder="trending, viral, funny"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={uploadData.is_featured}
                    onChange={(e) => setUploadData({ ...uploadData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/5 border-white/10"
                  />
                  <span className="text-sm text-white/70">Featured (appears more often)</span>
                </label>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => uploadMutation.mutate(uploadData)}
                  disabled={uploadMutation.isPending || !uploadData.video_url || !uploadData.title || !uploadData.author_name}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Videos List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-10 h-10 text-white/30" />
            </div>
            <p className="text-white/50 text-sm">No videos found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
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
                        <h3 className="text-white font-semibold truncate">{video.title}</h3>
                        <p className="text-white/50 text-sm mt-0.5">@{video.author_username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/10 text-white/70">
                            {video.category}
                          </span>
                          <span className="text-xs text-white/40">{video.source}</span>
                          {video.is_featured && (
                            <span className="flex items-center gap-1 text-xs text-yellow-400">
                              <Star className="w-3 h-3 fill-yellow-400" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
                      <span>{video.views_count || 0} views</span>
                      <span>•</span>
                      <span>{video.likes_count || 0} likes</span>
                      {video.duration_seconds && (
                        <>
                          <span>•</span>
                          <span>{Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}</span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateMutation.mutate({ video_id: video.id, is_active: !video.is_active })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          video.is_active
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {video.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {video.is_active ? 'Active' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => updateMutation.mutate({ video_id: video.id, is_featured: !video.is_featured })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          video.is_featured
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-white/10 text-white/60 hover:bg-white/15'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${video.is_featured ? 'fill-yellow-400' : ''}`} />
                        {video.is_featured ? 'Featured' : 'Feature'}
                      </button>
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </a>
                      <button
                        onClick={() => deleteMutation.mutate(video.id)}
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

      <BottomNav />
    </div>
  );
}