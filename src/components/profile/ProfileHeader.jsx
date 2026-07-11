import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit3, Link2, BadgeCheck, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import ImageWithFallback from '@/components/feed/ImageWithFallback';

const isVideoAvatarUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));

export default function ProfileHeader({
  isLightMode,
  isOwnProfile,
  profileUser,
  currentUser,
  displayName,
  username,
  avatarSrc,
  STATS,
  bio,
  editingBio,
  bioInput,
  setBioInput,
  setEditingBio,
  setEditProfileOpen,
  setShareSheetOpen,
  handleFollow,
  isFollowing,
  followRequested,
  handleMessage,
  setAvatarModalOpen,
  setAvatarActionOpen,
  uploadingAvatar,
  fileInputRef,
  userBadge,
  setBio,
}) {
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex flex-col items-center mb-6">
        {/* Avatar with gradient border */}
        <div className="relative mb-4">
          <motion.button onClick={() => setAvatarModalOpen(true)} className="active:scale-95 transition-transform">
            <div className="absolute inset-0 rounded-full blur-xl opacity-50 pointer-events-none"
              style={{ background: 'conic-gradient(from 0deg, #FF6B35, #FF2E9D, #FF6B35)' }} />
            <div className="relative rounded-full p-[3px]"
              style={{
                background: 'conic-gradient(from 0deg, #FF6B35, #FF2E9D, #FF6B35)',
                boxShadow: isLightMode ? '0 0 20px rgba(255,107,53,0.3)' : '0 0 32px rgba(255,80,0,0.5)',
              }}>
              <div className="p-[2px] rounded-full" style={{ background: isLightMode ? '#FDF9FF' : 'rgb(6,3,10)' }}>
                {isVideoAvatarUrl(avatarSrc) ? (
                  <span className="spicey-video-avatar-frame w-[100px] h-[100px] rounded-full">
                    <video src={`${avatarSrc}#t=0.1`} muted playsInline loop autoPlay className="spicey-video-avatar-crop" />
                  </span>
                ) : (
                  <ImageWithFallback 
                    src={avatarSrc} 
                    alt={displayName} 
                    className="w-[100px] h-[100px] rounded-full"
                    style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
                    isAvatar={true}
                  />
                )}
              </div>
            </div>
          </motion.button>
          {/* Verified badge */}
          {(userBadge || profileUser?.verified) && (
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#1DA1F2', border: '3px solid', borderColor: isLightMode ? '#FDF9FF' : 'rgb(6,3,10)' }}>
              <BadgeCheck className="w-4 h-4 text-white" />
            </div>
          )}
          {/* Own profile: camera badge */}
          {isOwnProfile && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => fileInputRef.current?.click()} />
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setAvatarActionOpen(true)}
                disabled={uploadingAvatar}
                className="absolute bottom-0 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 text-white"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #FF2E9D)',
                  borderColor: isLightMode ? '#fff' : 'rgb(6,3,10)',
                  boxShadow: '0 0 12px rgba(255,107,53,0.6)',
                }}>
                {uploadingAvatar
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Camera className="w-4 h-4" />}
              </motion.button>
            </>
          )}
        </div>

        {/* Name + Username */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h2 className="text-xl font-bold leading-none" style={{ color: isLightMode ? '#000000' : 'white' }}>{displayName}</h2>
            {userBadge && <VerifiedBadge type={userBadge} size="md" />}
            {!userBadge && profileUser?.verified && <VerifiedBadge type="verified" size="md" />}
          </div>
          <p className="text-sm" style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.4)' }}>@{username}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-4">
          {STATS.map((s, i) => (
            <motion.div key={i} whileTap={{ scale: 0.93 }} className="text-center cursor-pointer">
              <p className="text-xl font-bold leading-tight" style={{ color: isLightMode ? '#000000' : 'white' }}>
                {s.val}
              </p>
              <p className="text-xs mt-0.5 font-semibold uppercase tracking-wide" style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.4)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 w-full mb-4">
          {isOwnProfile ? (
            <>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setEditProfileOpen(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF2E9D 100%)',
                  boxShadow: '0 2px 8px rgba(255,107,53,0.3)',
                }}>
                <Edit3 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> Edit Profile
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShareSheetOpen(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: isLightMode ? '#F0F0F0' : 'rgba(255,255,255,0.1)',
                  color: isLightMode ? '#000000' : 'white',
                }}>
                Share Profile
              </motion.button>
            </>
          ) : (
            <>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleFollow}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: isFollowing
                    ? (isLightMode ? '#F0F0F0' : 'rgba(255,255,255,0.1)')
                    : 'linear-gradient(135deg, #FF6B35 0%, #FF2E9D 100%)',
                  color: isFollowing ? (isLightMode ? '#000000' : 'white') : 'white',
                  boxShadow: !isFollowing ? '0 2px 8px rgba(255,107,53,0.3)' : 'none',
                }}>
                {isFollowing ? 'Following' : 'Follow'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleMessage}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: isLightMode ? '#F0F0F0' : 'rgba(255,255,255,0.1)',
                  color: isLightMode ? '#000000' : 'white',
                }}>
                Message
              </motion.button>
            </>
          )}
        </div>

        {/* Bio */}
        <div className="w-full text-center mb-3">
          {editingBio && isOwnProfile ? (
            <input value={bioInput} onChange={e => setBioInput(e.target.value)} autoFocus
              className="w-full bg-transparent text-sm outline-none text-center"
              style={{ color: isLightMode ? '#000000' : 'white' }}
              placeholder="Write your bio..."
              onBlur={async () => {
                setBio(bioInput);
                setEditingBio(false);
                const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser?.id });
                if (profiles.length > 0) {
                  await base44.entities.UserProfile.update(profiles[0].id, { bio: bioInput });
                }
              }}
              onKeyDown={async e => {
                if (e.key === 'Enter') {
                  setBio(bioInput);
                  setEditingBio(false);
                  const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser?.id });
                  if (profiles.length > 0) {
                    await base44.entities.UserProfile.update(profiles[0].id, { bio: bioInput });
                  }
                }
              }} />
          ) : (
            <p className="text-sm leading-snug" style={{ color: isLightMode ? '#3C3C3C' : 'rgba(255,255,255,0.8)' }}>{bio}</p>
          )}
        </div>

        {/* Link */}
        <div className="flex items-center justify-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" style={{ color: isLightMode ? '#FF2E9D' : '#FB923C' }} />
          <span className="text-xs font-medium" style={{ color: isLightMode ? '#FF2E9D' : '#FB923C' }}>spicey.live/@{username}</span>
        </div>
      </div>
    </div>
  );
}
