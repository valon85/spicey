import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import useScrollLock from '@/hooks/useScrollLock';
import { toast } from 'sonner';

const isVideoAvatarUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));

export default function EditProfileSheet({ open, onClose, user, onSaved }) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open || !user?.id) return;
    
    const isSpiceySupport = user.email === 'info@spicey.live';
    
    // Fetch full user profile data
    base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1)
      .then(profiles => {
        const profile = profiles[0];
        if (profile) {
          // For Spicey Support, always use "Spicey Team" if full_name is not set or is "Info Spicey"
          const actualDisplayName = isSpiceySupport && (!profile.full_name || profile.full_name === 'Info Spicey') 
            ? 'Spicey Team' 
            : (profile.full_name || user.full_name || '');
          setDisplayName(actualDisplayName);
          setUsername(profile.username || user.email?.split('@')[0] || '');
          setBio(profile.bio || user.bio || '');
          setAvatar(profile.avatar_url || user.avatar_url || '');
        } else {
          setDisplayName(isSpiceySupport ? 'Spicey Team' : (user.full_name || ''));
          setUsername(user.email?.split('@')[0] || '');
          setBio(user.bio || '');
          setAvatar(user.avatar_url || '');
        }
      })
      .catch(() => {
        setDisplayName(isSpiceySupport ? 'Spicey Team' : (user.full_name || ''));
        setUsername(user.email?.split('@')[0] || '');
        setBio(user.bio || '');
        setAvatar(user.avatar_url || '');
      });
  }, [open, user?.id, user?.email]);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const uploaded = await base44.integrations.Core.UploadFile({ file, folder: 'avatars' });
      const fileUrl = uploaded?.file_url || uploaded?.url || uploaded?.publicUrl || uploaded?.data?.file_url || uploaded?.data?.url;
      if (!fileUrl) throw new Error('Upload finished but no image URL was returned.');
      setAvatar(fileUrl);
      toast.success('Profile photo uploaded');
    } catch (error) {
      console.error('[EditProfile] Avatar upload failed:', error);
      toast.error(error?.message || 'Profile photo could not be uploaded');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    const cleanName = displayName.trim();
    const cleanUsername = username
      .trim()
      .replace(/^@+/, '')
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9._]/g, '')
      .toLowerCase();

    if (!cleanName) {
      toast.error('Name is required');
      return;
    }
    if (!cleanUsername) {
      toast.error('Username is required');
      return;
    }

    setSaving(true);
    try {
      // For Spicey Support, always save as "Spicey Team"
      const nameToSave = user.email === 'info@spicey.live' ? 'Spicey Team' : cleanName;
      
      console.log('[EditProfile] Saving profile:', { nameToSave, username: cleanUsername, bio, avatar });
      
      // Update User entity first. Some auth profiles reject MP4 avatar URLs, so keep video avatars in UserProfile.
      try {
        await base44.auth.updateMe({ 
          full_name: nameToSave,
          username: cleanUsername,
          bio,
          avatar_url: avatar 
        });
        console.log('[EditProfile] ✅ User entity updated');
      } catch (authError) {
        const message = String(authError?.message || authError || '');
        const isVideoValidationError = avatar && isVideoAvatarUrl(avatar) && /invalid|valid|url|image|avatar/i.test(message);
        if (!isVideoValidationError) throw authError;
        await base44.auth.updateMe({ 
          full_name: nameToSave,
          username: cleanUsername,
          bio,
        });
        console.warn('[EditProfile] Auth metadata rejected video avatar, keeping it in UserProfile:', message);
      }

      // Update UserProfile entity when the profiles table permits it.
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
        if (profiles.length > 0) {
          const profileId = profiles[0].id;
          await base44.entities.UserProfile.update(profileId, {
            username: cleanUsername,
            bio,
            avatar_url: avatar,
            full_name: nameToSave
          });
          console.log('[EditProfile] ✅ UserProfile entity updated');
        } else {
          await base44.entities.UserProfile.create({
            user_id: user.id,
            username: cleanUsername,
            bio,
            avatar_url: avatar,
            full_name: nameToSave
          });
          console.log('[EditProfile] ✅ UserProfile entity created');
        }
      } catch (profileError) {
        console.warn('[EditProfile] UserProfile row could not be saved, auth metadata was updated:', profileError.message);
      }

      // Sync profile name across all existing posts
      try {
        await base44.functions.invoke('syncProfileName', {});
        console.log('[EditProfile] ✅ Synced display name across all posts');
      } catch (syncErr) {
        console.error('[EditProfile] Sync failed:', syncErr);
      }

      // Force reload user data
      const updatedUser = await base44.auth.me();
      console.log('[EditProfile] ✅ Reloaded user:', updatedUser.full_name);

      setDisplayName(nameToSave);
      setUsername(cleanUsername);
      onSaved?.({ bio, full_name: nameToSave, username: cleanUsername, avatar_url: avatar });
      toast.success('Profile updated');
      onClose();
    } catch (error) {
      console.error('[EditProfile] ❌ Error saving profile:', error);
      toast.error(error?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[90vh] overflow-y-auto"
            style={{ 
              background: 'rgba(15,8,20,0.98)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              WebkitOverflowScrolling: 'touch', 
              overscrollBehavior: 'contain', 
              touchAction: 'pan-y',
              paddingBottom: 'max(28px, calc(env(safe-area-inset-bottom) + 14px))'
            }}
            onTouchStart={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 pt-5 pb-4"
              style={{ 
                background: 'rgba(15,8,20,0.95)', 
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                zIndex: 10
              }}>
              <h3 className="text-white font-extrabold text-lg">Edit Profile</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-5 pb-8">
              {/* Avatar */}
              <div>
                <label className="block text-white font-semibold text-sm mb-3">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {isVideoAvatarUrl(avatar) ? (
                      <span className="spicey-video-avatar-frame w-20 h-20 rounded-full" style={{ border: '2px solid rgba(255,107,53,0.5)' }}>
                        <video src={`${avatar}#t=0.1`} muted playsInline loop autoPlay className="spicey-video-avatar-crop" />
                      </span>
                    ) : (
                      <img src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff5500&color=fff&size=160`}
                        alt="avatar" className="w-20 h-20 rounded-full object-cover" style={{ border: '2px solid rgba(255,107,53,0.5)' }} />
                    )}
                    <div className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.4)' }}>
                      {uploadingAvatar
                        ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Camera className="w-6 h-6 text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Tap photo to change</p>
                    <p className="text-white/40 text-xs mt-0.5">Opens your gallery</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-white font-semibold text-sm mb-2">Display Name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-2xl text-white outline-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              {/* Username */}
              <div>
                <label className="block text-white font-semibold text-sm mb-2">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="w-full px-4 py-3 rounded-2xl text-white outline-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-white font-semibold text-sm mb-2">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl text-white outline-none resize-none text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <p className="text-[11px] text-white/40 mt-1">{bio.length}/150</p>
              </div>

              {/* Save button - Always visible at bottom */}
              <div className="sticky bottom-0 pt-4 pb-2"
                style={{ 
                  background: 'linear-gradient(to top, rgba(15,8,20,0.98) 85%, transparent)',
                  backdropFilter: 'blur(10px)',
                  zIndex: 20,
                  position: 'sticky'
                }}>
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50 transition-all active:scale-[0.98]"
                  style={{ 
                    background: 'linear-gradient(135deg, #ff5500 0%, #e91e8c 55%, #a733ff 100%)', 
                    boxShadow: '0 8px 28px rgba(255,80,0,0.5), 0 2px 10px rgba(200,30,120,0.25)',
                    letterSpacing: '0.02em',
                    zIndex: 30,
                    position: 'relative'
                  }}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    '💾 Save Changes'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
