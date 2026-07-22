import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { spiceyApi } from '@/api/spiceyApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Settings, Camera, Grid3X3, Play, Bookmark,
  BadgeCheck, Share2, Flame, Edit3, Link2, Heart, MessageCircle, X, Trash2, ChevronLeft, Lock, Unlock, UserCheck, UserPlus, Type, Clock, MapPin, Moon, Utensils, Shirt, Mail, MessageSquare, Facebook, Instagram, Twitter, Crown, Shield, Upload, Bell, MoreHorizontal, Plus, Sparkles, Clapperboard, Plane, Users
} from 'lucide-react';
import DeleteConfirmSheet from '@/components/shared/DeleteConfirmSheet';
import { toast } from 'sonner';
import CategoryManager from '@/components/profile/CategoryManager';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import BottomNavEnhanced from '../components/feed/BottomNavEnhanced';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileSheet from '../components/panels/EditProfileSheet.jsx';
import AvatarPickerSheet from '@/components/profile/AvatarPickerSheet';

import PhotoViewer from '../components/feed/PhotoViewer.jsx';
import FollowRequestsSheet from '../components/panels/FollowRequestsSheet.jsx';
import ShareSheet from '../components/panels/ShareSheet.jsx';
import ImageWithFallback from '@/components/feed/ImageWithFallback';
import { PROFILE_THEMES } from '@/components/profile/ProfileThemePicker';
import { usePageBackground, useIsLightMode } from '@/hooks/usePageBackground';
const HIGHLIGHTS = [
  { label: 'New', icon: Plus, color: '#ff4bd8' },
  { label: 'Travel', icon: Plane, color: '#ff6b35' },
  { label: 'Food', icon: Utensils, color: '#ff2e9d' },
  { label: 'Lifestyle', icon: Sparkles, color: '#c100ff' },
  { label: 'Behind scenes', icon: Clapperboard, color: '#ff6b35' },
  { label: 'Q&A', icon: MessageCircle, color: '#ff2e9d' },
];

const SPICEY_ORIGINAL_LOGO = 'https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a7812bd9b_841b8be5-b1e6-4719-9a32-36fafbb51084.png';

const isVideoAvatarUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));

const PROFILE_PLACEHOLDERS = new Set(['user', 'empty user', 'empty', 'unknown', 'profile']);

function realProfileText(...values) {
  return values.find((value) => {
    const text = String(value || '').trim();
    return text && !PROFILE_PLACEHOLDERS.has(text.toLowerCase());
  }) || '';
}

function compactNumber(value = 0) {
  const num = Number(value) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(num >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(num);
}

function getProfilePostMedia(post = {}) {
  return post.image_url || post.media_url || post.thumbnail_url || post.cover_url || post.video_thumbnail_url || '';
}

function getProfilePostCategory(post = {}) {
  const text = `${post.type || ''} ${post.post_type || ''} ${post.category || ''} ${post.caption || ''}`.toLowerCase();
  if (post.video_url || post.youtube_url || text.includes('reel') || text.includes('video')) return 'Spicey Clips';
  if (text.includes('ai') || text.includes('studio')) return 'AI Memories';
  if (text.includes('story')) return 'Stories';
  return 'Posts';
}

function getProfilePostDate(post = {}) {
  const raw = post.created_date || post.created_at || post.updated_date || post.date;
  if (!raw) return 'New';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return 'New';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function readPreviewUser() {
  if (typeof window === 'undefined') return null;
  const keys = ['spicey_user', 'currentUser', 'user', 'base44_user'];
  for (const key of keys) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || sessionStorage.getItem(key) || 'null');
      const user = parsed?.user || parsed?.data?.user || parsed;
      if (user?.id || user?.email || user?.full_name || user?.avatar_url) return user;
    } catch (_) {
      // Ignore malformed preview cache entries.
    }
  }
  return null;
}

function makePreviewProfile() {
  return {
    id: 'preview-valon',
    user_id: 'preview-valon',
    email: 'valondervishi13@gmail.com',
    full_name: 'Valon Dervishi',
    username: 'valondervishi13',
    bio: 'Founder of Spicey. Creating the next generation of social networking.',
    location: 'New York, USA',
    followers_count: 24600,
    following_count: 1200,
    likes_count: 987000,
    avatar_url: 'https://ui-avatars.com/api/?name=Valon%20Dervishi&background=ff5500&color=fff&size=256',
  };
}



const TABS = [
  { icon: Grid3X3, key: 'posts', label: 'Posts' },
  { icon: Play, key: 'reels', label: 'Clips' },
  { icon: Bookmark, key: 'saved', label: 'Saved' },
];

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const liveIsLightMode = useIsLightMode();
  const previewTheme = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('previewTheme') : null;
  const isLocalProfilePreview = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && window.location.pathname.startsWith('/profile');
  const isLightMode = previewTheme === 'light' ? true : previewTheme === 'dark' ? false : liveIsLightMode;
  const pageBg = usePageBackground();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [bioInput, setBioInput] = useState('');
  const fileInputRef = useRef(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [followRequestsOpen, setFollowRequestsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequested, setFollowRequested] = useState(false);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarActionOpen, setAvatarActionOpen] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [userBadge, setUserBadge] = useState(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [avatarLikes, setAvatarLikes] = useState(0);
  const [avatarFire, setAvatarFire] = useState(0);
  const [coverLikes, setCoverLikes] = useState(0);
  const [coverFire, setCoverFire] = useState(0);
  const [userAvatarLiked, setUserAvatarLiked] = useState(false);
  const [userAvatarFired, setUserAvatarFired] = useState(false);
  const [userCoverLiked, setUserCoverLiked] = useState(false);
  const [userCoverFired, setUserCoverFired] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileTheme, setProfileTheme] = useState('default');
  const [energyFilmOpen, setEnergyFilmOpen] = useState(false);
  const [aiIntroOpen, setAiIntroOpen] = useState(false);
  const [avatarCommentOpen, setAvatarCommentOpen] = useState(false);
  const [avatarCommentText, setAvatarCommentText] = useState('');
  const [avatarComments, setAvatarComments] = useState([]);
  const previewUser = isLocalProfilePreview ? readPreviewUser() : null;

  // Reload profile when saved
  const reloadProfile = async () => {
    if (!currentUser) return;
    const targetId = userId && userId !== currentUser.id ? userId : currentUser.id;
    
    try {
      const response = await base44.functions.invoke('getUserProfile', { userId: targetId });
      const profile = response.data || response;
      if (profile && profile.id) {
        const isSpiceySupport = currentUser.email === 'info@spicey.live';
        setProfileUser({
          id: currentUser.id,
          ...profile,
          full_name: isSpiceySupport ? 'Info Spicey' : (profile.full_name || currentUser.full_name || currentUser.email?.split('@')[0] || 'User'),
          email: currentUser.email,
          avatar_url: profile.avatar_url || currentUser.avatar_url || '',
        });
        setBio(profile.bio || currentUser.bio || '');
      }
    } catch (err) {
      console.error('[Profile] Failed to reload:', err);
    }
  };

  useEffect(() => {
    setProfileLoading(true);
    setProfileUser(null);
    const previewFallback = isLocalProfilePreview ? makePreviewProfile() : null;
    const previewFallbackTimer = previewFallback
      ? setTimeout(() => {
        setCurrentUser(prev => prev || previewFallback);
        setProfileUser(prev => prev || previewFallback);
        setBio(prev => prev || previewFallback.bio);
        setBioInput(prev => prev || previewFallback.bio);
        setIsPrivate(false);
        setProfileLoading(false);
      }, 2200)
      : null;
    
    base44.auth.me().then(async user => {
     if (previewFallbackTimer) clearTimeout(previewFallbackTimer);
     if (!user) {
       if (previewFallback) {
         setCurrentUser(previewFallback);
         setProfileUser(previewFallback);
         setBio(previewFallback.bio);
         setBioInput(previewFallback.bio);
         setIsPrivate(false);
       }
       setProfileLoading(false);
       return;
     }

     setCurrentUser(user);
     // Admin users: info@spicey.live and valondervishi13@gmail.com
     const adminEmails = ['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com'];
     const adminStatus = adminEmails.includes((user.email || '').toLowerCase());
     setIsAdmin(adminStatus);
     console.log('[Profile] User:', user.email, 'Role:', user.role, 'Is admin:', adminStatus, 'Viewing userId:', userId, 'isAdmin state:', adminStatus);

     // For info@spicey.live, always show their profile even if userId is undefined
     const isSpiceySupport = user.email === 'info@spicey.live';
     const targetId = userId && userId !== user.id ? userId : user.id;
     const isOwn = !userId || userId === user.id;

      if (!isOwn) {
        // Load other user's profile — clear profileUser first to prevent stale data showing
        setProfileUser(null);
        base44.functions.invoke('getUserProfile', { userId: targetId }).then(async response => {
          const profile = response.data || response;
          if (profile && (profile.id || profile.user_id)) {
            setProfileUser(profile);
            setBio(profile.bio || user.bio || '');
            setBioInput(profile.bio || user.bio || '');
            setIsPrivate(profile.is_private === true);
            setProfileTheme(profile.profile_theme || 'default');
          } else {
            // Profile doesn't exist - show error state
            console.error('[Profile] No profile found for user', targetId);
            setProfileUser(null);
          }
        }).catch((err) => {
          console.error('[Profile] Failed to load profile:', err);
          setProfileUser(null);
        }).finally(() => setProfileLoading(false));

        base44.functions.invoke('getUserSubscription', { userId: targetId }).then(response => {
          const data = response.data || response;
          const badgeToSet = data.planType || data.subscription?.plan_type || data.subscription?.plan || null;
          setUserBadge(data.hasSubscription && badgeToSet ? badgeToSet : null);
        }).catch(() => setUserBadge(null));

        // Load photo reactions
        loadPhotoReactions(targetId, user.id);
      } else {
        // Load own profile - CRITICAL: Never fall back to generic "user"
        base44.entities.UserProfile.filter({ user_id: user.id }).then(profiles => {
          const profile = profiles[0];
          const fallbackBio = user.bio || 'Living life with flavor. Creator & vibe curator ✨';
          
          if (profile) {
            // Profile exists - use it
            // Special case: Info Spicey (Spicey Support) account
            const isSpiceySupport = user.email === 'info@spicey.live';
            setProfileUser({
              id: user.id,
              ...profile,
              full_name: isSpiceySupport ? 'Info Spicey' : (profile.full_name || user.full_name || user.email?.split('@')[0] || 'User'),
              email: user.email,
              avatar_url: profile.avatar_url || user.avatar_url || '',
            });
            setBio(profile.bio || fallbackBio);
            setBioInput(profile.bio || fallbackBio);
            setIsPrivate(profile.is_private === true);
            setProfileTheme(profile.profile_theme || 'default');
          } else {
            const defaultUsername = user.email?.split('@')[0] || 'user';
            const defaultFullName = user.full_name || defaultUsername;
            const isSpiceySupport = user.email === 'info@spicey.live';
            setProfileUser({
              id: user.id,
              user_id: user.id,
              full_name: isSpiceySupport ? 'Info Spicey' : defaultFullName,
              username: defaultUsername,
              email: user.email,
              avatar_url: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(isSpiceySupport ? 'Info Spicey' : defaultFullName)}&background=ff5500&color=fff&size=256`,
            });
            setBio(fallbackBio);
            setBioInput(fallbackBio);
            setIsPrivate(false);
          }
        }).catch(err => {
          console.error('[Profile] Error loading profile:', err);
          // Never fall back to "user" - use actual user data
          setProfileUser({
            id: user.id,
            full_name: user.full_name || user.email?.split('@')[0] || 'User',
            username: user.email?.split('@')[0] || 'user',
            email: user.email,
            avatar_url: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=ff5500&color=fff&size=256`,
          });
          setBio('Living life with flavor. Creator & vibe curator ✨');
          setBioInput('Living life with flavor. Creator & vibe curator ✨');
          setIsPrivate(false);
        }).finally(() => setProfileLoading(false));
        
        setIsFollowing(false);
        loadPhotoReactions(user.id, user.id);

        base44.functions.invoke('getUserSubscription', {}).then(response => {
          const data = response.data || response;
          const badgeToSet = data.planType || data.subscription?.plan_type || data.subscription?.plan || (user?.email === 'info@spicey.live' ? 'business' : null);
          setUserBadge((data.hasSubscription && badgeToSet) || user?.email === 'info@spicey.live' ? badgeToSet : null);
        }).catch(() => {
          if (user?.email === 'info@spicey.live') setUserBadge('business');
        });

        // Auto-sync display name across posts when viewing own profile (cached - only once per session)
        if (!sessionStorage.getItem('profileNameSynced')) {
          sessionStorage.setItem('profileNameSynced', 'true');
          base44.functions.invoke('syncProfileName', {}).catch(() => {});
        }
      }
    }).catch(err => {
      if (previewFallbackTimer) clearTimeout(previewFallbackTimer);
      console.error('[Profile] Auth error:', err);
      if (previewFallback) {
        setCurrentUser(previewFallback);
        setProfileUser(previewFallback);
        setBio(previewFallback.bio);
        setBioInput(previewFallback.bio);
        setIsPrivate(false);
      }
      setProfileLoading(false);
    });
    return () => {
      if (previewFallbackTimer) clearTimeout(previewFallbackTimer);
    };
  }, [userId]);

  const loadPhotoReactions = async (profileUserId, currentUserId) => {
    try {
      const [avatarReactions, coverReactions] = await Promise.all([
        base44.entities.ProfilePhotoReaction.filter({ user_id: profileUserId, photo_type: 'avatar' }),
        base44.entities.ProfilePhotoReaction.filter({ user_id: profileUserId, photo_type: 'cover' }),
      ]);
      setAvatarLikes(avatarReactions.filter(r => r.type === 'like').length);
      setAvatarFire(avatarReactions.filter(r => r.type === 'fire').length);
      setUserAvatarLiked(avatarReactions.some(r => r.type === 'like' && r.created_by === currentUserId));
      setUserAvatarFired(avatarReactions.some(r => r.type === 'fire' && r.created_by === currentUserId));
      setCoverLikes(coverReactions.filter(r => r.type === 'like').length);
      setCoverFire(coverReactions.filter(r => r.type === 'fire').length);
      setUserCoverLiked(coverReactions.some(r => r.type === 'like' && r.created_by === currentUserId));
      setUserCoverFired(coverReactions.some(r => r.type === 'fire' && r.created_by === currentUserId));
    } catch (_) {
      setAvatarLikes(0);
      setAvatarFire(0);
      setCoverLikes(0);
      setCoverFire(0);
    }
  };

  const toggleReaction = async (photoType, reactionType) => {
    if (!currentUser || !profileAuthId) return;
    try {
      const existing = await base44.entities.ProfilePhotoReaction.filter({
        user_id: profileAuthId,
        photo_type: photoType,
        created_by: currentUser.email,
        type: reactionType
      });

      if (existing.length > 0) {
        await base44.entities.ProfilePhotoReaction.delete(existing[0].id);
        if (photoType === 'avatar') {
          if (reactionType === 'like') setAvatarLikes(Math.max(0, avatarLikes - 1));
          if (reactionType === 'fire') setAvatarFire(Math.max(0, avatarFire - 1));
          if (reactionType === 'like') setUserAvatarLiked(false);
          if (reactionType === 'fire') setUserAvatarFired(false);
        } else {
          if (reactionType === 'like') setCoverLikes(Math.max(0, coverLikes - 1));
          if (reactionType === 'fire') setCoverFire(Math.max(0, coverFire - 1));
          if (reactionType === 'like') setUserCoverLiked(false);
          if (reactionType === 'fire') setUserCoverFired(false);
        }
      } else {
        await base44.entities.ProfilePhotoReaction.create({
          user_id: profileAuthId,
          photo_type: photoType,
          reactor_id: currentUser.id,
          type: reactionType
        });
        if (photoType === 'avatar') {
          if (reactionType === 'like') setAvatarLikes(avatarLikes + 1);
          if (reactionType === 'fire') setAvatarFire(avatarFire + 1);
          if (reactionType === 'like') setUserAvatarLiked(true);
          if (reactionType === 'fire') setUserAvatarFired(true);
        } else {
          if (reactionType === 'like') setCoverLikes(coverLikes + 1);
          if (reactionType === 'fire') setCoverFire(coverFire + 1);
          if (reactionType === 'like') setUserCoverLiked(true);
          if (reactionType === 'fire') setUserCoverFired(true);
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  // Only treat as own profile once currentUser is confirmed loaded.
  // If userId param exists but currentUser not yet loaded, default to OTHER profile (no flicker).
  const isOwnProfile = !userId || (!!currentUser && userId === currentUser.id);

  // Derived display values — use actual data, never fall back to "user"
  const isSpiceySupport = profileUser?.email === 'info@spicey.live' || (isOwnProfile && currentUser?.email === 'info@spicey.live');
  const _username = profileUser?.username || currentUser?.email?.split('@')[0] || 'user';
  const _displayName = profileUser?.full_name || currentUser?.full_name || _username;

  const saveAvatarUrl = async (avatar_url) => {
    if (!currentUser?.id) throw new Error('Login required.');

    let authUpdateSkipped = false;
    try {
      await base44.auth.updateMe({ avatar_url });
    } catch (error) {
      const message = String(error?.message || error || '');
      const isVideoValidationError = avatar_url && isVideoAvatarUrl(avatar_url) && /invalid|valid|url|image|avatar/i.test(message);
      if (!isVideoValidationError) throw error;
      authUpdateSkipped = true;
      console.warn('[Profile] Auth metadata rejected video avatar, saving it to UserProfile only:', message);
    }

    try {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id }, '-created_date', 1);
      if (profiles?.[0]?.id) {
        await base44.entities.UserProfile.update(profiles[0].id, { avatar_url });
      } else {
        const username = profileUser?.username || currentUser.email?.split('@')[0] || 'user';
        const fullName = profileUser?.full_name || currentUser.full_name || username;
        await base44.entities.UserProfile.create({
          user_id: currentUser.id,
          username,
          full_name: fullName,
          bio: bio || 'Living life with flavor. Creator & vibe curator ✨',
          avatar_url,
        });
      }
    } catch (error) {
      console.warn('[Profile] Profile row could not be saved, avatar kept in auth metadata:', error.message);
    }

    const updated = authUpdateSkipped ? null : await base44.auth.me().catch(() => null);
    setCurrentUser(prev => ({ ...(updated || prev || currentUser), avatar_url }));
    setProfileUser(prev => ({ ...(prev || {}), avatar_url }));
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  const handleAvatarUpload = async (input) => {
    const file = input?.target?.files?.[0] || input;
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const uploaded = typeof file === 'string'
        ? { file_url: file }
        : await base44.integrations.Core.UploadFile({ file, folder: 'avatars' });
      const avatar_url = uploaded?.file_url || uploaded?.url || uploaded?.publicUrl || uploaded?.data?.file_url || uploaded?.data?.url;
      if (!avatar_url) throw new Error('Upload finished but no image URL was returned.');
      await saveAvatarUrl(avatar_url);
      toast.success('Avatar updated');
    } catch (err) {
      console.error('[Profile] Avatar upload error:', err);
      toast.error(err?.message || 'Avatar could not be updated');
    } finally {
      setUploadingAvatar(false);
      if (input?.target) input.target.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    try {
      await saveAvatarUrl('');
      toast.success('Avatar removed');
    } catch (err) {
      console.error('[Profile] Avatar remove error:', err);
      toast.error('Avatar could not be removed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // The auth user id for this profile — always use URL userId for other profiles
  const profileAuthId = userId && userId !== currentUser?.id
    ? (profileUser?.user_id || profileUser?.auth_user_id || userId)
    : currentUser?.id;

  useEffect(() => {
    if (!currentUser?.id || !profileAuthId || isOwnProfile) return;
    let cancelled = false;
    spiceyApi.follows.status(profileAuthId).then((status) => {
      if (cancelled) return;
      setIsFollowing(!!status?.following);
      setFollowRequested(!!status?.requested);
    }).catch((error) => console.warn('[Profile] Follow status failed:', error?.message || error));
    return () => { cancelled = true; };
  }, [currentUser?.id, profileAuthId, isOwnProfile]);

  const queryClient = useQueryClient();
  const [deletedPostIds, setDeletedPostIds] = useState(new Set());
  const [deleteFirstClick, setDeleteFirstClick] = useState(null);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [deletingStory, setDeletingStory] = useState(false);
  const [postActionSheet, setPostActionSheet] = useState(null); // { post }
  const longPressTimerRef = useRef(null);

  const handlePostLongPress = (p) => {
    if (!isOwnProfile) return;
    longPressTimerRef.current = setTimeout(() => {
      setPostActionSheet({ post: p });
    }, 500);
  };
  const handlePostLongPressCancel = () => {
    clearTimeout(longPressTimerRef.current);
  };

  const handleDeletePost = (postId) => {
    setPostActionSheet(null);
    setDeletedPostIds(prev => new Set([...prev, postId]));
    base44.entities.Post.delete(postId).catch(() => {
      setDeletedPostIds(prev => { const s = new Set(prev); s.delete(postId); return s; });
    });
  };

  const { data: myPosts = [] } = useQuery({
    queryKey: ['profile-posts', profileAuthId],
    queryFn: () => base44.entities.Post.filter({ author_id: profileAuthId }, '-created_date', 50),
    enabled: !!profileAuthId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const { data: myStories = [] } = useQuery({
    queryKey: ['profile-stories', profileAuthId],
    queryFn: async () => {
      const stories = await base44.entities.Story.filter({ user_id: profileAuthId }, '-created_date', 20);
      return stories.filter(s => new Date(s.expires_at) > new Date());
    },
    enabled: !!profileAuthId && isOwnProfile,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleDeleteStory = async () => {
    if (!storyToDelete) return;
    setDeletingStory(true);
    try {
      await base44.entities.Story.delete(storyToDelete.id);
      toast.success('Story deleted');
      queryClient.invalidateQueries({ queryKey: ['profile-stories', profileAuthId] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setStoryToDelete(null);
    } catch {
      toast.error('Failed to delete story');
    } finally {
      setDeletingStory(false);
    }
  };
  // Show all posts: photos (image_url), videos/reels (video_url), YouTube posts (youtube_url), text posts (caption only)
  const postsWithImages = myPosts.filter(p => !deletedPostIds.has(p.id));
  const profileEnergyMemories = postsWithImages.map((post, index) => {
    const category = getProfilePostCategory(post);
    return {
      ...post,
      category,
      date: getProfilePostDate(post),
      title: post.title || post.caption?.split('\n')?.[0]?.slice(0, 42) || `${category} ${index + 1}`,
      image_url: getProfilePostMedia(post),
    };
  });
  const visibleProfileCategories = ['Posts', 'Spicey Clips', 'AI Memories', 'Stories']
    .map((category) => ({
      category,
      count: profileEnergyMemories.filter((post) => post.category === category).length,
      items: profileEnergyMemories.filter((post) => post.category === category),
    }))
    .filter((item) => item.count > 0);
  const profileVaultCategories = [
    { key: 'memories', label: 'Memories', icon: Sparkles, action: () => setEnergyFilmOpen(true), count: profileEnergyMemories.length },
    { key: 'reels', label: 'Reels', icon: Clapperboard, action: () => setActiveTab('reels'), count: profileEnergyMemories.filter((post) => post.category === 'Spicey Clips').length },
    { key: 'saved', label: 'Save', icon: Bookmark, action: () => setActiveTab('saved'), count: 0 },
    { key: 'moments', label: 'Moments', icon: Heart, action: () => setEnergyFilmOpen(true), count: profileEnergyMemories.filter((post) => post.category === 'Stories' || post.category === 'AI Memories').length },
    { key: 'pictures', label: 'Pictures', icon: Camera, action: () => setActiveTab('posts'), count: profileEnergyMemories.filter((post) => post.category === 'Posts').length },
  ];
  const profileEmail = realProfileText(
    profileUser?.email,
    isOwnProfile ? currentUser?.email : '',
    isOwnProfile ? previewUser?.email : ''
  );
  const emailUsername = profileEmail?.split('@')[0] || '';
  const username = realProfileText(
    profileUser?.username,
    isOwnProfile ? currentUser?.username : '',
    isOwnProfile ? previewUser?.username : '',
    emailUsername,
    'spicey'
  );
  const displayName = isSpiceySupport
    ? 'Info Spicey'
    : realProfileText(
      profileUser?.full_name,
      isOwnProfile ? currentUser?.full_name : '',
      isOwnProfile ? previewUser?.full_name || previewUser?.name : '',
      username,
      'Spicey Profile'
    );
  const cleanBio = (bio || 'Be you. Be Spicey.').replace(/\*\*/g, '').trim();
  const avatarSrc = realProfileText(
    profileUser?.avatar_url,
    isOwnProfile ? currentUser?.avatar_url : '',
    isOwnProfile ? previewUser?.avatar_url || previewUser?.picture : ''
  ) || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff5500&color=fff&size=256`;
  const canEditProfile = isOwnProfile && !!currentUser?.id && !String(currentUser.id).startsWith('preview-');
  const openEditProfile = () => {
    if (!canEditProfile) {
      toast.message('Profile is opening in preview. Log in to edit your real profile.');
      return;
    }
    setEditProfileOpen(true);
  };
  const openAvatarPicker = () => {
    if (!canEditProfile) {
      toast.message('Log in to change your avatar.');
      return;
    }
    setAvatarActionOpen(true);
  };
  // Force re-render on avatar change by using a key

  const STATS = [
    { val: postsWithImages.length || 0, label: 'Posts' },
    { val: profileUser?.followers_count || 0, label: 'Followers' },
    { val: profileUser?.following_count || 0, label: 'Following' },
  ];

  const profileUi = {
    pageBg: isLightMode
      ? 'linear-gradient(160deg, #fffaf8 0%, #fff0f6 34%, #ffd8eb 68%, #e9dcff 100%)'
      : 'linear-gradient(160deg, #050207 0%, #110716 34%, #190715 68%, #090512 100%)',
    pageOverlay: isLightMode
      ? 'radial-gradient(circle at 83% 8%, rgba(255,46,117,0.34), transparent 26%), radial-gradient(circle at 18% 16%, rgba(255,255,255,0.88), transparent 27%), radial-gradient(circle at 94% 42%, rgba(180,60,255,0.20), transparent 24%)'
      : 'radial-gradient(circle at 83% 8%, rgba(255,46,117,0.22), transparent 26%), radial-gradient(circle at 18% 16%, rgba(255,107,53,0.12), transparent 27%), radial-gradient(circle at 94% 42%, rgba(180,60,255,0.14), transparent 24%)',
    text: isLightMode ? '#11131b' : '#ffffff',
    muted: isLightMode ? 'rgba(23,26,38,0.58)' : 'rgba(255,255,255,0.58)',
    softText: isLightMode ? 'rgba(23,26,38,0.74)' : 'rgba(255,255,255,0.82)',
    heroBg: isLightMode
      ? 'linear-gradient(155deg, rgba(255,255,255,0.82), rgba(255,239,247,0.66) 48%, rgba(255,219,238,0.52))'
      : 'linear-gradient(155deg, rgba(25,11,28,0.90), rgba(36,13,36,0.74) 48%, rgba(66,16,46,0.58))',
    heroBorder: isLightMode ? '1px solid rgba(255,255,255,0.70)' : '1px solid rgba(255,46,157,0.30)',
    heroShadow: isLightMode
      ? '0 18px 42px rgba(255,72,148,0.18), 0 8px 22px rgba(139,80,255,0.10), inset 0 1px 0 rgba(255,255,255,0.92)'
      : '0 20px 46px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.10)',
    panelBg: isLightMode
      ? 'linear-gradient(145deg, rgba(255,255,255,0.70), rgba(255,232,244,0.44))'
      : 'linear-gradient(145deg, rgba(24,9,28,0.76), rgba(55,15,43,0.46))',
    panelBorder: isLightMode ? '1px solid rgba(255,255,255,0.70)' : '1px solid rgba(255,46,157,0.24)',
    statsBg: isLightMode ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.055)',
    statsBorder: isLightMode ? '1px solid rgba(255,255,255,0.64)' : '1px solid rgba(255,255,255,0.16)',
    statsDivider: isLightMode ? 'rgba(20,20,30,0.10)' : 'rgba(255,255,255,0.10)',
    heroRadius: '112px 30px 30px 30px / 82px 30px 30px 30px',
  };

  const handleFollow = async () => {
    if (!currentUser?.id || String(currentUser.id).startsWith('preview-')) {
      toast.message('Log in to follow this profile.');
      return;
    }
    if (!profileAuthId) {
      toast.error('Could not find this profile.');
      return;
    }
    if (profileAuthId === currentUser.id) {
      toast.message('This is your profile.');
      return;
    }
    if (connectionBusy) return;
    setConnectionBusy(true);
    try {
      const result = await base44.functions.invoke('toggleFollow', { target_user_id: profileAuthId });
      const data = result.data || result;
      setIsFollowing(data.following);
      setFollowRequested(data.requested || false);
      setProfileUser(prev => prev ? ({
        ...prev,
        followers_count: Math.max(0, Number(prev.followers_count || 0) + (data.following ? 1 : -1)),
      }) : prev);
      
      // Refresh follower count from database
      // Counts are updated optimistically because the active Supabase schema
      // stores follows as the source of truth and may not mirror counters yet.
    } catch (err) {
      console.error('Follow error:', err);
      toast.error(err?.message || 'Could not update this connection');
    } finally {
      setConnectionBusy(false);
    }
  };

  const handleAddFriend = async () => {
    if (isFollowing) {
      toast.success(`You and ${displayName} are connected`);
      return;
    }
    await handleFollow();
  };

  const handleTogglePrivate = async () => {
    const newVal = !isPrivate;
    setIsPrivate(newVal);
    const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser?.id });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { is_private: newVal });
    }
  };

  const handleMessage = () => {
    if (!currentUser || !profileAuthId) return;
    const otherUserUsername = profileUser?.username || profileUser?.email?.split('@')[0] || 'user';
    const otherUserAvatar = profileUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a0a2e&color=fff&size=256`;
    navigate('/messages', {
      state: {
        directUserId: profileAuthId,
        directUserName: displayName,
        directUserUsername: otherUserUsername,
        directUserAvatar: otherUserAvatar,
      }
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isLightMode ? '#FAFAFA' : pageBg }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(255,80,0,0.2)', borderTopColor: '#ff5500' }} />
      </div>
    );
  }

  return (
    <>
      <div className="spicey-profile-v2-backdrop" aria-hidden="true" />
      <main className="spicey-reference-profile-screen spicey-reference-profile-screen--cropped relative">
        <div className="spicey-reference-profile-art">
          <img
            className="spicey-reference-profile-image"
            src="/spicey-profile-v2-reference.png"
            alt=""
            aria-hidden="true"
          />
          <div className="spicey-reference-top-right-mask" aria-hidden="true" />
          <div className="spicey-reference-top-logo-mask" aria-hidden="true" />
          <div className="spicey-reference-bottom-nav-mask" aria-hidden="true" />
          <div className="spicey-reference-script-logo" aria-hidden="true">Spicey</div>
          <div className="spicey-reference-top-controls">
            <button type="button" onClick={() => navigate(-1)} aria-label="Back">
              <ChevronLeft size={20} />
            </button>
            <span aria-hidden="true" />
            <button type="button" onClick={() => setShareSheetOpen(true)} aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button type="button" onClick={() => setAiIntroOpen(true)} aria-label="More">
              <MoreHorizontal size={19} />
            </button>
          </div>

        <section className="spicey-reference-dynamic hero">
          <button type="button" onClick={() => setAvatarModalOpen(true)} className="spicey-reference-avatar-shell pointer-events-auto" aria-label="Open avatar">
            <span className="spicey-reference-avatar-ring" />
            <span className="spicey-reference-avatar-core">
              {avatarSrc?.match(/\.(mp4|webm|mov|m4v)(\?|#|$)/i) ? (
                <video key={avatarSrc} src={avatarSrc} autoPlay loop muted playsInline />
              ) : (
                <img src={avatarSrc} alt={displayName} />
              )}
            </span>
            <span className="spicey-reference-avatar-badge">
              <Camera />
            </span>
          </button>
          <div className="spicey-reference-profile-info">
            <h1>{displayName}<span><BadgeCheck /></span></h1>
            <div>
              <b>@{username}</b>
              <em>SPICEY ID: #{String(profileAuthId || currentUser?.id || '7A3F2B').slice(-6).toUpperCase()}</em>
            </div>
            <p>{cleanBio || 'Dreamer • Creator • Explorer ✨'}</p>
            <small>{profileUser?.location || 'New York, USA'} • Joined May 2023</small>
          </div>
        </section>

        <div className="spicey-reference-dynamic chips">
          <span><MapPin size={12} /> {profileUser?.location || 'New York, USA'}</span>
          <span><Clock size={12} /> Joined May 2023</span>
        </div>

        <div className="spicey-reference-dynamic stats">
          {[
            { val: postsWithImages.length || profileUser?.post_count || 0, label: 'Posts' },
            { val: profileUser?.followers_count || 0, label: 'Followers' },
            { val: profileUser?.following_count || 0, label: 'Following' },
            { val: profileUser?.likes_count || profileUser?.impact_count || 0, label: 'Likes' },
          ].map((item) => (
            <span key={item.label}>
              <strong>{compactNumber(item.val)}</strong>
              <small>{item.label}</small>
            </span>
          ))}
        </div>

        <div className="spicey-reference-action-row">
          <button
            type="button"
            onClick={isOwnProfile ? openEditProfile : handleMessage}
            className="spicey-reference-action-btn primary"
          >
            {isOwnProfile ? <Edit3 size={15} /> : <MessageCircle size={15} />}
            <span>{isOwnProfile ? 'Edit Profile' : 'Message'}</span>
          </button>
          <button
            type="button"
            onClick={isOwnProfile ? () => setShareSheetOpen(true) : handleFollow}
            disabled={!isOwnProfile && connectionBusy}
            className="spicey-reference-action-btn secondary"
          >
            {isOwnProfile ? <Share2 size={15} /> : <UserCheck size={15} />}
            <span>
              {isOwnProfile ? 'Share' : followRequested ? 'Requested' : isFollowing ? 'Following' : 'Follow'}
            </span>
          </button>
          <button
            type="button"
            onClick={isOwnProfile ? () => setFollowRequestsOpen(true) : handleAddFriend}
            disabled={!isOwnProfile && connectionBusy}
            className="spicey-reference-action-btn icon"
            aria-label={isOwnProfile ? 'Follow requests' : 'Add friend'}
          >
            <UserPlus size={17} />
          </button>
        </div>

        <section className="spicey-reference-vault-panel" aria-label="Profile save categories">
          <div className="spicey-reference-vault-head">
            <span>Spicey Vault</span>
            <small>Saved by category</small>
          </div>
          <div className="spicey-reference-vault-grid">
            {profileVaultCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={category.action}
                  className={`spicey-reference-vault-btn ${category.key}`}
                >
                  <i><Icon size={15} /></i>
                  <span>{category.label}</span>
                  <strong>{category.count}</strong>
                </button>
              );
            })}
          </div>
        </section>

        <button type="button" onClick={() => navigate(-1)} className="spicey-profile-hotspot back" aria-label="Back" />
        <button type="button" onClick={() => setShareSheetOpen(true)} className="spicey-profile-hotspot bell" aria-label="Notifications" />
        <button type="button" onClick={() => setAiIntroOpen(true)} className="spicey-profile-hotspot more" aria-label="More" />
        <button type="button" onClick={() => setAvatarModalOpen(true)} className="spicey-profile-hotspot avatar" aria-label="Open avatar" />
        <button type="button" onClick={openAvatarPicker} className="spicey-profile-hotspot avatar-badge" aria-label="Choose avatar" />
        {postsWithImages.slice(0, 9).map((post, index) => (
          <button
            key={post.id || index}
            type="button"
            onClick={() => setSelectedPost(post)}
            className={`spicey-profile-hotspot grid-${index}`}
            aria-label="Open post"
          />
        ))}
        <div className="spicey-reference-post-categories">
          {visibleProfileCategories.length > 0 ? (
            visibleProfileCategories.map((group) => (
              <button
                key={group.category}
                type="button"
                onClick={() => group.items[0] ? setSelectedPost(group.items[0]) : null}
                className="spicey-reference-post-category"
              >
                <span>{group.category}</span>
                <strong>{group.count}</strong>
              </button>
            ))
          ) : (
            <div className="spicey-reference-post-empty">
              <span>No posts yet</span>
              <small>New posts will save here by category.</small>
            </div>
          )}
        </div>
        <button type="button" onClick={() => navigate('/')} className="spicey-profile-hotspot nav-home" aria-label="Home" />
        <button type="button" onClick={() => navigate('/messages')} className="spicey-profile-hotspot nav-messages" aria-label="Messages" />
        <button type="button" onClick={() => navigate('/create')} className="spicey-profile-hotspot nav-create" aria-label="Create" />
        <button type="button" onClick={() => navigate('/ai')} className="spicey-profile-hotspot nav-ai" aria-label="AI" />
        <button type="button" onClick={() => navigate('/profile')} className="spicey-profile-hotspot nav-profile" aria-label="Profile" />
        </div>
      </main>

      {isOwnProfile && currentUser?.id && (
        <>
          <EditProfileSheet
            open={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            user={currentUser}
            onSaved={({ b, full_name, username: savedUsername, avatar_url }) => {
              setEditProfileOpen(false);
              setProfileUser(prev => ({
                ...prev,
                bio: b ?? prev?.bio,
                full_name: full_name || prev?.full_name,
                username: savedUsername || prev?.username,
                avatar_url: avatar_url || prev?.avatar_url,
              }));
            }}
          />
          <FollowRequestsSheet open={followRequestsOpen} onClose={() => setFollowRequestsOpen(false)} />
        </>
      )}
      <ShareSheet open={shareSheetOpen} onClose={() => setShareSheetOpen(false)} shareUrl={`https://spicey.live/?profile=${username}`} />
      <AvatarPickerSheet
        open={avatarActionOpen}
        onClose={() => setAvatarActionOpen(false)}
        hasAvatar={!!profileUser?.avatar_url}
        currentAvatar={profileUser?.avatar_url || currentUser?.avatar_url}
        onFileSelect={handleAvatarUpload}
        onRemove={handleAvatarRemove}
      />
      <AnimatePresence>
        {energyFilmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEnergyFilmOpen(false)}
              className="fixed inset-0 z-[58]"
              style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)' }}
            />
            <motion.section
              initial={{ y: 34, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 34, opacity: 0, scale: 0.96 }}
              className="spicey-energy-film-modal"
              role="dialog"
              aria-modal="true"
              aria-label="My Energy memories"
            >
              <button type="button" onClick={() => setEnergyFilmOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
              <div className="spicey-energy-film-head">
                <small>MY ENERGY</small>
                <h2>{displayName.split(' ')[0]}'s Spicey Memories</h2>
                <p>Slides by category, reels and dates from your profile test moments.</p>
              </div>
              <div className="spicey-energy-film-cats" aria-label="Memory categories">
                {visibleProfileCategories.map((group) => (
                  <button key={group.category} type="button" onClick={() => group.items[0] && setSelectedPost(group.items[0])}>
                    {group.category}
                  </button>
                ))}
              </div>
              <div className="spicey-energy-film-reel spicey-energy-film-slideshow">
                {profileEnergyMemories.map((memory) => (
                  <article key={memory.id} onClick={() => setSelectedPost(memory)}>
                    {memory.image_url ? <img src={memory.image_url} alt="" /> : <div className="spicey-energy-text-memory" />}
                    <span>
                      <small>{memory.date} • {memory.category}</small>
                      <strong>{memory.title}</strong>
                      <p>{memory.caption}</p>
                    </span>
                  </article>
                ))}
                {profileEnergyMemories.length === 0 && (
                  <article className="spicey-energy-empty-memory">
                    <span>
                      <small>MY ENERGY</small>
                      <strong>No posts yet</strong>
                      <p>When you post photos, clips or AI moments, they will appear here automatically.</p>
                    </span>
                  </article>
                )}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {avatarModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAvatarModalOpen(false)} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center"
              onClick={() => setAvatarModalOpen(false)}>
              <div className="spicey-avatar-viewer-frame" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                {avatarSrc?.match(/\.(mp4|webm|mov|m4v)(\?|#|$)/i) ? (
                  <video key={avatarSrc} src={avatarSrc} autoPlay loop muted playsInline className="spicey-avatar-viewer-media" />
                ) : (
                  <img src={avatarSrc} alt={displayName} className="spicey-avatar-viewer-media" />
                )}
              </div>
              <div className="spicey-avatar-viewer-actions" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                <button type="button" onClick={() => toggleReaction('avatar', 'like')} data-active={userAvatarLiked}>
                  <Heart />
                  <span>{avatarLikes}</span>
                </button>
                <button type="button" onClick={() => toggleReaction('avatar', 'fire')} data-active={userAvatarFired}>
                  <Flame />
                  <span>{avatarFire}</span>
                </button>
                <button type="button" onClick={() => setAvatarCommentOpen(prev => !prev)} data-active={avatarCommentOpen}>
                  <MessageCircle />
                  <span>{avatarComments.length || 'Comment'}</span>
                </button>
              </div>
              {avatarCommentOpen && (
                <form
                  className="spicey-avatar-comment-box"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = avatarCommentText.trim();
                    if (!text) return;
                    setAvatarComments(prev => [{ id: Date.now(), text }, ...prev]);
                    setAvatarCommentText('');
                  }}
                >
                  {avatarComments[0] && <p>{avatarComments[0].text}</p>}
                  <div>
                    <input
                      value={avatarCommentText}
                      onChange={(e) => setAvatarCommentText(e.target.value)}
                      placeholder="Write a comment..."
                    />
                    <button type="submit">Post</button>
                  </div>
                </form>
              )}
              <button onClick={() => setAvatarModalOpen(false)}
                className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ top: 'max(1.5rem, calc(env(safe-area-inset-top) + 0.75rem))', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {selectedPost && (
        <PhotoViewer
          post={selectedPost}
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={isOwnProfile ? () => handleDeletePost(selectedPost.id) : undefined}
        />
      )}
    </>
  );

  return (
    <>
    <div className="min-h-screen relative" style={{ 
      background: profileUi.pageBg,
      paddingBottom: 'max(7rem, env(safe-area-inset-bottom) + 6rem)',
      overflowX: 'hidden',
      color: profileUi.text,
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: profileUi.pageOverlay,
      }} />
      <div className="absolute top-[270px] right-0 w-[360px] h-[140px] pointer-events-none opacity-70" style={{
        background: isLightMode
          ? 'linear-gradient(120deg, transparent 10%, rgba(255,255,255,0.28), rgba(255,77,150,0.30), rgba(180,75,255,0.18), transparent 78%)'
          : 'linear-gradient(120deg, transparent 10%, rgba(193,0,255,0.18), rgba(255,77,35,0.42), transparent 75%)',
        filter: 'blur(22px)',
        transform: 'skewY(-8deg)',
      }} />

      {/* ── Top Bar ── */}
      <div className="relative z-20 px-5 pb-3" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: isLightMode ? 'rgba(255,255,255,0.44)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.28)' }}>
            <ChevronLeft className="w-7 h-7" style={{ color: '#ff6b35', filter: isLightMode ? 'none' : 'drop-shadow(0 0 8px rgba(255,46,157,0.55))' }} />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShareSheetOpen(true)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: isLightMode ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.42)', boxShadow: isLightMode ? '0 10px 24px rgba(255,70,145,0.15)' : '0 10px 24px rgba(0,0,0,0.25)' }}
            >
              <Share2 className="w-5 h-5" style={{ color: isLightMode ? '#15161f' : '#ffffff' }} />
            </button>
            <button
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: isLightMode ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.42)', boxShadow: isLightMode ? '0 10px 24px rgba(255,70,145,0.15)' : '0 10px 24px rgba(0,0,0,0.25)' }}
            >
              <MoreHorizontal className="w-6 h-6" style={{ color: isLightMode ? '#15161f' : '#ffffff' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Profile Hero ── */}
      <div className="relative z-10 px-4 pt-1">
          <div
            className="relative overflow-hidden rounded-[32px] h-[178px]"
            style={{
              background: isLightMode
                ? 'linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,204,186,0.78) 36%, rgba(255,46,126,0.66) 76%, rgba(186,86,255,0.42) 100%)'
                : 'linear-gradient(135deg, rgba(16,8,18,0.96) 0%, rgba(56,18,44,0.84) 36%, rgba(134,18,88,0.54) 76%, rgba(95,40,168,0.34) 100%)',
              border: isLightMode ? '1px solid rgba(255,255,255,0.78)' : '1px solid rgba(255,46,157,0.32)',
              boxShadow: isLightMode ? '0 20px 44px rgba(255,80,150,0.18)' : '0 20px 44px rgba(0,0,0,0.42)',
            }}
          >
            <div className="absolute -right-10 -top-8 w-44 h-44 rounded-full" style={{ background: isLightMode ? 'radial-gradient(circle, rgba(255,46,157,0.46), transparent 68%)' : 'radial-gradient(circle, rgba(255,46,157,0.34), transparent 68%)' }} />
            <div
              className="absolute right-16 top-10 w-28 h-28 rounded-[30px] rotate-12 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.34), rgba(255,255,255,0.12))',
                border: '1px solid rgba(255,255,255,0.54)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.50), 0 14px 30px rgba(255,46,157,0.16)',
              }}
            >
              <Sparkles className="w-14 h-14 -rotate-12" style={{ color: '#ff6b35', fill: '#ff2e9d', filter: 'drop-shadow(0 10px 14px rgba(255,46,157,0.26))' }} />
            </div>
          </div>
        </div>
      <div className="relative z-10 px-4 pb-3 -mt-12">
        <section
          className="spicey-profile-hero relative overflow-hidden px-4 pb-4"
          style={{
            background: profileUi.heroBg,
            border: profileUi.heroBorder,
            boxShadow: profileUi.heroShadow,
            borderRadius: profileUi.heroRadius,
            paddingTop: 28,
          }}
        >
          <>
            <div
              className="absolute -left-10 -top-10 w-[190px] h-[132px] pointer-events-none"
              style={{
                background: isLightMode
                  ? 'radial-gradient(ellipse at 50% 62%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.82) 45%, rgba(255,232,244,0.38) 72%, transparent 74%)'
                  : 'radial-gradient(ellipse at 50% 62%, rgba(25,11,28,0.98) 0%, rgba(36,13,36,0.84) 45%, rgba(255,46,157,0.18) 72%, transparent 74%)',
                filter: 'blur(0.2px)',
              }}
            />
            <div
              className="absolute left-[130px] top-0 w-[150px] h-[44px] pointer-events-none"
              style={{
                background: isLightMode
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.86), rgba(255,239,247,0.42), transparent)'
                  : 'linear-gradient(90deg, rgba(25,11,28,0.86), rgba(66,16,46,0.42), transparent)',
                borderBottomLeftRadius: 42,
                borderBottomRightRadius: 80,
              }}
            />
          </>
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #ff6b35, #ff2e9d, #a733ff)' }} />
          <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,46,157,0.22), transparent 68%)', filter: 'blur(8px)' }} />
          <div className="absolute -bottom-20 -left-10 w-48 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.18), transparent 70%)', filter: 'blur(10px)' }} />

          <div className="relative flex items-center gap-4 text-left">
            <div className="relative flex-shrink-0" style={{ marginTop: -32, width: 120, height: 120 }}>
              <motion.button onClick={() => setAvatarModalOpen(true)} whileTap={{ scale: 0.96 }} className="active:scale-95 transition-transform block">
                <div
                  className="rounded-full p-[4px] overflow-hidden"
                  style={{
                    width: 120,
                    height: 120,
                    minWidth: 120,
                    minHeight: 120,
                    aspectRatio: '1 / 1',
                    background: 'conic-gradient(from 18deg, #ff6b35, #ff2e9d, #a733ff, #ff6b35)',
                    boxShadow: '0 0 26px rgba(255,46,157,0.58), 0 0 20px rgba(255,107,53,0.45)',
                  }}
                >
                  <div className="p-[2px] rounded-full overflow-hidden" style={{ width: '100%', height: '100%', aspectRatio: '1 / 1', background: isLightMode ? '#ffffff' : '#050107' }}>
                    {avatarSrc?.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                      <span
                        className="spicey-video-avatar-frame rounded-full"
                        style={{ width: 112, height: 112, minWidth: 112, minHeight: 112, maxWidth: 112, maxHeight: 112, aspectRatio: '1 / 1', borderRadius: '50%' }}
                      >
                        <video
                          key={avatarSrc}
                          src={avatarSrc}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="spicey-video-avatar-crop spicey-video-avatar-crop--soft"
                        />
                      </span>
                    ) : (
                      <ImageWithFallback
                        key={avatarSrc}
                        src={avatarSrc}
                        alt={displayName}
                        className="w-[112px] h-[112px] rounded-full object-cover"
                        style={{ width: 112, height: 112, minWidth: 112, minHeight: 112, maxWidth: 112, maxHeight: 112, aspectRatio: '1 / 1', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 18%' }}
                        isAvatar={true}
                      />
                    )}
                  </div>
                </div>
              </motion.button>

              <div
                className="absolute -top-1 -right-2 w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #b34cff, #8b2cff)',
                  boxShadow: '0 0 14px rgba(179,76,255,0.82)',
                }}
              >
                <BadgeCheck className="w-6 h-6 text-white" />
              </div>
              <span className="absolute bottom-2 right-0 w-7 h-7 rounded-full" style={{ background: '#57d83f', border: `3px solid ${isLightMode ? '#ffffff' : '#050107'}`, boxShadow: '0 0 12px rgba(87,216,63,0.82)' }} />
              {isOwnProfile && (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setAvatarActionOpen(true)}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center border-2 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35, #ff2e9d)',
                    borderColor: isLightMode ? '#ffffff' : '#050107',
                    boxShadow: '0 0 12px rgba(255,107,53,0.65)',
                  }}
                >
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              )}
            </div>

            <div className="w-full min-w-0 pt-1">
              <div className="flex items-center justify-start gap-1.5">
                <h2 className="max-w-[190px] truncate text-[24px] font-extrabold leading-tight" style={{ color: profileUi.text }}>{displayName}</h2>
                {userBadge && <VerifiedBadge type={userBadge} size="sm" />}
                {!userBadge && profileUser?.verified && <VerifiedBadge type="verified" size="sm" />}
              </div>
              <p className="mt-1 text-sm" style={{ color: profileUi.muted }}>@{username}</p>
              <p
                className="mt-2 max-w-[210px] text-[13px] leading-relaxed"
                style={{
                  color: profileUi.softText,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {cleanBio} <span style={{ color: '#ff335d' }}>🌶️✨</span>
              </p>
              <div className="mt-3 flex flex-wrap justify-start gap-2">
                {['Creator', 'Traveler', 'Foodie'].map((tag, i) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: i === 0 ? 'linear-gradient(135deg, #ff6b35, #ff2e9d)' : 'rgba(255,46,157,0.20)',
                      border: '1px solid rgba(255,46,157,0.42)',
                      color: '#ffffff',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`relative mt-4 grid gap-2 ${isOwnProfile ? 'grid-cols-[1fr_1fr_44px]' : 'grid-cols-3'}`}>
            {isOwnProfile ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setEditProfileOpen(true)}
                  className="h-12 px-4 rounded-[18px] text-sm font-extrabold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ff6b35, #ff2e9d, #9b35ff)', border: '1.5px solid rgba(255,255,255,0.50)', boxShadow: isLightMode ? '0 12px 24px rgba(255,46,157,0.24)' : '0 10px 24px rgba(255,46,157,0.20)' }}
                >
                  Edit Profile <Edit3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShareSheetOpen(true)}
                  className="h-12 px-3 rounded-[18px] flex items-center justify-center gap-2 text-sm font-bold"
                  style={{ color: isLightMode ? '#15161f' : '#ffffff', background: isLightMode ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.42)', boxShadow: isLightMode ? '0 10px 20px rgba(255,107,53,0.13)' : '0 8px 20px rgba(255,107,53,0.10)' }}
                >
                  Share <Share2 className="w-4 h-4" />
                </motion.button>
                {isAdmin && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/admin/dashboard')}
                    className="h-12 rounded-[18px] text-xs font-extrabold text-white flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ff6b35, #ff2e9d)', boxShadow: '0 8px 20px rgba(255,46,157,0.22)' }}
                  >
                    <Shield className="w-4 h-4" />
                  </motion.button>
                )}
              </>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleFollow}
                  disabled={connectionBusy}
                  className="h-11 px-2 rounded-2xl text-[12px] font-extrabold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                  style={{ background: isFollowing ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #ff6b35, #ff2e9d)', border: '1px solid rgba(255,46,157,0.46)' }}
                >
                  <UserCheck className="w-4 h-4" />
                  {connectionBusy ? '...' : followRequested ? 'Requested' : isFollowing ? 'Following' : 'Follow'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddFriend}
                  disabled={connectionBusy}
                  className="h-11 px-2 rounded-2xl text-[12px] font-extrabold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #9b35ff, #ff2e9d)', border: '1px solid rgba(176,74,255,0.60)' }}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {followRequested ? 'Requested' : isFollowing ? 'Friends' : 'Add Friend'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleMessage}
                  className="h-11 px-2 rounded-2xl text-[12px] font-extrabold text-white flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(255,46,157,0.12)', border: '1px solid rgba(255,46,157,0.55)' }}
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </motion.button>
              </>
            )}
          </div>

          <div
            className="relative mt-3 grid grid-cols-4 rounded-[24px] overflow-hidden"
            style={{ background: profileUi.statsBg, border: profileUi.statsBorder, boxShadow: isLightMode ? '0 10px 24px rgba(255,76,145,0.12)' : 'inset 0 0 24px rgba(255,46,157,0.08)' }}
          >
            {STATS.map((s, i) => (
              <motion.div key={s.label} whileTap={{ scale: 0.96 }} className="py-2.5 text-center relative">
                {i > 0 && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-7" style={{ background: profileUi.statsDivider }} />}
                <p className="text-[19px] font-extrabold leading-none" style={{ color: profileUi.text }}>{s.val}</p>
                <p className="text-[11px] mt-1" style={{ color: profileUi.muted }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div
          className="mt-3 rounded-[24px] p-4 relative overflow-hidden"
          style={{ background: profileUi.panelBg, border: profileUi.panelBorder, boxShadow: isLightMode ? '0 14px 28px rgba(255,94,159,0.11)' : 'none' }}
        >
          <div className="absolute right-0 bottom-0 w-48 h-20 opacity-70" style={{
            background: isLightMode
              ? 'linear-gradient(120deg, transparent, rgba(255,255,255,0.40), rgba(255,46,157,0.18), rgba(255,107,53,0.18), transparent)'
              : 'linear-gradient(120deg, transparent, rgba(255,46,157,0.24), rgba(255,107,53,0.30), transparent)',
            filter: 'blur(16px)',
            transform: 'skewY(-8deg)',
          }} />
          <h3 className="relative mb-3 text-sm font-extrabold" style={{ color: profileUi.text }}>Profile information</h3>
          <div className="relative space-y-2 text-[14px]" style={{ color: profileUi.text }}>
            {profileUser?.location && (
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4" style={{ color: '#d46cff' }} /><span>{profileUser.location}</span></div>
            )}
            <div className="flex items-center gap-3"><Heart className="w-4 h-4" style={{ color: '#d46cff' }} /><span>{cleanBio || 'Travel. Create. Inspire.'}</span></div>
            {isOwnProfile && profileEmail && (
              <div className="flex items-center gap-3 min-w-0"><Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#d46cff' }} /><span className="truncate">{profileEmail}</span></div>
            )}
            <div className="flex items-center gap-3 min-w-0"><Link2 className="w-4 h-4 flex-shrink-0" style={{ color: isLightMode ? '#ff2e9d' : '#ffffff' }} /><span className="truncate" style={{ color: '#ff2e9d' }}>spicey.live/{username}</span></div>
          </div>
        </div>
      </div>

      {/* ── Story Highlights ── */}
      <div className="relative z-10 px-4 mt-0 mb-4">
        <div
          className="flex justify-between gap-3 overflow-x-auto p-3"
          style={{
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            borderRadius: 28,
            background: isLightMode ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.045)',
            border: isLightMode ? '1px solid rgba(255,255,255,0.62)' : '1px solid rgba(255,46,157,0.20)',
            boxShadow: isLightMode ? '0 14px 30px rgba(255,88,160,0.11)' : '0 14px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
            <div key={h.label} className="flex flex-col items-center gap-2 flex-shrink-0" style={{ width: '64px' }}>
              <div onClick={() => h.label === 'New' && setCategoryManagerOpen(true)}
                className="w-[58px] h-[58px] rounded-full cursor-pointer flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, #ff6b35, ${h.color}, #a733ff)`, border: `1.5px solid ${isLightMode ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.18)'}`, boxShadow: isLightMode ? `0 8px 18px ${h.color}33` : `0 8px 18px ${h.color}30` }}>
                <Icon className="w-7 h-7" style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.20))' }} />
              </div>
              <span className="text-xs font-medium text-center leading-tight" style={{ color: isLightMode ? '#171a24' : 'rgba(255,255,255,0.86)', width: '70px' }}>{h.label}</span>
            </div>
          )})}
        </div>
      </div>

      {/* ── Active Stories (own profile only) ── */}
      {isOwnProfile && myStories.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-widest uppercase text-white/40">Active Stories</span>
            <span className="text-[10px] text-white/25">Tap 🗑 to delete</span>
          </div>
          <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {myStories.map(story => (
              <div key={story.id} className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden"
                  style={{ border: '2px solid rgba(255,85,0,0.5)' }}>
                  {story.image_url ? (
                    <img src={story.image_url} alt="" className="w-full h-full object-cover" />
                  ) : story.video_url ? (
                    <video src={story.video_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))' }}>
                      <span className="text-lg">📝</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setStoryToDelete(story)}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(220,30,30,0.9)', border: '1.5px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 8px rgba(220,30,30,0.5)' }}>
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="relative z-10 mx-3 grid grid-cols-3 mb-3 rounded-[24px] p-1"
        style={{ background: isLightMode ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.035)', border: isLightMode ? '1px solid rgba(255,255,255,0.68)' : '1px solid rgba(255,46,157,0.18)', boxShadow: isLightMode ? '0 12px 26px rgba(164,84,255,0.10)' : 'none' }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="py-3 relative transition-all flex items-center justify-center gap-2 rounded-[18px]">
            <tab.icon className="w-5 h-5" style={{
              color: activeTab === tab.key
                ? '#ff6b35'
                : isLightMode ? 'rgba(25,28,40,0.48)' : 'rgba(255,255,255,0.42)'
            }} />
            <span className="text-sm font-semibold" style={{
              color: activeTab === tab.key ? (isLightMode ? '#ff2e9d' : '#ffffff') : (isLightMode ? 'rgba(25,28,40,0.52)' : 'rgba(255,255,255,0.42)')
            }}>{tab.label}</span>
            {activeTab === tab.key && (
              <motion.div layoutId="profile-tab-indicator"
                className="absolute bottom-0 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(to right, #FF6B35, #FF2E9D)', width: '70%', left: '15%' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Private account lock screen ── */}
      {isPrivate && !isOwnProfile && !isFollowing && (
        <div className="flex flex-col items-center justify-center py-16 gap-5 px-6 text-center mt-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(255,107,53,0.3) 0%, rgba(255,46,157,0.15) 50%, transparent 70%)',
              filter: 'blur(20px)',
              transform: 'scale(1.5)',
            }} />
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
              style={{ 
                background: isLightMode ? 'linear-gradient(135deg, #FFF5F5, #FFE8EF)' : 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,46,157,0.1))',
                border: isLightMode ? '1.5px solid rgba(255,107,53,0.3)' : '1.5px solid rgba(255,107,53,0.25)',
                boxShadow: isLightMode ? '0 8px 24px rgba(255,107,53,0.2)' : '0 8px 24px rgba(255,107,53,0.15)',
              }}>
              <Lock className="w-8 h-8" style={{ color: isLightMode ? '#FF6B35' : '#FF8A50' }} />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold mb-1" style={{ color: isLightMode ? '#111111' : '#ffffff' }}>This Account is Private</p>
            <p className="text-sm leading-relaxed max-w-[300px]" style={{ color: isLightMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.45)' }}>
              {followRequested
                ? "Your follow request is pending approval. Once approved, you will be able to see their posts, photos, videos, and reels."
                : "Follow this account to see their posts, photos, videos, reels, and live recordings. Only approved followers can view private content."}
            </p>
          </div>
        </div>
      )}

      {/* ── Content Grid ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'posts' && (!isPrivate || isOwnProfile || isFollowing) && (
          <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-2 px-3">
              {postsWithImages.map((p) => {
                // Determine post type and thumbnail
                const isVideo = p.video_url;
                const isYouTube = p.youtube_url;
                const isTextOnly = !p.image_url && !p.video_url && !p.youtube_url;
                const thumbnail = isYouTube ? p.youtube_thumbnail : (isVideo ? p.video_url : p.image_url);

                return (
                  <div key={p.id}
                    onClick={() => setSelectedPost(p)}
                    onTouchStart={() => handlePostLongPress(p)}
                    onTouchEnd={handlePostLongPressCancel}
                    onTouchMove={handlePostLongPressCancel}
                    onMouseDown={() => handlePostLongPress(p)}
                    onMouseUp={handlePostLongPressCancel}
                    onMouseLeave={handlePostLongPressCancel}
                    className="relative aspect-square overflow-hidden cursor-pointer group active:scale-95 transition-transform duration-150 rounded-xl"
                    style={{ contain: 'layout style paint', border: '1px solid rgba(255,46,157,0.34)', boxShadow: '0 0 0 1px rgba(255,107,53,0.08)' }}>
                    {isTextOnly ? (
                      <div className="w-full h-full flex items-center justify-center p-3"
                        style={{ background: 'linear-gradient(135deg, rgba(255,85,0,0.1), rgba(233,30,140,0.1))' }}>
                        <Type className="w-8 h-8 text-white/30" />
                      </div>
                    ) : thumbnail ? (
                      <>
                        <ImageWithFallback src={thumbnail} alt="" className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
                        {isVideo && <Clapperboard className="absolute top-2 right-2 w-5 h-5 text-white drop-shadow" />}
                        {isYouTube && (
                          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,0,0,0.9)', boxShadow: '0 0 0 3px rgba(255,255,255,0.3)' }}>
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.47 20.5 12 20.5 12 20.5s7.53 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/></svg>
                          </div>
                        )}
                      </>
                    ) : null}
                    {/* Overlay with stats */}
                    <Sparkles className="absolute top-2 right-2 w-5 h-5" style={{ color: '#fff', filter: 'drop-shadow(0 0 7px #ff2e9d)' }} />
                    <div className="absolute inset-0 flex items-end p-2 transition-opacity duration-200"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 42%)' }}>
                      <div className="flex items-center gap-3 text-white">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{p.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span className="text-xs font-bold">{p.comments_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'reels' && (!isPrivate || isOwnProfile || isFollowing) && (
          <motion.div key="reels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-2 px-3">
              {myPosts.filter(p => p.video_url && !deletedPostIds.has(p.id)).map((p) => (
                <div key={p.id}
                   onClick={() => setSelectedPost(p)}
                   onTouchStart={() => handlePostLongPress(p)}
                   onTouchEnd={handlePostLongPressCancel}
                   onTouchMove={handlePostLongPressCancel}
                   onMouseDown={() => handlePostLongPress(p)}
                   onMouseUp={handlePostLongPressCancel}
                   onMouseLeave={handlePostLongPressCancel}
                   className="relative aspect-square overflow-hidden cursor-pointer group active:scale-95 transition-transform duration-150 bg-black/30 rounded-xl"
                   style={{ contain: 'layout style paint', border: '1px solid rgba(255,46,157,0.34)' }}>
                  <video src={p.video_url} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
                  <Play className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/60" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'saved' && (!isPrivate || isOwnProfile || isFollowing) && (
        <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)', border: isLightMode ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.07)' }}>
            <Bookmark className="w-7 h-7" style={{ color: isLightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: isLightMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.3)' }}>Nothing saved yet</p>
          <p className="text-xs" style={{ color: isLightMode ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.18)' }}>Posts you save will appear here</p>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Viewer */}
      {selectedPost && (
        <PhotoViewer
          post={selectedPost}
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {isOwnProfile && (
        <>
          <EditProfileSheet open={editProfileOpen} onClose={() => setEditProfileOpen(false)} user={currentUser}
            onSaved={({ bio: b, full_name, username: savedUsername, avatar_url }) => {
              setBio(b);
              // Reload fresh profile data from DB to get latest avatar
              base44.entities.UserProfile.filter({ user_id: currentUser.id }, '-created_date', 1).then(profiles => {
                if (profiles[0]) {
                  setProfileUser(prev => ({ ...prev, ...profiles[0] }));
                }
              });
              setCurrentUser(prev => ({
                ...prev,
                full_name: full_name || prev?.full_name,
                username: savedUsername || prev?.username,
                avatar_url: avatar_url || prev?.avatar_url,
              }));
              setProfileUser(prev => ({
                ...prev,
                bio: b ?? prev?.bio,
                full_name: full_name || prev?.full_name,
                username: savedUsername || prev?.username,
                avatar_url: avatar_url || prev?.avatar_url,
              }));
            }} />
          <FollowRequestsSheet open={followRequestsOpen} onClose={() => setFollowRequestsOpen(false)} />
          <ShareSheet open={shareSheetOpen} onClose={() => setShareSheetOpen(false)} shareUrl={`https://spicey.live/?profile=${username}`} />
        </>
      )}
      
      
      {/* Avatar Modal */}
      <AnimatePresence>
        {avatarModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAvatarModalOpen(false)} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center"
              onClick={() => setAvatarModalOpen(false)}>
              {avatarSrc?.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                <span
                  className="spicey-video-avatar-frame rounded-full"
                  style={{ width: 'min(78vw, 420px)', height: 'min(78vw, 420px)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <video
                    key={avatarSrc}
                    src={avatarSrc}
                    autoPlay loop muted playsInline
                    className="spicey-video-avatar-crop"
                  />
                </span>
              ) : (
                <img src={avatarSrc} alt={displayName} 
                  key={avatarSrc}
                  className="max-h-screen max-w-screen object-contain"
                  onClick={e => e.stopPropagation()} />
              )}
              {/* Avatar reactions in modal */}
              <div className="spicey-avatar-viewer-actions" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                <motion.button whileTap={{ scale: 0.88 }}
                  onClick={(e) => { e.stopPropagation(); toggleReaction('avatar', 'like'); }}
                  data-active={userAvatarLiked}>
                  <Heart className="w-4 h-4" style={{ fill: userAvatarLiked ? '#e91e8c' : 'none' }} />
                  {avatarLikes}
                </motion.button>
                <motion.button whileTap={{ scale: 0.88 }}
                  onClick={(e) => { e.stopPropagation(); toggleReaction('avatar', 'fire'); }}
                  data-active={userAvatarFired}>
                  <span>🔥</span>
                  {avatarFire}
                </motion.button>
                <motion.button whileTap={{ scale: 0.88 }}
                  onClick={(e) => { e.stopPropagation(); setAvatarCommentOpen(prev => !prev); }}
                  data-active={avatarCommentOpen}>
                  <MessageCircle className="w-4 h-4" />
                  {avatarComments.length || 'Comment'}
                </motion.button>
              </div>
              {avatarCommentOpen && (
                <form
                  className="spicey-avatar-comment-box"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = avatarCommentText.trim();
                    if (!text) return;
                    setAvatarComments(prev => [{ id: Date.now(), text }, ...prev]);
                    setAvatarCommentText('');
                  }}
                >
                  {avatarComments[0] && <p>{avatarComments[0].text}</p>}
                  <div>
                    <input
                      value={avatarCommentText}
                      onChange={(e) => setAvatarCommentText(e.target.value)}
                      placeholder="Write a comment..."
                    />
                    <button type="submit">Post</button>
                  </div>
                </form>
              )}
              <button onClick={() => setAvatarModalOpen(false)}
                className="absolute right-4 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ top: 'max(1.5rem, calc(env(safe-area-inset-top) + 0.75rem))', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', minWidth: 44, minHeight: 44 }}>
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Avatar Picker Sheet — TikTok/Instagram style */}
      <AvatarPickerSheet
        open={avatarActionOpen}
        onClose={() => setAvatarActionOpen(false)}
        hasAvatar={!!profileUser?.avatar_url}
        currentAvatar={profileUser?.avatar_url || currentUser?.avatar_url}
        onFileSelect={handleAvatarUpload}
        onRemove={handleAvatarRemove}
      />

      {/* Cover Modal */}
      <AnimatePresence>
        {coverModalOpen && profileUser?.cover_url && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCoverModalOpen(false)} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center"
              onClick={() => setCoverModalOpen(false)}>
              <img src={profileUser.cover_url} alt="cover" 
                className="max-h-screen max-w-screen object-contain"
                onClick={e => e.stopPropagation()} />
              {/* Cover reactions in modal */}
              <div className="absolute bottom-6 flex gap-3">
                <motion.button whileTap={{ scale: 0.88 }}
                  onClick={(e) => { e.stopPropagation(); toggleReaction('cover', 'like'); }}
                  className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                  style={{
                    background: userCoverLiked ? 'rgba(233,30,140,0.3)' : 'rgba(0,0,0,0.5)',
                    border: userCoverLiked ? '1px solid rgba(233,30,140,0.8)' : '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: userCoverLiked ? '#e91e8c' : 'white'
                  }}>
                  <Heart className="w-4 h-4" style={{ fill: userCoverLiked ? '#e91e8c' : 'none' }} />
                  {coverLikes}
                </motion.button>
                <motion.button whileTap={{ scale: 0.88 }}
                  onClick={(e) => { e.stopPropagation(); toggleReaction('cover', 'fire'); }}
                  className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                  style={{
                    background: userCoverFired ? 'rgba(255,85,0,0.3)' : 'rgba(0,0,0,0.5)',
                    border: userCoverFired ? '1px solid rgba(255,85,0,0.8)' : '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: userCoverFired ? '#ff5500' : 'white'
                  }}>
                  <span>🔥</span>
                  {coverFire}
                </motion.button>
              </div>
              <button onClick={() => setCoverModalOpen(false)}
                className="absolute right-4 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ top: 'max(1.5rem, calc(env(safe-area-inset-top) + 0.75rem))', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', minWidth: 44, minHeight: 44 }}>
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    
    {/* Category Manager */}
    <CategoryManager
      userId={profileAuthId}
      isOpen={categoryManagerOpen}
      onClose={() => setCategoryManagerOpen(false)}
      userPosts={postsWithImages}
    />

    {/* Instagram-style post action sheet (long-press) */}
    <AnimatePresence>
      {postActionSheet && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPostActionSheet(null)}
            className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5 pb-10"
            style={{ background: 'rgba(14,7,24,0.99)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <button
              onClick={() => handleDeletePost(postActionSheet.post.id)}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm mb-2"
              style={{ background: 'rgba(220,30,30,0.12)', border: '1px solid rgba(220,30,30,0.3)', color: '#ff5555' }}>
              <Trash2 className="w-5 h-5" />
              Delete Post
            </button>
            <button
              onClick={() => setPostActionSheet(null)}
              className="w-full px-4 py-4 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Story delete confirmation */}
    <DeleteConfirmSheet
      open={!!storyToDelete}
      onClose={() => setStoryToDelete(null)}
      onConfirm={handleDeleteStory}
      loading={deletingStory}
      title="Delete this Story?"
      description="This story will be permanently removed."
    />
    
    {false && <BottomNavEnhanced />}
    </>
  );
}
