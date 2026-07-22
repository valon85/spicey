import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Image, MapPin, Moon, Utensils, Shirt, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  Stories: Clock,
  Travel: MapPin,
  Night: Moon,
  Food: Utensils,
  Drip: Shirt,
};

const CATEGORY_COLORS = {
  Stories: 'from-purple-500 to-pink-500',
  Travel: 'from-blue-500 to-cyan-500',
  Night: 'from-indigo-500 to-purple-500',
  Food: 'from-orange-500 to-red-500',
  Drip: 'from-pink-500 to-rose-500',
};

export default function CategoryManager({ userId, isOpen, onClose, userPosts }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['profile-categories', userId],
    queryFn: () => base44.entities.ProfileCategory.filter({ user_id: userId }, '-created_date', 50),
    enabled: isOpen && !!userId,
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData) => {
      const result = await base44.entities.ProfileCategory.create(categoryData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-categories'] });
      setShowCreateSheet(false);
      setNewCategoryName('');
      setNewCategoryDesc('');
      toast.success('Category created!');
    },
  });

  const addPostsToCategory = useMutation({
    mutationFn: async ({ categoryId, postIds }) => {
      const category = categories.find(c => c.id === categoryId);
      if (!category) throw new Error('Category not found');
      
      const updatedPostIds = [...new Set([...category.post_ids, ...postIds])];
      await base44.entities.ProfileCategory.update(categoryId, { post_ids: updatedPostIds });
      return updatedPostIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-categories'] });
      setSelectedCategory(null);
      setSelectedPosts([]);
      toast.success('Posts added to category!');
    },
  });

  const handleCreateCategory = () => {
    if (!newCategoryName) return;
    
    const IconComponent = CATEGORY_ICONS[newCategoryName];
    createCategory.mutate({
      user_id: userId,
      name: newCategoryName,
      description: newCategoryDesc,
      post_ids: [],
      is_public: true,
    });
  };

  const handleAddPosts = () => {
    if (!selectedCategory || selectedPosts.length === 0) return;
    addPostsToCategory.mutate({ categoryId: selectedCategory, postIds: selectedPosts });
  };

  const availableCategories = [
    { name: 'Travel', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { name: 'Night', icon: Moon, color: 'from-indigo-500 to-purple-500' },
    { name: 'Food', icon: Utensils, color: 'from-orange-500 to-red-500' },
    { name: 'Drip', icon: Shirt, color: 'from-pink-500 to-rose-500' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Main Category Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a0a2e] to-[#0d0520] rounded-t-3xl"
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 pt-6 pb-4 bg-gradient-to-b from-[#1a0a2e] to-transparent">
                <h2 className="text-xl font-bold text-white">My Collections</h2>
                <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Create New Category Button */}
              <div className="px-4 pb-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateSheet(true)}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <Plus className="w-5 h-5" />
                  Create New Collection
                </motion.button>
              </div>

              {/* Existing Categories */}
              <div className="px-4 pb-32 space-y-3">
                {categories.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 font-semibold">No collections yet</p>
                    <p className="text-white/30 text-sm mt-1">Create your first collection to organize your posts</p>
                  </div>
                ) : (
                  categories.map((category) => {
                    const IconComponent = CATEGORY_ICONS[category.name] || Image;
                    const postCount = category.post_ids?.length || 0;
                    
                    return (
                      <motion.div
                        key={category.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedPosts([]);
                        }}
                        className="relative p-4 rounded-2xl cursor-pointer overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${CATEGORY_COLORS[category.name]}`}>
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-lg">{category.name}</h3>
                            {category.description && (
                              <p className="text-white/40 text-sm mt-0.5 line-clamp-1">{category.description}</p>
                            )}
                            <p className="text-white/30 text-xs mt-1">{postCount} {postCount === 1 ? 'post' : 'posts'}</p>
                          </div>
                          <div className="text-white/30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Category Sheet */}
      <AnimatePresence>
        {showCreateSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-gradient-to-b from-[#1a0a2e] to-[#0d0520] rounded-t-3xl"
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 pt-6 pb-4 bg-gradient-to-b from-[#1a0a2e] to-transparent">
                <h2 className="text-xl font-bold text-white">Create Collection</h2>
                <button onClick={() => setShowCreateSheet(false)} className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Category Type Selection */}
              <div className="px-4 pb-6">
                <label className="text-white/50 text-xs font-semibold ml-1 mb-3 block">Choose Category Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableCategories.map(({ name, icon: Icon, color }) => (
                    <motion.button
                      key={name}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNewCategoryName(name)}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${
                        newCategoryName === name ? 'border-white/30 bg-white/5' : 'border-white/10 bg-white/5'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white font-bold text-sm">{name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="px-4 pb-6">
                <label className="text-white/50 text-xs font-semibold ml-1 mb-2 block">Description (Optional)</label>
                <textarea
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  placeholder="What's this collection about?"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 resize-none"
                  rows={3}
                />
              </div>

              {/* Create Button */}
              <div className="px-4 pb-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName}
                  className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                    boxShadow: '0 0 24px rgba(255,80,0,0.5)',
                  }}>
                  Create Collection
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Posts Sheet */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-gradient-to-b from-[#1a0a2e] to-[#0d0520] rounded-t-3xl"
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 pt-6 pb-4 bg-gradient-to-b from-[#1a0a2e] to-transparent">
                <h2 className="text-xl font-bold text-white">Add Posts</h2>
                <button onClick={() => setSelectedCategory(null)} className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Post Selection Grid */}
              <div className="px-4 pb-8">
                <p className="text-white/40 text-sm mb-4">Select posts to add to this collection</p>
                <div className="grid grid-cols-3 gap-2">
                  {userPosts.map((post) => {
                    const isSelected = selectedPosts.includes(post.id);
                    const thumbnail = post.youtube_thumbnail || post.video_url || post.image_url;
                    
                    return (
                      <motion.div
                        key={post.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedPosts(prev => 
                            prev.includes(post.id) 
                              ? prev.filter(id => id !== post.id)
                              : [...prev, post.id]
                          );
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 ${
                          isSelected ? 'border-orange-500' : 'border-white/10'
                        }`}>
                        {thumbnail ? (
                          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <Image className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Add Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddPosts}
                  disabled={selectedPosts.length === 0}
                  className="w-full mt-6 py-4 rounded-2xl font-bold text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                    boxShadow: '0 0 24px rgba(255,80,0,0.5)',
                  }}>
                  Add {selectedPosts.length} {selectedPosts.length === 1 ? 'Post' : 'Posts'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}