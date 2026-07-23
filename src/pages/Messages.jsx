import React, { useState, useEffect } from 'react';
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

import { Search, Plus, CheckCheck, Filter, SquarePen, ScanLine, Users } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { base44 } from '@/api/base44Client';
import { isAdminEmail } from '@/lib/adminAccess';
import { useQuery } from '@tanstack/react-query';
import BottomNavEnhanced from '../components/feed/BottomNavEnhanced';
import CreatorScreen from '../components/feed/CreatorScreen.jsx';
import ChatView from '../components/messages/ChatView.jsx';
import NewMessageSheet from '../components/panels/NewMessageSheet.jsx';
import VerifiedBadge from '../components/shared/VerifiedBadge.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpiceyLogoText from '@/components/shared/SpiceyLogoText';

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
  const [conversationsReady, setConversationsReady] = useState(false);
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
        const badge = data.planType || data.subscription?.plan_type || data.subscription?.plan || (isAdminEmail(user) ? 'business' : null);
        setCurrentUserBadge((data.hasSubscription && badge) || isAdminEmail(user) ? (badge || 'business') : null);
      } catch (_) {
        if (isAdminEmail(user)) setCurrentUserBadge('business');
      }
    });
  }, []);

  // Fetch real chats from database - only chats this user is part of, sorted by most recent
  const { data: chatsData, refetch: refetchChats } = useQuery({
    queryKey: ['chats', currentUser?.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('getUserChats', {});
      const rows = response.data?.chats || response.data || [];
      return rows.filter(c => Array.isArray(c.participant_ids) && c.participant_ids.includes(currentUser.id));
    },
    enabled: !!currentUser?.id,
    staleTime: 2000,
    refetchInterval: 4000,
    refetchOnWindowFocus: false,
  });
  const chats = chatsData || EMPTY_LIST;

  // Handle direct message navigation from profile
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('chatPreview') === '1') {
      setActiveChat({
        id: 'spicey-chat-preview',
        name: 'Sophia',
        username: 'sophia',
        img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=180&h=180&fit=crop&crop=faces&q=90',
        online: true,
        preview: 'Tonight! SPM?',
        time: 'Now',
        unread: 0,
        isPreview: true,
        userId: 'preview-user',
        previewMessages: [
          { id: 'preview-1', text: 'Hey! How are you?', from: 'them', time: '', read: true },
          { id: 'preview-2', text: "I'm great! 🔥", from: 'them', time: '', read: true },
          { id: 'preview-3', text: 'Want to meet?', from: 'me', time: '', read: true },
          { id: 'preview-4', text: 'Yes! 🔥 When?', from: 'them', time: '', read: true },
          { id: 'preview-5', text: 'Tonight! SPM?', from: 'me', time: '', read: true },
        ],
      });
      return;
    }

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

  // Clear the unread presentation immediately when a conversation is opened.
  // ChatView persists the read state through markChatRead; this keeps the inbox
  // color and badge in sync without waiting for the next network refetch.
  const openConversation = React.useCallback((conversation) => {
    setConversations((previous) => previous.map((item) =>
      (item.chatId && conversation.chatId && item.chatId === conversation.chatId) || item.id === conversation.id
        ? { ...item, unread: 0 }
        : item
    ));
    setActiveChat({ ...conversation, unread: 0 });
  }, []);

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
    if (!currentUser?.id || chatsData === undefined) {
      setConversationsReady(false);
      setConversations([]);
      return;
    }
    if (chats.length === 0) {
      setConversations([]);
      setConversationsReady(true);
      return;
    }

    setConversationsReady(false);

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
          const profiles = await base44.entities.UserProfile.list('-updated_at', 500);
          profiles.forEach(p => { if (p.user_id) profilesByUserId[p.user_id] = p; });
        } catch (e) {}
      }

      for (const chat of chats) {
        const otherUserId = chat.participant_ids?.find(id => id !== currentUser?.id);
        if (!otherUserId) continue;

        const profile = chat.other_profile || profilesByUserId[otherUserId];
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
          unread: activeChat?.chatId === chat.id ? 0 : Number(chat.unread_count || 0),
          online: false,
          chatId: chat.id,
          userId: otherUserId,
          lastMessageTime: chat.last_message_time || chat.updated_at || chat.updated_date || chat.created_at || chat.created_date || new Date(0).toISOString()
        });
      }
      return conversationsList;
    };

    let cancelled = false;
    buildConversations().then((conversationsList) => {
      if (cancelled) return;
      // The inbox is chronological. Unread state is shown by the badge, but it
      // must never move an older conversation above a newer message.
      conversationsList.sort((a, b) => {
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
        const timeDiff = new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.name.localeCompare(b.name);
      });

      setConversations(combined);
      setConversationsReady(true);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [chatsData, currentUser?.id, missedCalls, activeChat?.chatId]);

  // A push notification can cold-launch the app. Open the exact conversation
  // only after the authenticated inbox has finished building its rows.
  useEffect(() => {
    if (!conversationsReady || activeChat) return;
    const params = new URLSearchParams(location.search);
    const requestedChatId = params.get('chatId');
    const requestedSenderId = params.get('senderId');
    if (!requestedChatId && !requestedSenderId) return;

    const match = conversations.find((conversation) =>
      (requestedChatId && String(conversation.chatId || conversation.id) === requestedChatId) ||
      (requestedSenderId && String(conversation.userId) === requestedSenderId)
    );
    if (!match) return;

    openConversation(match);
    navigate('/messages', { replace: true });
  }, [activeChat, conversations, conversationsReady, location.search, navigate, openConversation]);

  if (activeChat) return <ChatView key={activeChat.id} convo={activeChat} onBack={() => { setActiveChat(null); refetchChats(); }} />;

  const displayConversations = !conversationsReady
    ? EMPTY_LIST
    : (conversations.length > 0 ? conversations : suggestedFriends);
  const activePeople = displayConversations;

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
    <div className={`messages-page min-h-screen relative mx-auto ${isLight ? 'messages-page-light' : ''}`} style={{ background: pageBg, paddingBottom: 'max(7rem, env(safe-area-inset-bottom) + 6rem)', overflow: 'hidden', width: 'min(100vw, 430px)', maxWidth: 430, boxSizing: 'border-box', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 80px rgba(0,0,0,0.45)' }}>

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
        <div className="messages-logo-row relative flex items-center justify-between mb-3">
          {/* Avatar */}
          <div className="messages-me-avatar relative">
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
          <div className="messages-logo-center" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <SpiceyLogoText height={56} />
          </div>

          {/* Filter + menu */}
          <div className="messages-header-actions flex items-center gap-2">
            <button className="messages-filter-button" style={{ width: 36, height: 36, borderRadius: '50%', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.1)', border: isLight ? '1px solid rgba(21,18,28,0.08)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isLight ? '0 2px 10px rgba(20,18,28,0.07)' : 'none' }}>
              <Filter className="w-4 h-4" style={{ color: isLight ? '#FF6B35' : 'rgba(255,255,255,0.7)' }} />
            </button>
            <button className="messages-compose-button" onClick={() => setNewMsgOpen(true)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255,107,53,0.5)' }}>
              <SquarePen className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Title row */}
        <div className="messages-title-row flex items-center justify-between mb-3">
          <h2 style={{ fontSize: 21, fontWeight: 560, margin: 0, color: fg, background: 'transparent', WebkitTextFillColor: fg, letterSpacing: 0 }}>
            Messages
          </h2>
          {conversations.reduce((total, conversation) => total + Number(conversation.unread || 0), 0) > 0 && (
            <span style={{ background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', color: 'white', fontSize: 8, lineHeight: 1, fontWeight: 700, padding: '3px 6px', borderRadius: 10, boxShadow: '0 1px 5px rgba(255,107,53,0.3)' }}>
              {conversations.reduce((total, conversation) => total + Number(conversation.unread || 0), 0)} unread
            </span>
          )}
        </div>

        {/* Search bar */}
        <div className="messages-search-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="messages-search-box" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', height: 46, borderRadius: 23, background: surfaceBg, border: `1px solid ${surfaceBorder}`, boxShadow: isLight ? '0 2px 14px rgba(20,18,28,0.06)' : 'none', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #FF6B35, #FF2E9D, #8B5CF6)' }} />
            <Search style={{ position: 'absolute', left: 16, width: 18, height: 18, color: isLight ? '#7A7484' : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search messages..."
              style={{ width: '100%', height: '100%', paddingLeft: 44, paddingRight: 16, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: isLight ? '#121218' : 'white', fontFamily: 'inherit' }}
            />
          </div>
          <button className="messages-scan-button" style={{ width: 46, height: 46, minWidth: 46, borderRadius: '50%', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)', border: isLight ? '1px solid rgba(21,18,28,0.08)' : '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isLight ? '0 2px 14px rgba(20,18,28,0.07)' : 'none' }}>
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Active Now ── */}
      <div className="messages-active-card px-4 pt-4 pb-3">
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
              <div style={{ padding: 2.5, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35 0%, #e91e8c 50%, #8B5CF6 100%)', boxShadow: '0 0 12px rgba(233,30,140,0.42)' }}>
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
              onClick={() => openConversation({...c, chatId: c.chatId, userId: c.userId})}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform">
              <div style={{ position: 'relative' }}>
                <div style={{ padding: 2.5, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35 0%, #e91e8c 50%, #8B5CF6 100%)', boxShadow: '0 0 12px rgba(139,92,246,0.38)' }}>
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
              <Users className="w-6 h-6" style={{ color: isLight ? '#271334' : 'rgba(255,255,255,0.3)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: isLight ? '#555' : 'rgba(255,255,255,0.35)' }}>More</span>
          </motion.button>
        </div>
      </div>

      {/* ── Conversation list ── */}
      <div className="messages-list px-4">
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
                      openConversation({...c, chatId: c.chatId, userId: c.userId});
                    }}
                    onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart} onTouchEnd={handlePressEnd}
                    className={`message-thread-card w-full flex items-center gap-3 mb-3 text-left active:scale-[0.98] transition-all ${c.unread > 0 ? 'is-unread' : ''}`}
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
    <style>{`
      body {
        background: #050407;
      }
      .messages-page {
        min-height: 100dvh;
      }
      .messages-logo-row {
        min-height: 46px;
      }
      .messages-logo-center img {
        max-height: 52px;
      }
      .messages-neon-wordmark {
        position: relative;
        width: min(178px, 46vw);
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Inter", "Avenir Next", sans-serif;
        font-size: 22px;
        font-weight: 900;
        font-style: italic;
        line-height: 1;
        letter-spacing: .16em;
        text-transform: uppercase;
        transform: skewX(-10deg);
        filter: none;
      }
      .messages-neon-wordmark span {
        position: relative;
        z-index: 2;
        padding-left: .16em;
        background: linear-gradient(96deg, #fff7df 0%, #ff8a00 20%, #ff2d55 50%, #ff45d8 68%, #8d4dff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
      .messages-neon-wordmark::before,
      .messages-neon-wordmark::after {
        content: "";
        position: absolute;
        left: 50%;
        width: min(176px, 43vw);
        height: 1px;
        transform: translateX(-50%);
        pointer-events: none;
        background: linear-gradient(90deg, transparent, rgba(255,122,0,.78), rgba(255,45,180,.78), rgba(122,43,255,.64), transparent);
      }
      .messages-neon-wordmark::before {
        top: 4px;
        opacity: .62;
      }
      .messages-neon-wordmark::after {
        bottom: 3px;
        opacity: .44;
      }
      .messages-page-light .messages-neon-wordmark span {
        background: linear-gradient(96deg, #ff6b1a 0%, #ff2d55 44%, #c218e7 72%, #7b2dff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .messages-page-light .messages-neon-wordmark::before,
      .messages-page-light .messages-neon-wordmark::after {
        background: linear-gradient(90deg, transparent, rgba(255,106,22,.64), rgba(255,45,151,.62), rgba(130,45,255,.52), transparent);
      }
      .messages-page-light {
        background:
          radial-gradient(circle at 86% 4%, rgba(255, 111, 56, .42), transparent 24%),
          radial-gradient(circle at 92% 43%, rgba(255, 45, 155, .34), transparent 27%),
          radial-gradient(circle at 88% 96%, rgba(136, 69, 255, .42), transparent 30%),
          radial-gradient(circle at 0% 78%, rgba(255, 45, 155, .18), transparent 28%),
          linear-gradient(180deg, #fff7f6 0%, #fff2f7 43%, #ffd5de 73%, #ef4abf 100%) !important;
        color: #150927;
        overflow-y: auto !important;
      }
      .messages-page-light::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(135deg, transparent 0 78%, rgba(255, 107, 53, .4) 78% 82%, transparent 82%),
          radial-gradient(circle at 96% 8%, rgba(255,255,255,.78), transparent 1.2%),
          radial-gradient(circle at 98% 20%, rgba(255,255,255,.55), transparent 1%),
          radial-gradient(circle at 96% 32%, rgba(255,255,255,.42), transparent 1.1%);
        opacity: .82;
      }
      .messages-page-light .messages-topbar {
        position: relative !important;
        top: auto !important;
        background: transparent !important;
        border-bottom: 0 !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        padding: max(24px, env(safe-area-inset-top) + 12px) 22px 14px !important;
      }
      .messages-page-light .messages-logo-row {
        min-height: 72px;
        align-items: center !important;
        margin-bottom: 2px !important;
      }
      .messages-page-light .messages-me-avatar > div:first-child {
        width: 62px !important;
        height: 62px !important;
        padding: 3px !important;
        background: linear-gradient(145deg, #ff6232, #ff2d87 54%, #9b35ff) !important;
        box-shadow: 0 10px 24px rgba(255, 58, 130, .22) !important;
      }
      .messages-page-light .messages-me-avatar > div:last-child {
        width: 17px !important;
        height: 17px !important;
        right: -1px !important;
        bottom: 2px !important;
      }
      .messages-page-light .messages-logo-row [style*="justify-content: center"] svg,
      .messages-page-light .messages-logo-row [style*="justify-content: center"] img {
        max-height: 58px !important;
      }
      .messages-page-light .messages-logo-row [style*="justify-content: center"] {
        transform: translateX(6px) scale(1.12);
      }
      .messages-page-light .messages-logo-center {
        transform: translate(-50%, -50%) translateX(6px) scale(1.12) !important;
      }
      .messages-page-light .messages-logo-center img {
        max-height: 58px !important;
      }
      .messages-page-light .messages-header-actions {
        gap: 12px !important;
      }
      .messages-page-light .messages-filter-button,
      .messages-page-light .messages-compose-button {
        width: 56px !important;
        height: 56px !important;
        border: 0 !important;
        border-radius: 50% !important;
      }
      .messages-page-light .messages-filter-button {
        color: #190d31 !important;
        background: rgba(255,255,255,.64) !important;
        box-shadow: 0 16px 34px rgba(109, 36, 82, .1), inset 0 1px rgba(255,255,255,.86) !important;
      }
      .messages-page-light .messages-filter-button svg {
        width: 24px !important;
        height: 24px !important;
        color: #190d31 !important;
      }
      .messages-page-light .messages-compose-button {
        background:
          radial-gradient(circle at 70% 16%, rgba(255,255,255,.32), transparent 26%),
          linear-gradient(145deg, #ff7a32, #ff2d75 55%, #9a35ff) !important;
        box-shadow: 0 18px 36px rgba(255, 45, 155, .34), inset 0 2px rgba(255,255,255,.22) !important;
      }
      .messages-page-light .messages-title-row {
        justify-content: center !important;
        position: relative;
        margin: -4px 0 24px !important;
      }
      .messages-page-light .messages-title-row h2 {
        font-size: 42px !important;
        line-height: 1 !important;
        font-weight: 950 !important;
        letter-spacing: 0 !important;
        color: #271049 !important;
        -webkit-text-fill-color: #271049 !important;
        text-shadow: 0 1px 0 rgba(255,255,255,.55);
      }
      .messages-page-light .messages-title-row span {
        position: static !important;
        margin-left: 14px !important;
        color: #ff315a !important;
        background: rgba(255,255,255,.74) !important;
        box-shadow: 0 10px 22px rgba(130, 38, 92, .1), inset 0 1px rgba(255,255,255,.9) !important;
        font-size: 14px !important;
        padding: 7px 13px !important;
      }
      .messages-page-light .messages-title-row span::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 7px;
        background: #ff315a;
      }
      .messages-page-light .messages-search-row {
        gap: 0 !important;
      }
      .messages-page-light .messages-search-box {
        height: 70px !important;
        border-radius: 26px !important;
        background: rgba(255,255,255,.72) !important;
        border: 1px solid rgba(255,255,255,.94) !important;
        box-shadow: 0 20px 38px rgba(190, 54, 127, .14), inset 0 1px rgba(255,255,255,.95) !important;
        backdrop-filter: blur(18px) saturate(1.2) !important;
        -webkit-backdrop-filter: blur(18px) saturate(1.2) !important;
      }
      .messages-page-light .messages-search-box > div:first-child {
        display: none !important;
      }
      .messages-page-light .messages-search-box svg {
        left: 20px !important;
        width: 27px !important;
        height: 27px !important;
        color: #a64d73 !important;
      }
      .messages-page-light .messages-search-box input {
        padding-left: 65px !important;
        padding-right: 58px !important;
        color: #2a1738 !important;
        font-size: 22px !important;
        font-weight: 800 !important;
      }
      .messages-page-light .messages-search-box input::placeholder {
        color: rgba(88, 46, 107, .58) !important;
      }
      .messages-page-light .messages-scan-button {
        position: absolute !important;
        right: 39px !important;
        width: 42px !important;
        height: 42px !important;
        min-width: 42px !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        color: #ff2d75 !important;
      }
      .messages-page-light .messages-scan-button svg {
        width: 29px !important;
        height: 29px !important;
      }
      .messages-page-light .messages-active-card {
        margin: 8px 18px 18px !important;
        padding: 24px 20px 20px !important;
        border-radius: 26px !important;
        background: rgba(255,255,255,.48) !important;
        border: 1px solid rgba(255,255,255,.72) !important;
        box-shadow: 0 20px 42px rgba(194, 56, 138, .12), inset 0 1px rgba(255,255,255,.76) !important;
        backdrop-filter: blur(18px) saturate(1.14) !important;
        -webkit-backdrop-filter: blur(18px) saturate(1.14) !important;
      }
      .messages-page-light .messages-active-card > div:first-child {
        margin-bottom: 18px !important;
      }
      .messages-page-light .messages-active-card > div:first-child span:last-child {
        font-size: 20px !important;
        color: #101018 !important;
      }
      .messages-page-light .messages-active-card > div:first-child button {
        color: #ff2d75 !important;
        font-size: 16px !important;
        font-weight: 900 !important;
      }
      .messages-page-light .messages-active-card .overflow-x-auto {
        gap: 22px !important;
      }
      .messages-page-light .messages-active-card [style*="width: 52px"] {
        width: 66px !important;
        height: 66px !important;
      }
      .messages-page-light .messages-active-card button > span {
        width: 76px !important;
        color: #111118 !important;
        font-size: 14px !important;
        font-weight: 650 !important;
      }
      .messages-page-light .messages-list {
        padding: 0 18px 18px !important;
      }
      .messages-page-light .message-thread-card {
        min-height: 92px !important;
        margin-bottom: 10px !important;
        padding: 16px 17px !important;
        border-radius: 25px !important;
        border: 1px solid rgba(255,255,255,.72) !important;
        background:
          radial-gradient(circle at 88% 18%, rgba(255, 45, 155, .13), transparent 34%),
          radial-gradient(circle at 12% 88%, rgba(255, 106, 0, .08), transparent 30%),
          linear-gradient(110deg, rgba(255,255,255,.68), rgba(255,232,247,.58) 54%, rgba(239,228,255,.64)) !important;
        box-shadow: 0 13px 27px rgba(132, 42, 120, .08), inset 0 1px rgba(255,255,255,.86) !important;
        backdrop-filter: blur(16px) saturate(1.14) !important;
        -webkit-backdrop-filter: blur(16px) saturate(1.14) !important;
      }
      .messages-page-light .message-thread-card.is-unread {
        background:
          radial-gradient(circle at 88% 50%, rgba(255,45,155,.24), transparent 35%),
          radial-gradient(circle at 20% 10%, rgba(255, 210, 112, .18), transparent 30%),
          linear-gradient(105deg, rgba(255,246,222,.78) 0%, rgba(255,187,134,.56) 36%, rgba(255,87,174,.46) 100%) !important;
        border-color: rgba(255,255,255,.86) !important;
        box-shadow: 0 14px 30px rgba(242, 68, 155, .12), inset 0 1px rgba(255,255,255,.78) !important;
      }
      .messages-page-light .message-thread-card:nth-of-type(2).is-unread,
      .messages-page-light .message-thread-card:nth-of-type(2) {
        background:
          radial-gradient(circle at 86% 16%, rgba(143, 53, 255, .16), transparent 34%),
          radial-gradient(circle at 8% 82%, rgba(255,45,155,.08), transparent 30%),
          linear-gradient(110deg, rgba(255,255,255,.66), rgba(255,224,249,.58) 48%, rgba(235,222,255,.68)) !important;
      }
      .messages-page-light .message-thread-card:nth-of-type(3) {
        background:
          radial-gradient(circle at 90% 24%, rgba(255, 152, 67, .12), transparent 35%),
          linear-gradient(110deg, rgba(255,255,255,.68), rgba(255,238,241,.58) 52%, rgba(246,232,255,.62)) !important;
      }
      .messages-page-light .message-thread-card:nth-of-type(4) {
        background:
          radial-gradient(circle at 88% 18%, rgba(255, 45, 155, .14), transparent 34%),
          linear-gradient(110deg, rgba(255,255,255,.68), rgba(255,226,244,.58) 50%, rgba(247,229,255,.62)) !important;
      }
      .messages-page-light .message-thread-card:nth-of-type(5) {
        background:
          radial-gradient(circle at 92% 18%, rgba(143, 53, 255, .14), transparent 34%),
          linear-gradient(110deg, rgba(255,255,255,.68), rgba(255,236,247,.56) 50%, rgba(233,224,255,.7)) !important;
      }
      .messages-page-light .message-thread-card [style*="width: 42px"] {
        width: 66px !important;
        height: 66px !important;
      }
      .messages-page-light .message-thread-card [style*="padding: 2px"][style*="border-radius: 50%"] {
        padding: 2.5px !important;
      }
      .messages-page-light .message-thread-card p:first-child {
        color: #0d0d13 !important;
        font-size: 20px !important;
        font-weight: 950 !important;
      }
      .messages-page-light .message-thread-card p:last-child {
        color: #30254a !important;
        font-size: 16px !important;
        font-weight: 650 !important;
      }
      .messages-page-light .message-thread-card [style*="font-size: 10"] {
        color: #2c1d52 !important;
        font-size: 14px !important;
        font-weight: 800 !important;
      }
      .messages-page-light .message-thread-card [style*="min-width: 20px"] {
        min-width: 33px !important;
        height: 33px !important;
        border-radius: 50% !important;
        background: linear-gradient(145deg, #ff6532, #ff2d75 62%, #8f35ff) !important;
        border: 2px solid rgba(255,255,255,.65) !important;
        font-size: 16px !important;
      }
      .messages-page-light + #bottom-nav > div,
      .messages-page-light ~ #bottom-nav > div,
      body:has(.messages-page-light) #bottom-nav > div {
        height: 66px !important;
        border-radius: 28px !important;
        background: rgba(255, 255, 255, .72) !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: 0 16px 34px rgba(120, 40, 105, .12) !important;
        backdrop-filter: blur(22px) saturate(1.15) !important;
        -webkit-backdrop-filter: blur(22px) saturate(1.15) !important;
      }
      body:has(.messages-page-light) #bottom-nav svg {
        color: rgba(63, 43, 86, .66) !important;
        stroke: currentColor !important;
        filter: none !important;
      }
      body:has(.messages-page-light) #bottom-nav a[href="/messages"] svg {
        color: #ff6a00 !important;
        fill: #ff6a00 !important;
        stroke: #ff6a00 !important;
        stroke-width: 0 !important;
        filter: none !important;
      }
      body:has(.messages-page-light) #bottom-nav a[href="/messages"] + div,
      body:has(.messages-page-light) #bottom-nav a[href="/messages"] div {
        box-shadow: none !important;
      }
      @media (max-width: 390px) {
        .messages-page-light .messages-title-row h2 {
          font-size: 36px !important;
        }
        .messages-page-light .messages-search-box {
          height: 62px !important;
        }
        .messages-page-light .messages-active-card {
          margin-left: 14px !important;
          margin-right: 14px !important;
        }
        .messages-page-light .message-thread-card p:first-child {
          font-size: 17px !important;
        }
        .messages-page-light .message-thread-card p:last-child {
          font-size: 14px !important;
        }
      }
      .messages-page {
        width: min(100vw, 430px) !important;
        max-width: 430px !important;
        box-sizing: border-box !important;
      }
      .messages-topbar {
        padding-left: 14px !important;
        padding-right: 14px !important;
        padding-bottom: 9px !important;
      }
      .messages-logo-row {
        min-height: 40px !important;
        margin-bottom: 8px !important;
      }
      .messages-me-avatar > div:first-child {
        width: 34px !important;
        height: 34px !important;
        padding: 1.5px !important;
      }
      .messages-me-avatar > div:last-child {
        width: 9px !important;
        height: 9px !important;
      }
      .messages-logo-center img {
        max-height: 42px !important;
      }
      .messages-neon-wordmark {
        width: min(162px, 44vw) !important;
        height: 38px !important;
        font-size: 20px !important;
      }
      .messages-neon-wordmark::before,
      .messages-neon-wordmark::after {
        width: min(160px, 42vw) !important;
      }
      .messages-header-actions {
        gap: 7px !important;
      }
      .messages-filter-button,
      .messages-compose-button {
        width: 32px !important;
        height: 32px !important;
      }
      .messages-filter-button svg,
      .messages-compose-button svg {
        width: 16px !important;
        height: 16px !important;
      }
      .messages-title-row {
        margin-bottom: 9px !important;
      }
      .messages-title-row h2 {
        font-size: 19px !important;
        font-weight: 520 !important;
      }
      .messages-title-row span {
        font-size: 10px !important;
        padding: 3px 8px !important;
      }
      .messages-search-box {
        height: 40px !important;
        border-radius: 20px !important;
      }
      .messages-search-box input {
        font-size: 14px !important;
        padding-left: 40px !important;
      }
      .messages-search-box svg {
        width: 16px !important;
        height: 16px !important;
        left: 14px !important;
      }
      .messages-scan-button {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
      }
      .messages-active-card {
        padding: 12px 14px 10px !important;
      }
      .messages-active-card > div:first-child {
        margin-bottom: 10px !important;
      }
      .messages-active-card > div:first-child span:last-child {
        font-size: 13px !important;
      }
      .messages-active-card > div:first-child button {
        font-size: 12px !important;
      }
      .messages-active-card .overflow-x-auto {
        gap: 12px !important;
      }
      .messages-active-card [style*="width: 52px"] {
        width: 43px !important;
        height: 43px !important;
      }
      .messages-active-card [style*="width: 67px"] {
        width: 48px !important;
        height: 48px !important;
      }
      .messages-active-card button > span {
        width: 54px !important;
        font-size: 10px !important;
      }
      .messages-list {
        padding-left: 14px !important;
        padding-right: 14px !important;
      }
      .message-thread-card {
        min-height: 64px !important;
        margin-bottom: 8px !important;
        padding: 9px 11px !important;
        border-radius: 16px !important;
        gap: 10px !important;
      }
      .message-thread-card [style*="width: 42px"] {
        width: 36px !important;
        height: 36px !important;
      }
      .message-thread-card p:first-child {
        font-size: 13px !important;
      }
      .message-thread-card p:last-child {
        font-size: 11px !important;
      }
      .message-thread-card [style*="font-size: 10"] {
        font-size: 9px !important;
      }
      .message-thread-card [style*="min-width: 20px"] {
        min-width: 18px !important;
        height: 18px !important;
        font-size: 9px !important;
      }
      .messages-page-light .messages-topbar {
        padding: max(18px, env(safe-area-inset-top) + 8px) 14px 9px !important;
      }
      .messages-page-light .messages-logo-row {
        min-height: 44px !important;
        margin-bottom: 6px !important;
      }
      .messages-page-light .messages-me-avatar > div:first-child {
        width: 38px !important;
        height: 38px !important;
        padding: 2px !important;
      }
      .messages-page-light .messages-me-avatar > div:last-child {
        width: 10px !important;
        height: 10px !important;
      }
      .messages-page-light .messages-logo-center,
      .messages-page-light .messages-logo-row [style*="justify-content: center"] {
        transform: translate(-50%, -50%) !important;
      }
      .messages-page-light .messages-logo-center img,
      .messages-page-light .messages-logo-row [style*="justify-content: center"] img {
        max-height: 42px !important;
      }
      .messages-page-light .messages-neon-wordmark {
        width: min(170px, 45vw) !important;
        height: 40px !important;
        font-size: 21px !important;
      }
      .messages-page-light .messages-neon-wordmark::before,
      .messages-page-light .messages-neon-wordmark::after {
        width: min(168px, 43vw) !important;
      }
      .messages-page-light .messages-header-actions {
        gap: 7px !important;
      }
      .messages-page-light .messages-filter-button,
      .messages-page-light .messages-compose-button {
        width: 34px !important;
        height: 34px !important;
      }
      .messages-page-light .messages-filter-button svg,
      .messages-page-light .messages-compose-button svg {
        width: 17px !important;
        height: 17px !important;
      }
      .messages-page-light .messages-title-row {
        justify-content: space-between !important;
        margin: 0 0 10px !important;
      }
      .messages-page-light .messages-title-row h2 {
        font-size: 19px !important;
        font-weight: 520 !important;
      }
      .messages-page-light .messages-title-row span {
        margin-left: 0 !important;
        font-size: 10px !important;
        padding: 4px 9px !important;
      }
      .messages-page-light .messages-search-box {
        height: 42px !important;
        border-radius: 21px !important;
      }
      .messages-page-light .messages-search-box svg {
        width: 17px !important;
        height: 17px !important;
        left: 15px !important;
      }
      .messages-page-light .messages-search-box input {
        font-size: 14px !important;
        padding-left: 42px !important;
        padding-right: 46px !important;
      }
      .messages-page-light .messages-scan-button {
        right: 21px !important;
        width: 32px !important;
        height: 32px !important;
        min-width: 32px !important;
      }
      .messages-page-light .messages-scan-button svg {
        width: 19px !important;
        height: 19px !important;
      }
      .messages-page-light .messages-active-card {
        margin: 6px 14px 12px !important;
        padding: 13px 12px 11px !important;
        border-radius: 18px !important;
      }
      .messages-page-light .messages-active-card > div:first-child {
        margin-bottom: 10px !important;
      }
      .messages-page-light .messages-active-card > div:first-child span:last-child {
        font-size: 13px !important;
      }
      .messages-page-light .messages-active-card > div:first-child button {
        font-size: 12px !important;
      }
      .messages-page-light .messages-active-card .overflow-x-auto {
        gap: 12px !important;
      }
      .messages-page-light .messages-active-card [style*="width: 52px"] {
        width: 44px !important;
        height: 44px !important;
      }
      .messages-page-light .messages-active-card [style*="width: 67px"] {
        width: 48px !important;
        height: 48px !important;
      }
      .messages-page-light .messages-active-card button > span {
        width: 54px !important;
        font-size: 10px !important;
      }
      .messages-page-light .messages-list {
        padding: 0 14px 18px !important;
      }
      .messages-page-light .message-thread-card {
        min-height: 66px !important;
        margin-bottom: 8px !important;
        padding: 10px 12px !important;
        border-radius: 17px !important;
      }
      .messages-page-light .message-thread-card [style*="width: 42px"] {
        width: 38px !important;
        height: 38px !important;
      }
      .messages-page-light .message-thread-card p:first-child {
        font-size: 14px !important;
      }
      .messages-page-light .message-thread-card p:last-child {
        font-size: 12px !important;
      }
      .messages-page-light .message-thread-card [style*="font-size: 10"] {
        font-size: 10px !important;
      }
      .messages-page-light .message-thread-card [style*="min-width: 20px"] {
        min-width: 19px !important;
        height: 19px !important;
        font-size: 10px !important;
        border-width: 1px !important;
      }
      .message-thread-card {
        overflow: hidden !important;
        isolation: isolate;
      }
      .message-thread-card::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        opacity: .82;
        background:
          radial-gradient(circle at 92% 22%, rgba(255, 46, 147, .20), transparent 36%),
          radial-gradient(circle at 12% 78%, rgba(255, 106, 24, .13), transparent 34%),
          linear-gradient(110deg, rgba(255,255,255,.035), rgba(255,46,147,.055) 52%, rgba(164,44,255,.075));
      }
      .message-thread-card::after {
        content: "";
        position: absolute;
        inset: 1px;
        z-index: -1;
        border-radius: inherit;
        pointer-events: none;
        background: linear-gradient(105deg, rgba(255,255,255,.10), transparent 35%, rgba(255,106,24,.10));
        opacity: .52;
      }
      .message-thread-card:nth-of-type(3n + 1)::before {
        background:
          radial-gradient(circle at 88% 35%, rgba(255, 46, 147, .30), transparent 38%),
          radial-gradient(circle at 12% 78%, rgba(255, 170, 70, .18), transparent 35%),
          linear-gradient(105deg, rgba(255, 106, 24, .10), rgba(255, 46, 147, .12) 52%, rgba(164, 44, 255, .10));
      }
      .message-thread-card:nth-of-type(3n + 2)::before {
        background:
          radial-gradient(circle at 90% 20%, rgba(164, 44, 255, .24), transparent 36%),
          radial-gradient(circle at 8% 82%, rgba(255, 46, 147, .16), transparent 34%),
          linear-gradient(105deg, rgba(164,44,255,.08), rgba(255,46,147,.10), rgba(255,106,24,.07));
      }
      .message-thread-card:nth-of-type(3n)::before {
        background:
          radial-gradient(circle at 92% 24%, rgba(255, 106, 24, .22), transparent 37%),
          radial-gradient(circle at 10% 82%, rgba(255, 46, 147, .13), transparent 34%),
          linear-gradient(105deg, rgba(255,255,255,.04), rgba(255,106,24,.08), rgba(164,44,255,.08));
      }
      .message-thread-card.is-unread {
        box-shadow: 0 10px 24px rgba(255, 46, 147, .18), inset 0 1px 0 rgba(255,255,255,.10) !important;
      }
      .messages-page-light .message-thread-card {
        background:
          radial-gradient(circle at 90% 24%, rgba(255, 46, 147, .20), transparent 38%),
          radial-gradient(circle at 10% 78%, rgba(255, 106, 24, .12), transparent 34%),
          linear-gradient(110deg, rgba(255,255,255,.72), rgba(255,232,247,.62) 52%, rgba(238,227,255,.70)) !important;
        box-shadow: 0 12px 26px rgba(164, 44, 255, .10), 0 8px 22px rgba(255, 46, 147, .08), inset 0 1px rgba(255,255,255,.86) !important;
      }
      .messages-page-light .message-thread-card:nth-of-type(3n + 1) {
        background:
          radial-gradient(circle at 88% 38%, rgba(255, 46, 147, .34), transparent 38%),
          radial-gradient(circle at 12% 80%, rgba(255, 184, 92, .24), transparent 35%),
          linear-gradient(105deg, rgba(255,247,224,.78), rgba(255,201,157,.54) 38%, rgba(255, 80, 174, .46)) !important;
      }
      .messages-page-light .message-thread-card:nth-of-type(3n + 2) {
        background:
          radial-gradient(circle at 88% 20%, rgba(164, 44, 255, .24), transparent 37%),
          radial-gradient(circle at 12% 82%, rgba(255, 46, 147, .12), transparent 34%),
          linear-gradient(110deg, rgba(255,255,255,.70), rgba(255,225,249,.62) 48%, rgba(229,221,255,.74)) !important;
      }
      .messages-page-light .message-thread-card:nth-of-type(3n) {
        background:
          radial-gradient(circle at 90% 22%, rgba(255, 137, 52, .18), transparent 36%),
          radial-gradient(circle at 12% 80%, rgba(255, 46, 147, .10), transparent 34%),
          linear-gradient(110deg, rgba(255,255,255,.72), rgba(255,238,241,.62) 52%, rgba(246,232,255,.70)) !important;
      }
      .messages-page-light .message-thread-card.is-unread {
        box-shadow: 0 12px 28px rgba(242, 68, 155, .16), 0 8px 24px rgba(255, 106, 24, .10), inset 0 1px rgba(255,255,255,.82) !important;
      }
    `}</style>
    <BottomNavEnhanced />
    </>
  );
}
