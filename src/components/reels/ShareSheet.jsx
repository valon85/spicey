import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useScrollLock from '@/hooks/useScrollLock';

export default function ShareSheet({ reel, open, onClose }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useScrollLock(open);

  const { data: follows = [] } = useQuery({
    queryKey: ['my-follows'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Follow.filter({ follower_id: user.id });
    },
    enabled: open,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile-share'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      return profiles[0];
    },
    enabled: open,
  });

  const handleSend = async () => {
    if (selectedUsers.length === 0 || !reel) return;
    setSending(true);

    try {
      const user = await base44.auth.me();
      
      // Send message to each selected user
      for (const follow of follows) {
        if (selectedUsers.includes(follow.following_id)) {
          // Get or create chat
          const chat = await base44.functions.invoke('getOrCreateChat', {
            participantIds: [user.id, follow.following_id]
          });

          // Send message with reel link
          await base44.functions.invoke('sendMessage', {
            chatId: chat.id,
            senderId: user.id,
            text: `Check out this reel: ${window.location.href}`,
            imageUrl: reel.image_url || reel.video_url
          });
        }
      }

      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
        setSelectedUsers([]);
      }, 1500);
    } catch (error) {
      console.error('Error sending reel:', error);
    } finally {
      setSending(false);
    }
  };

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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
            onClick={onClose}
            className="fixed inset-0 z-[9998]"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, rgba(22,10,38,0.99), rgba(10,5,18,1))',
              border: '1px solid rgba(255,255,255,0.08)',
              maxHeight: '70vh',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-white/5">
              <h3 className="font-extrabold text-base text-white">
                Send to Friends
              </h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}
                  >
                    <Send className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-white font-bold">Sent!</p>
                </div>
              ) : follows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <User className="w-12 h-12 text-white/30" />
                  <p className="text-white/40 text-sm">No friends yet. Follow people to share with them!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {follows.map((follow) => (
                    <button
                      key={follow.id}
                      onClick={() => toggleUser(follow.following_id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                        selectedUsers.includes(follow.following_id)
                          ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30'
                          : 'bg-white/5 border border-white/5'
                      }`}
                    >
                      <img
                        src={follow.following_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(follow.following_username)}&background=6d28d9&color=fff&size=40`}
                        alt={follow.following_username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-white font-bold text-sm">@{follow.following_username}</p>
                      </div>
                      {selectedUsers.includes(follow.following_id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}
                        >
                          <Send className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send Button */}
            {!sent && selectedUsers.length > 0 && (
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  style={{
                    background: sending ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ff5500, #e91e8c)',
                    boxShadow: '0 0 20px rgba(255,80,0,0.4)'
                  }}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send to {selectedUsers.length} Friend{selectedUsers.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}