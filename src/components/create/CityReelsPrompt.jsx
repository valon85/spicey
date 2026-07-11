import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MapPin, X, Check, Loader2, Video, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function CityReelsPrompt({ open, postId, cityName, postType, hasVideo, onClose }) {
  const [posting, setPosting] = useState(false);

  const handlePostToCity = async () => {
    if (!postId || !cityName || posting) return;
    setPosting(true);

    try {
      // Update based on post type
      if (postType === 'story') {
        await base44.entities.Story.update(postId, {
          map_visible: true,
          map_city: cityName.trim(),
        });
      } else {
        await base44.entities.Post.update(postId, {
          map_visible: true,
          map_city: cityName.trim(),
        });
      }

      toast.success(`Posted to ${cityName} City Reels!`);
      if (onClose) onClose(true);
    } catch (err) {
      console.error('Failed to post to city reels:', err);
      toast.error('Failed to post to city reels. Please try again.');
      if (onClose) onClose(false);
    } finally {
      setPosting(false);
    }
  };

  const handleSkip = () => {
    if (onClose) onClose(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center px-4"
          >
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(20,10,35,0.98), rgba(8,4,16,0.99))',
                border: '1px solid rgba(255,85,0,0.3)',
                boxShadow: '0 0 60px rgba(255,85,0,0.4), 0 0 120px rgba(233,30,140,0.25)',
              }}
            >
              {/* Header with icon */}
              <div className="flex flex-col items-center pt-8 pb-4 px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,85,0,0.25), rgba(233,30,140,0.2))',
                    border: '2px solid rgba(255,85,0,0.5)',
                    boxShadow: '0 0 30px rgba(255,85,0,0.4)',
                  }}
                >
                  {postType === 'reel' || hasVideo ? (
                    <Video className="w-10 h-10" style={{ color: '#ff5500' }} />
                  ) : (
                    <Image className="w-10 h-10" style={{ color: '#ff5500' }} />
                  )}
                </motion.div>
                <h2 className="text-white font-bold text-xl text-center mb-1">
                  Post on City Reels?
                </h2>
                <p className="text-white/50 text-sm text-center">
                  Share your {postType === 'reel' ? 'reel' : postType === 'story' ? 'story' : 'post'} with people in{' '}
                  <span className="text-orange-400 font-semibold">{cityName || 'your city'}</span>
                </p>
              </div>

              {/* Description */}
              <div className="px-6 pb-6">
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: 'rgba(255,85,0,0.08)',
                    border: '1px solid rgba(255,85,0,0.2)',
                  }}
                >
                  <p className="text-white/70 text-xs leading-relaxed">
                    📍 Your {postType} will appear on the Spicey City Map under {cityName}, 
                    making it discoverable by others exploring content from this location.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSkip}
                    disabled={posting}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    No, Thanks
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handlePostToCity}
                    disabled={posting}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                      boxShadow: '0 0 20px rgba(255,85,0,0.4)',
                    }}
                  >
                    {posting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Yes, Post It!
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}