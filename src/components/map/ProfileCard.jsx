import React from 'react';
import { motion } from 'framer-motion';
import { User, MessageCircle, Play, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const isVideoAvatarUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));

export default function ProfileCard({ selected, myProfile, userStates, onClose, onChat, navigate }) {
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return 'now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleChat = async (profile) => {
    try { await base44.functions.invoke('getOrCreateChat', { otherUserId: profile.user_id }); } catch (_) {}
    navigate('/messages', {
      state: {
        directUserId: profile.user_id,
        directUserName: profile.full_name || profile.username,
        directUserUsername: profile.username,
        directUserAvatar: profile.avatar_url,
      },
    });
  };

  const avatarSrc = selected.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.full_name || selected.username || 'U')}&background=a733ff&color=fff&size=120`;
  const userState = userStates[selected.user_id];
  const isLive = userState === 'live';
  const isStory = userState === 'story';

  let ringGradient;
  if (selected._isMe) {
    ringGradient = 'linear-gradient(135deg, #10b981, #34d399)';
  } else if (isLive) {
    ringGradient = 'linear-gradient(135deg, #ff5500, #e91e8c)';
  } else if (isStory) {
    ringGradient = 'linear-gradient(135deg, #a733ff, #e91e8c, #ff5500)';
  } else {
    ringGradient = 'linear-gradient(135deg, #a733ff, #e91e8c)';
  }

  let ringShadow;
  if (selected._isMe) {
    ringShadow = '0 0 24px rgba(16,185,129,0.6)';
  } else if (isLive) {
    ringShadow = '0 0 24px rgba(255,85,0,0.6)';
  } else if (isStory) {
    ringShadow = '0 0 24px rgba(167,51,255,0.6)';
  } else {
    ringShadow = '0 0 24px rgba(167,51,255,0.6)';
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
      style={{ position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 30 }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(10,2,20,0.98), rgba(20,5,38,0.98))',
        border: '1px solid rgba(167,51,255,0.45)',
        borderRadius: 28,
        padding: '20px 18px 18px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(167,51,255,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top gradient line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #ff5500, #e91e8c, #a733ff)' }} />

        {/* Close button */}
        <button onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X style={{ width: 16, height: 16, color: 'white' }} />
        </button>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', padding: 3, flexShrink: 0,
            background: ringGradient,
            boxShadow: ringShadow,
          }}>
            {isVideoAvatarUrl(avatarSrc) ? (
              <span className="spicey-video-avatar-frame" style={{ width: 58, height: 58, borderRadius: '50%' }}>
                <video src={`${avatarSrc}#t=0.1`} muted playsInline loop autoPlay className="spicey-video-avatar-crop" />
              </span>
            ) : (
              <img
                src={avatarSrc}
                style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', display: 'block', background: '#1a0030' }}
                onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=U&background=a733ff&color=fff&size=120'; }}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'white', fontWeight: 800, fontSize: 17, margin: 0, letterSpacing: '-0.3px' }}>
              {selected._isMe ? 'You' : (selected.full_name || selected.username || 'User')}
            </p>
            {selected.username && (
              <p style={{ color: '#e91e8c', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>
                @{selected.username}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {myProfile?.latitude && selected.latitude && !selected._isMe && (
                <>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a733ff', boxShadow: '0 0 4px #a733ff' }} />
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, margin: 0, fontWeight: 500 }}>
                    {getDistance(myProfile.latitude, myProfile.longitude, selected.latitude, selected.longitude)} away
                  </p>
                </>
              )}
              {selected.location_updated_at && (
                <>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px #10b981', animation: 'online-dot 1.5s ease-in-out infinite' }} />
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>
                    {selected._isMe ? 'Your location' : `Active ${timeAgo(selected.location_updated_at)}`}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!selected._isMe && (
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <motion.button whileTap={{ scale: 0.94 }} onClick={() => handleChat(selected)}
              style={{ flex: 1, height: 44, borderRadius: 16,
                background: 'linear-gradient(135deg, #a733ff, #e91e8c)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, color: 'white', fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 16px rgba(167,51,255,0.4)' }}>
              <MessageCircle style={{ width: 18, height: 18 }} />
              Message
            </motion.button>
            <motion.button whileTap={{ scale: 0.94 }}
              onClick={() => { navigate(`/profile/${selected.user_id}`); onClose(); }}
              style={{ flex: 1, height: 44, borderRadius: 16,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14 }}>
              <User style={{ width: 18, height: 18 }} />
              Profile
            </motion.button>
            {isStory && (
              <motion.button whileTap={{ scale: 0.94 }}
                onClick={() => { /* TODO: Open story viewer */ }}
                style={{ width: 44, height: 44, borderRadius: 16,
                  background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(255,85,0,0.4)' }}>
                <Sparkles style={{ width: 18, height: 18, color: 'white' }} />
              </motion.button>
            )}
            {isLive && (
              <motion.button whileTap={{ scale: 0.94 }}
                onClick={() => { navigate('/live'); onClose(); }}
                style={{ width: 44, height: 44, borderRadius: 16,
                  background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(255,85,0,0.4)' }}>
                <Play style={{ width: 18, height: 18, color: 'white', marginLeft: 2 }} />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
