import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

// Louder ringtone for incoming calls
function playRingSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    // Two-tone ring pattern (louder)
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(900, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {}
}

import { Search, Plus, CheckCheck, Filter } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import SpiceyLogoText from '@/components/shared/SpiceyLogoText';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BottomNavEnhanced from '../components/feed/BottomNavEnhanced';
import CreatorScreen from '../components/feed/CreatorScreen.jsx';
import ChatView from '../components/messages/ChatView.jsx';
import NewMessageSheet from '../components/panels/NewMessageSheet.jsx';
import VerifiedBadge from '../components/shared/VerifiedBadge.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STORIES = [
  { name: 'Your Story', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80', isYou: true },
];

const EMPTY_LIST = [];
const isVideoAvatarUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));

function UserAvatarMedia({ src, alt, style }) {
  if (isVideoAvatarUrl(src)) {
    return (
      <span className="spicey-video-avatar-frame" style={style} aria-label={alt}>
        <video
          src={`${src}#t=0.1`}
          muted
          playsInline
          loop
          autoPlay
          className="spicey-video-avatar-crop"
        />
      </span>
    );
  }

  return <img src={src} alt={alt} style={style} />;
}

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [currentUserBadge, setCurrentUserBadge] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [isLight, setIsLight] = useState(false);
  const holdTimersRef = React.useRef({});

  const pageBgFromHook = usePageBackground();

  useEffect(() => {
    const check = () => {
      const next = document.documentElement.classList.contains('light-mode');
      setIsLight(prev => (prev === next ? prev : next));
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-vip-theme'] });
    return () => obs.disconnect();
  }, []);

  // All state and hooks must be at the top
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    base44.auth.me().then(async user => {
      if (!user) return;
      setCurrentUser(user);

      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
        if (profiles?.[0]) setCurrentUserProfile(profiles[0]);
      } catch (_) {}

      try {
        const response = await base44.functions.invoke('getUserSubscription', {});
        const data = response.data || response;
        const badge = data.planType || data.subscription?.plan_type || data.subscription?.plan || (user.email === 'info@spicey.live' ? 'business' : null);
        setCurrentUserBadge((data.hasSubscription && badge) || user.email === 'info@spicey.live' ? badge : null);
      } catch (_) {
        if (user.email === 'info@spicey.live') setCurrentUserBadge('business');
      }
    });
  }, []);

  // Fetch real chats from database - only chats this user is part of, sorted by most recent
  const { data: chatsData, refetch: refetchChats } = useQuery({
    queryKey: ['chats', currentUser?.id],
    queryFn: async () => {
      const all = await base44.entities.Chat.list('-last_message_time', 100);
      return all.filter(c => Array.isArray(c.participant_ids) && c.participant_ids.includes(currentUser.id));
    },
    enabled: !!currentUser?.id,
    staleTime: 120000,
    refetchOnWindowFocus: false,
  });
  const chats = chatsData || EMPTY_LIST;

  // Handle direct message navigation from profile
  useEffect(() => {
    if (location.state?.directUserId) {
      setActiveChat({
        id: location.state.directUserId,
        name: location.state.directUserName,
        username: location.state.directUserUsername,
        img: location.state.directUserAvatar,
        online: false,
        preview: '',
        time: 'Now',
        unread: 0,
        isDirectMessage: true,
        userId: location.state.directUserId
      });
      // Clear state from history
      window.history.replaceState({}, document.title, '/messages');
    }
  }, [location]);

  // Delete a chat
  const deleteChat = async (chatId) => {
    setConversations(prev => prev.filter(c => c.chatId !== chatId));
    try {
      await base44.entities.Chat.delete(chatId);
    } catch (err) {
      console.error('Failed to delete chat:', err);
      refetchChats();
    }
  };

  // Real-time subscriptions temporarily disabled for performance
  // Will re-enable after base page renders
  // useEffect(() => { ... }, [currentUser?.id, chats]);

  // Call subscriptions temporarily disabled for performance
  // useEffect(() => { ... }, [currentUser?.id]);

  // Also fetch missed calls to show in inbox
  const { data: missedCallsData } = useQuery({
    queryKey: ['missed-calls-inbox', currentUser?.id],
    queryFn: () => base44.entities.MissedCall.filter({ receiver_id: currentUser.id, seen: false }, '-created_date', 20),
    enabled: !!currentUser?.id,
    staleTime: 120000,
  });
  const missedCalls = missedCallsData || EMPTY_LIST;

  const { data: suggestedFriendsData } = useQuery({
    queryKey: ['message-suggested-friends', currentUser?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('searchUsers', { query: '', limit: 12 });
      const data = res.data || res;
      const users = Array.isArray(data) ? data : (data.users || data.profiles || []);
      return users
        .filter((u) => (u.user_id || u.id) && (u.user_id || u.id) !== currentUser?.id)
        .map((u) => ({
          id: u.user_id || u.id,
          name: u.full_name || u.username || u.email?.split('@')[0] || 'User',
          username: u.username || u.email?.split('@')[0] || 'user',
          img: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.username || 'User')}&background=ff5500&color=fff&size=100`,
          online: false,
          preview: 'Start a conversation',
          time: 'Now',
          unread: 0,
          chatId: null,
          userId: u.user_id || u.id,
          isDirectMessage: true,
        }));
    },
    enabled: !!currentUser?.id,
    staleTime: 120000,
    refetchOnWindowFocus: false,
  });
  const suggestedFriends = suggestedFriendsData || EMPTY_LIST;

  // Transform chats to conversation objects
  useEffect(() => {
    if (chats.length === 0 || !currentUser?.id) {
      setConversations([]);
      return;
    }

    // Load real profile avatars for all other participants
    const buildConversations = async () => {
      const conversationsList = [];

      // Collect all other user IDs so we can batch-fetch profiles
      const otherUserIds = chats
        .map(chat => chat.participant_ids?.find(id => id !== currentUser?.id))
        .filter(Boolean);

      // Fetch all profiles in one call and index by user_id
      let profilesByUserId = {};
      if (otherUserIds.length > 0) {
        try {
          const profiles = await base44.entities.UserProfile.list('-updated_date', 500);
          profiles.forEach(p => { if (p.user_id) profilesByUserId[p.user_id] = p; });
        } catch (e) {}
      }

      for (const chat of chats) {
        const otherUserId = chat.participant_ids?.find(id => id !== currentUser?.id);
        if (!otherUserId) continue;

        const profile = profilesByUserId[otherUserId];
        const name = profile?.full_name || profile?.username ||
          chat.participant_usernames?.[chat.participant_ids?.indexOf(otherUserId)] || 'User';
        const avatar = profile?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a0a2e&color=fff&size=100`;
        const timeStr = chat.last_message_time ? timeAgo(chat.last_message_time) : '';

        conversationsList.push({
          id: chat.id,
          name,
          img: avatar,
          preview: chat.last_message || 'No messages yet',
          time: timeStr,
          unread: 0,
          online: false,
          chatId: chat.id,
          userId: otherUserId,
          lastMessageTime: chat.updated_date || chat.last_message_time || new Date().toISOString()
        });
      }
      return conversationsList;
    };

    let cancelled = false;
    buildConversations().then((conversationsList) => {
      if (cancelled) return;
      // Sort: unread first, then by most recent message time (newest first)
      conversationsList.sort((a, b) => {
        if (a.unread > 0 && b.unread === 0) return -1;
        if (b.unread > 0 && a.unread === 0) return 1;
        const timeDiff = new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        if (timeDiff !== 0) return timeDiff;
        // Fallback: if times are equal, sort by name alphabetically
        return a.name.localeCompare(b.name);
      });

      // Inject missed calls as special "conversation" items for callers not already in chat list
      const missedCallItems = (missedCalls || [])
        .filter(mc => !conversationsList.some(c => c.userId === mc.caller_id))
        .map(mc => ({
          id: 'missed-' + mc.id,
          name: mc.caller_name || 'Unknown',
          img: mc.caller_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mc.caller_name || 'U')}&background=1a0a2e&color=fff&size=100`,
          preview: mc.call_type === 'video' ? '📹 Missed video call' : '📞 Missed call',
          time: timeAgo(mc.created_date),
          unread: 1,
          online: false,
          chatId: null,
          userId: mc.caller_id,
          lastMessageTime: mc.created_date || new Date().toISOString(),
          isMissedCall: true,
          missedCallId: mc.id,
        }));

      const combined = [...missedCallItems, ...conversationsList].sort((a, b) => {
        if (a.unread > 0 && b.unread === 0) return -1;
        if (b.unread > 0 && a.unread === 0) return 1;
        const timeDiff = new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.name.localeCompare(b.name);
      });

      setConversations(combined);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [chats, currentUser?.id, missedCalls]);

  if (activeChat) return <ChatView key={activeChat.id} convo={activeChat} onBack={() => { setActiveChat(null); refetchChats(); }} />;

  const displayConversations = conversations.length > 0 ? conversations : suggestedFriends;
  const activePeople = conversations.length > 0 ? conversations : suggestedFriends;

  const filtered = displayConversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const fg = isLight ? '#121218' : 'white';
  const fgMuted = isLight ? '#6F6B7A' : 'rgba(255,255,255,0.4)';
  const fgSub = isLight ? '#757575' : 'rgba(255,255,255,0.35)';
  const surfaceBg = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)';
  const surfaceBorder = isLight ? 'rgba(21,18,28,0.08)' : 'rgba(255,255,255,0.08)';
  const hasVipTheme = !!document.documentElement.getAttribute('data-vip-theme') && !isLight;
  const topBarBg = isLight ? 'rgba(255,255,255,0.94)' : (hasVipTheme ? 'rgba(0,0,0,0.25)' : 'rgba(8,4,12,0.95)');
  const topBarBorder = isLight ? 'rgba(21,18,28,0.08)' : 'rgba(255,255,255,0.05)';
  const currentDisplayName = currentUserProfile?.full_name || currentUser?.full_name || currentUser?.email?.split('@')[0] || 'User';
  const currentAvatarSrc = currentUserProfile?.avatar_url || currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentDisplayName)}&background=ff5500&color=fff&size=100`;

  const pageBg = pageBgFromHook;

  return (
    <>
    <div className="min-h-screen relative" style={{ background: pageBg, paddingBottom: 'max(7rem, env(safe-area-inset-bottom) + 6rem)', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div className="messages-topbar sticky top-0 z-40 px-4"
        style={{
          paddingTop: 'max(2.5rem, env(safe-area-inset-top) + 0.5rem)',
          paddingBottom: 12,
          background: topBarBg,
          borderBottom: `1px solid ${topBarBorder}`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>

        {/* Row 1: avatar | SPICEY logo | filter + menu */}
        <div className="flex items-center justify-between mb-3">
          {/* Avatar */}
          <div className="relative">
            <div style={{ width: 42, height: 42, borderRadius: '50%', padding: 2, background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', boxShadow: '0 4px 12px rgba(255,107,53,0.35)' }}>
              <UserAvatarMedia
                src={currentAvatarSrc}
                alt="me"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {currentUserBadge && (
              <div style={{ position: 'absolute', top: -4, right: -4, filter: 'drop-shadow(0 2px 7px rgba(0,0,0,0.42))' }}>
                <VerifiedBadge type={currentUserBadge} size="sm" />
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid white', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
          </div>

          {/* SPICEY logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SpiceyLogoText height={100} />
          </div>

          {/* Filter + menu */}
          <div className="flex items-center gap-2">
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.1)', border: isLight ? '1px solid rgba(21,18,28,0.08)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isLight ? '0 2px 10px rgba(20,18,28,0.07)' : 'none' }}>
              <Filter className="w-4 h-4" style={{ color: isLight ? '#FF6B35' : 'rgba(255,255,255,0.7)' }} />
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255,107,53,0.5)' }}>
              <span className="text-white font-bold text-sm">•••</span>
            </button>
          </div>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: fg, background: 'transparent', WebkitTextFillColor: fg }}>
            Messages
          </h2>
          {conversations.filter(c => c.unread > 0).length > 0 && (
            <span style={{ background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, boxShadow: '0 2px 8px rgba(255,107,53,0.4)' }}>
              {conversations.filter(c => c.unread > 0).length} unread
            </span>
          )}
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', height: 46, borderRadius: 23, background: surfaceBg, border: `1px solid ${surfaceBorder}`, boxShadow: isLight ? '0 2px 14px rgba(20,18,28,0.06)' : 'none', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #FF6B35, #FF2E9D, #8B5CF6)' }} />
            <Search style={{ position: 'absolute', left: 16, width: 18, height: 18, color: isLight ? '#7A7484' : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search messages..."
              style={{ width: '100%', height: '100%', paddingLeft: 44, paddingRight: 16, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: isLight ? '#121218' : 'white', fontFamily: 'inherit' }}
            />
          </div>
          <button style={{ width: 46, height: 46, minWidth: 46, borderRadius: '50%', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)', border: isLight ? '1px solid rgba(21,18,28,0.08)' : '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isLight ? '0 2px 14px rgba(20,18,28,0.07)' : 'none' }}>
            <svg width="13" height="13" fill="none" stroke={isLight ? '#FF6B35' : 'rgba(255,255,255,0.5)'} viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2.5"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2.5"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2.5"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Active Now ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.7)' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: isLight ? '#1C1C1E' : 'white' }}>Active Now</span>
          </div>
          <button style={{ fontSize: 13, fontWeight: 600, color: '#e91e8c', background: 'none', border: 'none', cursor: 'pointer' }}>See all ›</button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {/* Your Story */}
          <motion.button onClick={() => setStoryModalOpen(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform">
            <div style={{ position: 'relative' }}>
              <div style={{ padding: 2, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', boxShadow: '0 0 10px rgba(255,107,53,0.4)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'white' }}>
                    <UserAvatarMedia src={currentAvatarSrc} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                </div>
                {currentUserBadge && (
                  <div style={{ position: 'absolute', top: -5, right: -5, filter: 'drop-shadow(0 2px 7px rgba(0,0,0,0.42))' }}>
                    <VerifiedBadge type={currentUserBadge} size="sm" />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(255,107,53,0.5)' }}>
                <Plus style={{ width: 12, height: 12, color: 'white' }} />
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: isLight ? '#555' : 'rgba(255,255,255,0.55)', textAlign: 'center', width: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Your Story</span>
          </motion.button>

          {/* Other users from conversations */}
          {activePeople.slice(0, 6).map((c, i) => (
            <motion.button key={c.id} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              onClick={() => setActiveChat({...c, chatId: c.chatId, userId: c.userId})}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform">
              <div style={{ position: 'relative' }}>
                <div style={{ padding: 2, borderRadius: '50%', background: 'linear-gradient(135deg, #FFB6C1, #FF80AB, #E1BEE7)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'white' }}>
                    <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=ff5500&color=fff&size=100`; }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid white' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: isLight ? '#555' : 'rgba(255,255,255,0.55)', textAlign: 'center', width: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name.split(' ')[0]}</span>
            </motion.button>
          ))}

          {/* More */}
          <motion.button className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div style={{ width: 67, height: 67, borderRadius: '50%', background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.08)', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, color: isLight ? '#999' : 'rgba(255,255,255,0.3)' }}>•••</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: isLight ? '#555' : 'rgba(255,255,255,0.35)' }}>More</span>
          </motion.button>
        </div>
      </div>

      {/* ── Conversation list ── */}
      <div className="px-4">
        <AnimatePresence>
          {filtered.map((c, i) => {
            const isDeleting = !!c.chatId && deletingChatId === c.chatId;
            const holdKey = c.chatId || c.id;
            const handlePressStart = () => {
              if (!c.chatId) return;
              holdTimersRef.current[holdKey] = setTimeout(() => {
                if (navigator.vibrate) navigator.vibrate([30]);
                setDeletingChatId(c.chatId);
              }, 700);
            };
            const handlePressEnd = () => clearTimeout(holdTimersRef.current[holdKey]);
            const handleClickDelete = (e) => { e.stopPropagation(); deleteChat(c.chatId); };

            return (
              <motion.div key={c.id} layout>

                {isDeleting ? (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 px-3 py-3.5 mb-2"
                    style={{ background: isLight ? '#FFF5F5' : 'rgba(255,255,255,0.05)', borderRadius: 20, border: isLight ? '1px solid rgba(255,59,48,0.15)' : 'none' }}>
                    <span className="text-sm flex-1" style={{ color: isLight ? '#6B6B6B' : 'rgba(255,255,255,0.6)' }}>Delete this chat?</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleClickDelete}
                      className="px-4 py-2 rounded-full font-bold text-sm text-white"
                      style={{ background: '#FF3B30', boxShadow: '0 2px 8px rgba(255,59,48,0.3)' }}>Delete</motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setDeletingChatId(null); }}
                      className="px-4 py-2 rounded-full font-bold text-sm"
                      style={{ background: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.08)', color: isLight ? '#000' : 'rgba(255,255,255,0.7)' }}>Cancel</motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: i * 0.03 }}
                    onClick={async () => {
                      if (deletingChatId === c.chatId) return;
                      if (c.isMissedCall && c.missedCallId) base44.entities.MissedCall.update(c.missedCallId, { seen: true }).catch(() => {});
                      setActiveChat({...c, chatId: c.chatId, userId: c.userId});
                    }}
                    onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart} onTouchEnd={handlePressEnd}
                    className="w-full flex items-center gap-3 mb-3 text-left active:scale-[0.98] transition-all"
                    style={{
                      padding: '11px 14px',
                      borderRadius: 18,
                      background: isLight
                          ? c.unread > 0
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,247,243,0.96))'
                            : 'rgba(255,255,255,0.88)'
                          : (c.unread > 0 ? 'rgba(255,80,0,0.08)' : 'rgba(255,255,255,0.03)'),
                      border: isLight
                          ? (c.unread > 0 ? '1px solid rgba(255,107,53,0.18)' : '1px solid rgba(21,18,28,0.08)')
                          : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: isLight
                          ? c.unread > 0
                            ? '0 4px 18px rgba(255,107,53,0.11)'
                            : '0 2px 10px rgba(20,18,28,0.05)'
                          : 'none',
                      backdropFilter: 'blur(16px)',
                      position: 'relative',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      touchAction: 'manipulation',
                    }}>

                    {/* Unread dot */}
                    {c.unread > 0 && (
                      <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #e91e8c, #FF6B35)', boxShadow: '0 0 8px rgba(233,30,140,0.6)' }} />
                    )}

                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0, marginLeft: c.unread > 0 ? 6 : 0 }}>
                      <div style={{ padding: 2, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #e91e8c, #9C27B0)' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #FF6B35, #e91e8c)' }}>
                          <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy"
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'U')}&background=ff5500&color=fff&size=80`; }} />
                        </div>
                      </div>
                      {c.online && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid white', display: 'block' }} />}
                    </div>

                    {/* Name + preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <p style={{ fontSize: 14, fontWeight: c.unread > 0 ? 700 : 600, color: isLight ? '#1C1C1E' : 'rgba(255,255,255,0.9)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                        {c.name?.toLowerCase().includes('spicey') && (
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'white', fontSize: 8, fontWeight: 700 }}>✓</span>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.35)', fontWeight: c.unread > 0 ? 600 : 400, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</p>
                    </div>

                    {/* Time + badge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: isLight ? '#AEAEB2' : 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{c.time}</span>
                      {c.unread > 0 ? (
                        <span style={{ minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.unread}
                        </span>
                      ) : (
                        <CheckCheck style={{ width: 12, height: 12, color: isLight ? '#C7C7CC' : 'rgba(255,255,255,0.2)' }} />
                      )}
                    </div>
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span style={{ fontSize: 40 }}>💬</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: isLight ? '#3C3C43' : 'rgba(255,255,255,0.3)', margin: 0 }}>No conversations yet</p>
            <p style={{ fontSize: 13, color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.18)', margin: 0 }}>Start a new one with the + button</p>
          </div>
        )}
      </div>

      <CreatorScreen isOpen={storyModalOpen} onClose={() => setStoryModalOpen(false)} />
      <NewMessageSheet open={newMsgOpen} onClose={() => setNewMsgOpen(false)}
        onStartChat={(c) => setActiveChat({ ...c, id: Date.now(), preview: '', time: 'Now', unread: 0, online: c.online })} />
    </div>
    <BottomNavEnhanced />
    </>
  );
}
