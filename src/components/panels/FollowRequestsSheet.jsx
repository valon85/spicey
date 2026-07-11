import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FollowRequestsSheet({ open, onClose }) {
  const [requests, setRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!open) return;
    base44.auth.me().then(user => {
      setCurrentUser(user);
      base44.entities.FollowRequest.filter({ target_id: user.id, status: 'pending' }, '-created_date', 50)
        .then(setRequests);
    });
  }, [open]);

  const handleApprove = async (req) => {
    // Create the Follow record
    await base44.entities.Follow.create({
      follower_id: req.requester_id,
      following_id: currentUser.id,
      follower_username: req.requester_username || '',
      following_username: currentUser.email?.split('@')[0] || 'user',
    });

    // Update counts
    const [followerProfiles, myProfiles] = await Promise.all([
      base44.entities.UserProfile.filter({ user_id: req.requester_id }),
      base44.entities.UserProfile.filter({ user_id: currentUser.id }),
    ]);
    if (followerProfiles[0]) {
      await base44.entities.UserProfile.update(followerProfiles[0].id, {
        following_count: (followerProfiles[0].following_count || 0) + 1
      });
    }
    if (myProfiles[0]) {
      await base44.entities.UserProfile.update(myProfiles[0].id, {
        followers_count: (myProfiles[0].followers_count || 0) + 1
      });
    }

    // Mark request as approved + notify
    await base44.entities.FollowRequest.update(req.id, { status: 'approved' });
    await base44.entities.Notification.create({
      user_id: req.requester_id,
      type: 'follow',
      actor_id: currentUser.id,
      actor_username: currentUser.email?.split('@')[0] || 'user',
      actor_avatar: '',
      message: 'approved your follow request',
      read: false,
    });

    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleReject = async (req) => {
    await base44.entities.FollowRequest.update(req.id, { status: 'rejected' });
    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50 bg-black/60" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col"
            style={{ background: 'rgba(14,7,22,0.99)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '80vh' }}>

            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-400" />
                <h2 className="text-white font-bold text-base">Follow Requests</h2>
                {requests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                    {requests.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-10 space-y-2">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <UserCheck className="w-12 h-12 text-white/15" />
                  <p className="text-white/40 text-sm">No pending requests</p>
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <img
                      src={req.requester_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester_name || req.requester_username || 'U')}&background=1a0a2e&color=fff&size=80`}
                      alt={req.requester_name}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{req.requester_name || req.requester_username}</p>
                      <p className="text-xs text-white/40">@{req.requester_username}</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleApprove(req)}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,80,0,0.2)', border: '1px solid rgba(255,80,0,0.4)' }}>
                        <Check className="w-4 h-4 text-orange-400" />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleReject(req)}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(220,30,30,0.15)', border: '1px solid rgba(220,30,30,0.3)' }}>
                        <X className="w-4 h-4 text-red-400" />
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}