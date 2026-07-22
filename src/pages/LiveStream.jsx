import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { 
  Mic, MicOff, Video, VideoOff, X, AlertTriangle, Save, Trash2, 
  FlipHorizontal, Send, Share2, Users, Tag, Gift, RotateCw,
  Eye, Heart, MessageCircle, ShieldCheck, MoreHorizontal, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GIFTS = [
  { id: 'heart', emoji: '❤️', name: 'Heart', coins: 10 },
  { id: 'fire', emoji: '🔥', name: 'Fire', coins: 25 },
  { id: 'star', emoji: '⭐', name: 'Star', coins: 50 },
  { id: 'crown', emoji: '👑', name: 'Crown', coins: 100 },
  { id: 'diamond', emoji: '💎', name: 'Diamond', coins: 200 },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', coins: 500 },
];

const LIVE_REFERENCE_CHAT = [
  { id: 'joined', type: 'join', user: 'Ardit', text: 'joined', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces' },
  { id: 'valon', type: 'msg', user: 'Valon Dervishi', text: 'Amazing view! 😍', verified: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces' },
  { id: 'elira', type: 'msg', user: 'Elira', text: 'Where is this? Looks incredible 🌅', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces' },
  { id: 'leonard', type: 'msg', user: 'Leonard', text: 'So beautiful! 🔥🔥🔥', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces' },
  { id: 'diana', type: 'gift', user: 'Diana', text: 'sent a Heart ❤️', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces' },
];

const LIVE_REFERENCE_COHOSTS = [
  { name: 'Valon', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces' },
  { name: 'Ardian', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces' },
  { name: 'Elira', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces' },
  { name: 'Leonard', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces' },
];

export default function LiveStream() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const liveSessionIdRef = useRef(null);

  const [phase, setPhase] = useState('preview'); // 'preview' | 'live'
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [duration, setDuration] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Live details
  const [streamTitle, setStreamTitle] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [giftCount, setGiftCount] = useState(0);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);

  // Panels
  const [activePanel, setActivePanel] = useState(null); // 'gifts' | 'tag' | 'invite' | null
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [invitedFriends, setInvitedFriends] = useState([]);

  // Group video (co-hosts)
  const [coHosts, setCoHosts] = useState([]);
  const [coHostInput, setCoHostInput] = useState('');

  // Floating gifts
  const [floatingGifts, setFloatingGifts] = useState([]);

  // Modals
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Load user ──
  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      base44.entities.UserProfile.filter({ user_id: u.id }, '-created_date', 1)
        .then(r => { if (r[0]) setUserProfile(r[0]); })
        .catch(() => {});
    }).catch(() => {});
  }, []);

  // ── Start camera on mount ──
  useEffect(() => {
    startCamera('user');
    return () => {
      stopAllTracks();
      clearInterval(timerRef.current);
    };
  }, []);

  // ── Attach stream to video whenever both are ready ──
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraReady]);

  // ── Auto-scroll chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Fake viewer count growing ──
  useEffect(() => {
    if (phase !== 'live') return;
    const iv = setInterval(() => setViewerCount(v => v + Math.floor(Math.random() * 2)), 10000);
    return () => clearInterval(iv);
  }, [phase]);

  const startCamera = async (facing) => {
    stopAllTracks();
    setCameraError('');
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      // Attach immediately if video element already exists
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  const stopAllTracks = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const flipCamera = async () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    await startCamera(next);
  };

  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMuted(!track.enabled); }
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOff(!track.enabled); }
  };

  const goLive = async () => {
    if (!cameraReady || !streamRef.current) return;
    let user = currentUser;
    if (!user) { try { user = await base44.auth.me(); setCurrentUser(user); } catch {} }
    if (!user) { setCameraError('Could not load account. Try again.'); return; }

    setPhase('live');
    setDuration(0);
    setViewerCount(1);
    chunksRef.current = [];
    setChatMessages([{ id: Date.now(), type: 'system', text: '🔴 Live stream started!' }]);

    // Start recording
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus'
        : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';
      const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start(1000);
    } catch (e) { console.warn('MediaRecorder not supported:', e); }

    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);

    const profile = userProfile;
    base44.entities.LiveSession.create({
      broadcaster_id: user.id,
      broadcaster_name: profile?.full_name || user.full_name || 'User',
      broadcaster_username: profile?.username || user.email?.split('@')[0] || 'user',
      broadcaster_avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=ff5500&color=fff&size=128`,
      title: streamTitle.trim() || 'Live Stream',
      status: 'active',
      viewer_count: 1,
      started_at: new Date().toISOString(),
      thumbnail_url: profile?.avatar_url || null,
    }).then(s => { if (s?.id) liveSessionIdRef.current = s.id; }).catch(() => {});

    base44.functions.invoke('notifyLiveStart', {
      broadcaster_id: user.id,
      broadcaster_name: profile?.full_name || user.full_name,
      broadcaster_avatar: profile?.avatar_url,
    }).catch(() => {});
  };

  const stopStreaming = () => {
    clearInterval(timerRef.current);
    try { if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current.stop(); } catch {}
    setShowEndModal(false);
    if (chunksRef.current.length > 0) {
      setShowSaveModal(true);
      // Keep phase as 'live' so camera stays visible behind modal
    } else {
      setPhase('preview');
      discardReplay();
    }
  };

  const saveReplay = async () => {
    setIsSaving(true);
    // Fetch latest profile to ensure username is correct
    let profile = userProfile;
    if (!profile && currentUser) {
      try {
        const r = await base44.entities.UserProfile.filter({ user_id: currentUser.id }, '-created_date', 1);
        if (r[0]) { profile = r[0]; setUserProfile(r[0]); }
      } catch {}
    }
    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `live-${Date.now()}.webm`, { type: 'video/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const authorUsername = profile?.username || currentUser.full_name?.toLowerCase().replace(/\s+/g, '_') || currentUser.email?.split('@')[0] || 'user';
      const authorName = profile?.full_name || currentUser.full_name || 'User';
      const authorAvatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=ff5500&color=fff&size=128`;
      const post = await base44.entities.Post.create({
        author_id: currentUser.id,
        author_name: authorName,
        author_username: authorUsername,
        author_avatar: authorAvatar,
        caption: streamTitle || 'Live Replay',
        post_type: 'reel',
        video_url: file_url,
      });
      if (liveSessionIdRef.current) {
        await base44.entities.LiveSession.update(liveSessionIdRef.current, {
          status: 'ended', ended_at: new Date().toISOString(),
          replay_url: file_url, replay_post_id: post.id,
        });
      }
      stopAllTracks();
      setShowSaveModal(false);
      navigate('/reels');
    } catch {
      setIsSaving(false);
      setCameraError('Failed to save replay. Please try again.');
      setShowSaveModal(false);
    }
  };

  const discardReplay = async () => {
    try {
      if (liveSessionIdRef.current)
        await base44.entities.LiveSession.update(liveSessionIdRef.current, { status: 'ended', ended_at: new Date().toISOString() });
    } catch {}
    stopAllTracks();
    setShowSaveModal(false);
    navigate('/');
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const name = userProfile?.username || currentUser?.full_name || 'You';
    setChatMessages(prev => [...prev, { id: Date.now(), type: 'msg', user: name, text: chatInput.trim(), isMe: true }]);
    setChatInput('');
  };

  const sendGift = (gift) => {
    const name = userProfile?.username || currentUser?.full_name || 'You';
    const id = Date.now();
    setFloatingGifts(prev => [...prev, { ...gift, id }]);
    setGiftCount(c => c + 1);
    setChatMessages(prev => [...prev, { id, type: 'gift', user: name, emoji: gift.emoji, name: gift.name }]);
    setActivePanel(null);
    setTimeout(() => setFloatingGifts(prev => prev.filter(g => g.id !== id)), 2500);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const tag = tagInput.trim().startsWith('@') ? tagInput.trim() : '@' + tagInput.trim();
    if (!taggedUsers.includes(tag)) setTaggedUsers(prev => [...prev, tag]);
    setTagInput('');
  };

  const addInvite = () => {
    if (!inviteInput.trim()) return;
    const name = inviteInput.trim().startsWith('@') ? inviteInput.trim() : '@' + inviteInput.trim();
    if (!invitedFriends.includes(name)) setInvitedFriends(prev => [...prev, name]);
    setInviteInput('');
  };

  const addCoHost = () => {
    if (!coHostInput.trim()) return;
    const name = coHostInput.trim().startsWith('@') ? coHostInput.trim() : '@' + coHostInput.trim();
    if (!coHosts.includes(name)) setCoHosts(prev => [...prev, name]);
    setCoHostInput('');
  };

  const shareStream = () => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: streamTitle || 'Live Stream', url }); }
    else { navigator.clipboard.writeText(url).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }); }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const displayName = userProfile?.full_name || currentUser?.full_name || 'Vlora Dervishi';
  const displayHandle = userProfile?.username || currentUser?.email?.split('@')[0] || 'vlora.d';
  const displayAvatar = userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff5500&color=fff&size=128`;
  const liveViewerLabel = viewerCount > 999 ? `${(viewerCount / 1000).toFixed(1)}K` : (viewerCount || 2400).toLocaleString();
  const liveChatFeed = [
    ...LIVE_REFERENCE_CHAT,
    ...chatMessages.filter(m => m.type !== 'system').slice(-3).map(m => ({
      id: m.id,
      type: m.type,
      user: m.user,
      text: m.type === 'gift' ? `sent ${m.name} ${m.emoji}` : m.text,
      verified: m.isMe,
      avatar: displayAvatar,
    })),
  ].slice(-5);

  return (
    <div className="fixed inset-0 bg-black" data-prevent-light-mode="true">

      {/* ── CAMERA PREVIEW with photo background ── */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #16082a 50%, #0f0518 100%)' }}>
        {/* Camera icon pattern background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'%3E%3C/path%3E%3Ccircle cx='12' cy='13' r='4'%3E%3C/circle%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
          backgroundRepeat: 'repeat'
        }} />
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />

      {/* Loading spinner */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-orange-500 animate-spin" />
          <p className="absolute mt-20 text-white/50 text-sm">Starting camera...</p>
        </div>
      )}

      {/* Camera error */}
      {cameraError && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4 z-10 px-8">
          <AlertTriangle className="w-12 h-12 text-orange-400" />
          <p className="text-white text-center text-sm">{cameraError}</p>
          <button onClick={() => { setCameraError(''); startCamera(facingMode); }}
            className="px-6 py-3 rounded-full text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
            Try Again
          </button>
          <button onClick={() => navigate(-1)} className="text-white/50 text-sm">Go Back</button>
        </div>
      )}

      {/* Gradients */}
      <div className="absolute inset-x-0 top-0 h-44 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />

      {/* ── HEADER ── */}
      <div className="absolute top-0 inset-x-0 z-30 px-4"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          {/* Back button */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { console.log('BACK BUTTON CLICKED'); navigate('/'); }}
            className="w-10 h-10 rounded-full flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}>
            <X className="w-5 h-5 text-white" />
          </motion.button>
          {/* Center: LIVE badge + timer + viewers */}
          {phase === 'live' && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: 'rgba(220,30,30,0.9)' }}>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white text-xs font-bold tracking-widest">LIVE</span>
              </div>
              <span className="text-white font-mono text-sm font-bold">{fmt(duration)}</span>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <Users className="w-3 h-3 text-white/70" />
                <span className="text-white text-xs font-bold">{viewerCount}</span>
              </div>
              {giftCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(233,30,140,0.45)' }}>
                  <span className="text-xs">🎁</span>
                  <span className="text-white text-xs font-bold">{giftCount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stream title + tags (during live) */}
        {phase === 'live' && (streamTitle || taggedUsers.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1 items-center justify-center">
            {streamTitle && (
              <span className="text-white text-xs font-bold px-4 py-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 2px 16px rgba(255,85,0,0.5), 0 0 24px rgba(233,30,140,0.3)' }}>
                {streamTitle}
              </span>
            )}
            {taggedUsers.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                style={{ background: 'rgba(255,80,0,0.4)' }}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── PRE-LIVE: Setup Panel ── */}
      {phase === 'preview' && cameraReady && (
        <div className="absolute z-30 left-4 right-4" style={{ top: '18%' }}>
          {/* Title */}
          <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p className="text-white/50 text-xs font-bold mb-2 tracking-wider">STREAM TITLE</p>
            <input
              value={streamTitle}
              onChange={e => setStreamTitle(e.target.value)}
              placeholder="What are you streaming today?"
              maxLength={60}
              className="w-full bg-transparent text-white text-sm outline-none placeholder-white/30"
              style={{ caretColor: '#ff5500' }}
            />
          </div>



          {/* Quick action buttons row */}
          <div className="flex gap-2 flex-wrap">
            {/* Invite Friends */}
            <button onClick={() => setActivePanel(p => p === 'invite' ? null : 'invite')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-semibold"
              style={{ background: activePanel === 'invite' ? 'rgba(255,80,0,0.5)' : 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Users className="w-3.5 h-3.5" /> Invite Friends
              {invitedFriends.length > 0 && <span className="bg-orange-500 text-white text-[9px] rounded-full px-1.5">{invitedFriends.length}</span>}
            </button>

            {/* Tag People */}
            <button onClick={() => setActivePanel(p => p === 'tag' ? null : 'tag')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-semibold"
              style={{ background: activePanel === 'tag' ? 'rgba(100,80,255,0.5)' : 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Tag className="w-3.5 h-3.5" /> Tag People
              {taggedUsers.length > 0 && <span className="bg-purple-500 text-white text-[9px] rounded-full px-1.5">{taggedUsers.length}</span>}
            </button>

            {/* Group Video */}
            <button onClick={() => setActivePanel(p => p === 'cohost' ? null : 'cohost')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-semibold"
              style={{ background: activePanel === 'cohost' ? 'rgba(34,197,94,0.5)' : 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Video className="w-3.5 h-3.5" /> Group Video
              {coHosts.length > 0 && <span className="bg-green-500 text-white text-[9px] rounded-full px-1.5">{coHosts.length}</span>}
            </button>

            {/* Share */}
            <button onClick={shareStream}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* Invite Friends Panel */}
          {activePanel === 'invite' && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-2xl p-3" style={{ background: 'rgba(10,3,22,0.97)', border: '1px solid rgba(255,80,0,0.3)' }}>
              <p className="text-white font-bold text-xs mb-2">👥 Invite Friends to Watch</p>
              <div className="flex gap-2 mb-2">
                <input value={inviteInput} onChange={e => setInviteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addInvite()}
                  placeholder="@username"
                  className="flex-1 text-xs text-white outline-none px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <button onClick={addInvite}
                  className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>Invite</button>
              </div>
              {invitedFriends.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {invitedFriends.map(f => (
                    <div key={f} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,80,0,0.3)', border: '1px solid rgba(255,80,0,0.4)' }}>
                      <span className="text-white text-xs">{f}</span>
                      <button onClick={() => setInvitedFriends(p => p.filter(x => x !== f))}><X className="w-3 h-3 text-white/50" /></button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tag Panel (pre-live) */}
          {activePanel === 'tag' && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-2xl p-3" style={{ background: 'rgba(10,3,22,0.97)', border: '1px solid rgba(100,80,255,0.3)' }}>
              <p className="text-white font-bold text-xs mb-2">🏷️ Tag People</p>
              <div className="flex gap-2 mb-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="@username"
                  className="flex-1 text-xs text-white outline-none px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <button onClick={addTag}
                  className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #6050ff, #e91e8c)' }}>Add</button>
              </div>
              {taggedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {taggedUsers.map(tag => (
                    <div key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(100,80,255,0.3)', border: '1px solid rgba(100,80,255,0.4)' }}>
                      <span className="text-white text-xs">{tag}</span>
                      <button onClick={() => setTaggedUsers(p => p.filter(t => t !== tag))}><X className="w-3 h-3 text-white/50" /></button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Group Video / Co-host Panel (pre-live) */}
          {activePanel === 'cohost' && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2 rounded-2xl p-3" style={{ background: 'rgba(10,3,22,0.97)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <p className="text-white font-bold text-xs mb-1">🎥 Group Video (Add Co-hosts)</p>
              <p className="text-white/40 text-[10px] mb-2">Invite others to appear on camera with you</p>
              <div className="flex gap-2 mb-2">
                <input value={coHostInput} onChange={e => setCoHostInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCoHost()}
                  placeholder="@username"
                  className="flex-1 text-xs text-white outline-none px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <button onClick={addCoHost}
                  className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>Add</button>
              </div>
              {coHosts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {coHosts.map(h => (
                    <div key={h} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.3)', border: '1px solid rgba(34,197,94,0.4)' }}>
                      <span className="text-white text-xs">{h}</span>
                      <button onClick={() => setCoHosts(p => p.filter(x => x !== h))}><X className="w-3 h-3 text-white/50" /></button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* ── FLOATING GIFTS ── */}
      {floatingGifts.map(g => (
        <motion.div key={g.id}
          initial={{ opacity: 1, y: 0, x: 20, scale: 0.5 }}
          animate={{ opacity: 0, y: -220, scale: 1.8 }}
          transition={{ duration: 2.4, ease: 'easeOut' }}
          className="absolute right-16 bottom-40 text-4xl pointer-events-none z-50">
          {g.emoji}
        </motion.div>
      ))}

      {/* ── COPY SUCCESS TOAST ── */}
      <AnimatePresence>
        {copySuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full"
            style={{ background: 'rgba(34,197,94,0.9)' }}>
            <span className="text-white text-sm font-bold">Link copied!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'live' && (
        <div className="spicey-live-ref">
          <div className="spicey-live-ref-top">
            <div className="spicey-live-ref-brand">
              <span className="spicey-live-ref-mark">S</span>
              <span>SPICEY<sup>+</sup></span>
            </div>
            <div className="spicey-live-ref-status">
              <span className="spicey-live-ref-live">LIVE</span>
              <span className="spicey-live-ref-viewers"><Eye size={15} /> {liveViewerLabel}</span>
            </div>
            <button className="spicey-live-ref-close" onClick={() => setShowEndModal(true)} aria-label="End live">
              <X size={25} />
            </button>
          </div>

          <div className="spicey-live-ref-host">
            <img src={displayAvatar} alt={displayName} />
            <div>
              <div className="spicey-live-ref-host-name">
                {displayName}
                <span className="spicey-live-ref-verify">✓</span>
              </div>
              <div className="spicey-live-ref-host-state"><span /> Live now</div>
            </div>
          </div>

          <div className="spicey-live-ref-tools">
            <button onClick={toggleCamera} aria-label="Camera">
              {cameraOff ? <VideoOff size={19} /> : <ShieldCheck size={20} />}
            </button>
            <button onClick={() => setActivePanel(p => p === 'invite' ? null : 'invite')} aria-label="More">
              <MoreHorizontal size={21} />
            </button>
          </div>

          <div className="spicey-live-ref-comments">
            {liveChatFeed.map(msg => (
              <motion.div key={msg.id} className={`spicey-live-ref-comment ${msg.type === 'join' ? 'is-join' : ''}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <img src={msg.avatar} alt="" />
                <div>
                  <strong>{msg.user}</strong>
                  {msg.verified && <span className="spicey-live-ref-mini-verify">✓</span>}
                  <span>{msg.text}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="spicey-live-ref-rail">
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => sendGift(GIFTS[0])}>
              <Heart size={27} fill="currentColor" />
            </motion.button>
            <span>12.4K</span>
            <button onClick={() => setShowChat(c => !c)}>
              <MessageCircle size={27} />
            </button>
            <span>512</span>
            <button onClick={shareStream}>
              <Share2 size={26} fill="currentColor" />
            </button>
            <span>Share</span>
            <button onClick={() => sendGift(GIFTS[0])} className="is-gift">
              <Gift size={25} />
            </button>
            <span>Gift</span>
          </div>

          <div className="spicey-live-ref-cohost">
            <div className="spicey-live-ref-cohost-title">★ Co-host ›</div>
            <div className="spicey-live-ref-cohost-row">
              <button className="spicey-live-ref-invite" onClick={() => setActivePanel('invite')}>
                <Plus size={30} />
                <span>Invite</span>
              </button>
              {LIVE_REFERENCE_COHOSTS.map(host => (
                <button key={host.name} className="spicey-live-ref-person" onClick={() => setCoHosts(prev => prev.includes('@' + host.name) ? prev : [...prev, '@' + host.name])}>
                  <img src={host.avatar} alt={host.name} />
                  <span>{host.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="spicey-live-ref-composer">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Send a message..." />
            <button className="is-send" onClick={sendChat}><Send size={23} fill="currentColor" /></button>
            <button onClick={() => sendGift(GIFTS[0])}><Gift size={22} /></button>
            <button onClick={shareStream}><Share2 size={22} /></button>
            <button className="is-follow">Follow</button>
          </div>

          <div className="spicey-live-ref-camera-mini">
            <button onClick={toggleMute}>{isMuted ? <MicOff size={17} /> : <Mic size={17} />}</button>
            <button onClick={flipCamera}><RotateCw size={17} /></button>
          </div>
        </div>
      )}

      {/* ── LIVE: CHAT ── */}
      {false && phase === 'live' && showChat && (
        <div className="absolute left-3 z-30 flex flex-col" style={{ bottom: 110, width: '68%' }}>
          <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1"
            style={{ maskImage: 'linear-gradient(to bottom, transparent, black 25%)' }}>
            {chatMessages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                {msg.type === 'system' ? (
                  <span className="text-xs text-yellow-300 font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>{msg.text}</span>
                ) : msg.type === 'gift' ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(233,30,140,0.5)', color: 'white' }}>
                    🎁 <span style={{ color: '#ffaaee' }}>{msg.user}</span> sent {msg.emoji} {msg.name}!
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.55)', color: 'white' }}>
                    <span className="font-bold" style={{ color: msg.isMe ? '#ff8844' : '#cc88ff' }}>{msg.user}: </span>
                    {msg.text}
                  </span>
                )}
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {/* Chat input */}
          <div className="flex items-center gap-2 mt-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Say something..."
              className="flex-1 text-xs text-white outline-none px-3 py-2 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
            />
            <button onClick={sendChat}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── LIVE: RIGHT SIDE ACTIONS ── */}
      {false && phase === 'live' && (
        <div className="absolute right-3 z-30 flex flex-col gap-2.5" style={{ bottom: 130, maxHeight: '65vh', overflowY: 'auto' }}>
          {/* Chat toggle */}
          <button onClick={() => setShowChat(c => !c)}
            className="w-11 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
            style={{ background: showChat ? 'rgba(255,80,0,0.45)' : 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Send className="w-4 h-4 text-white" />
            <span className="text-[8px] text-white/70">Chat</span>
          </button>

          {/* GIFT BUTTONS — Always visible */}
          {GIFTS.map(gift => (
            <motion.button key={gift.id} onClick={() => sendGift(gift)} whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-full text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="text-sm">{gift.emoji}</span>
              <span className="text-[7px]">{gift.coins}</span>
            </motion.button>
          ))}

          {/* Tag */}
          <button onClick={() => setActivePanel(p => p === 'tag' ? null : 'tag')}
            className="w-11 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
            style={{ background: activePanel === 'tag' ? 'rgba(100,80,255,0.55)' : 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Tag className="w-4 h-4 text-white" />
            <span className="text-[8px] text-white/70">Tag</span>
          </button>

          {/* Add Person (invite during live) */}
          <button onClick={() => setActivePanel(p => p === 'invite' ? null : 'invite')}
            className="w-11 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
            style={{ background: activePanel === 'invite' ? 'rgba(255,80,0,0.55)' : 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Users className="w-4 h-4 text-white" />
            <span className="text-[8px] text-white/70">Add</span>
          </button>

          {/* Share */}
          <button onClick={shareStream}
            className="w-11 h-11 rounded-full flex flex-col items-center justify-center gap-0.5 flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Share2 className="w-4 h-4 text-white" />
            <span className="text-[8px] text-white/70">Share</span>
          </button>
        </div>
      )}



      {/* ── INVITE PANEL (during live) ── */}
      <AnimatePresence>
        {false && activePanel === 'invite' && phase === 'live' && (
          <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
            className="absolute z-40 rounded-2xl p-4"
            style={{ bottom: 130, left: 12, right: 56, background: 'rgba(10,3,22,0.97)', border: '1px solid rgba(255,80,0,0.3)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">👥 Add Person / Invite</p>
              <button onClick={() => setActivePanel(null)}><X className="w-4 h-4 text-white/40" /></button>
            </div>
            <div className="flex gap-2 mb-3">
              <input value={inviteInput} onChange={e => setInviteInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addInvite()}
                placeholder="@username to invite"
                className="flex-1 text-sm text-white outline-none px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              <button onClick={addInvite}
                className="px-3 py-2 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>Invite</button>
            </div>
            {invitedFriends.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {invitedFriends.map(f => (
                  <div key={f} className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,80,0,0.3)', border: '1px solid rgba(255,80,0,0.4)' }}>
                    <span className="text-white text-xs">{f}</span>
                    <button onClick={() => setInvitedFriends(p => p.filter(x => x !== f))}><X className="w-3 h-3 text-white/50" /></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TAG PANEL ── */}
      <AnimatePresence>
        {false && activePanel === 'tag' && phase === 'live' && (
          <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
            className="absolute z-40 rounded-2xl p-4"
            style={{ bottom: 130, left: 12, right: 56, background: 'rgba(10,3,22,0.97)', border: '1px solid rgba(100,80,255,0.3)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">🏷️ Tag People</p>
              <button onClick={() => setActivePanel(null)}><X className="w-4 h-4 text-white/40" /></button>
            </div>
            <div className="flex gap-2 mb-3">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="@username"
                className="flex-1 text-sm text-white outline-none px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              <button onClick={addTag}
                className="px-3 py-2 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #6050ff, #e91e8c)' }}>Add</button>
            </div>
            {taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {taggedUsers.map(tag => (
                  <div key={tag} className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: 'rgba(100,80,255,0.3)', border: '1px solid rgba(100,80,255,0.4)' }}>
                    <span className="text-white text-xs">{tag}</span>
                    <button onClick={() => setTaggedUsers(p => p.filter(t => t !== tag))}>
                      <X className="w-3 h-3 text-white/50" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM CONTROLS ── */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-4"
        style={{ paddingBottom: 'max(36px, env(safe-area-inset-bottom) + 24px)' }}>

        {phase !== 'live' && (
          <>
            <motion.button whileTap={{ scale: 0.9 }} onClick={flipCamera}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <RotateCw className="w-5 h-5 text-white" />
            </motion.button>

            <motion.button whileTap={{ scale: 0.94 }} onClick={goLive} disabled={!cameraReady}
              className="px-14 py-4 rounded-full text-white font-bold text-xl disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                boxShadow: cameraReady ? '0 0 35px rgba(255,80,0,0.7), 0 0 70px rgba(233,30,140,0.4)' : 'none',
              }}>
              🔴 Go Live
            </motion.button>
          </>
        )}
      </div>

      <style>{`
        .spicey-live-ref {
          position: absolute;
          inset: 0;
          z-index: 34;
          color: #fff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          pointer-events: none;
        }
        .spicey-live-ref::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(4, 2, 12, .72) 0%, rgba(4, 2, 12, .12) 24%, rgba(4, 2, 12, .1) 52%, rgba(4, 2, 12, .86) 100%),
            radial-gradient(circle at 72% 20%, rgba(255, 92, 0, .2), transparent 34%),
            radial-gradient(circle at 16% 74%, rgba(226, 31, 129, .18), transparent 32%);
        }
        .spicey-live-ref button,
        .spicey-live-ref input {
          pointer-events: auto;
        }
        .spicey-live-ref-top {
          position: absolute;
          left: 26px;
          right: 22px;
          top: max(24px, env(safe-area-inset-top) + 12px);
          display: grid;
          grid-template-columns: 1fr auto 36px;
          align-items: center;
          gap: 10px;
        }
        .spicey-live-ref-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          color: #ff385f;
          font-weight: 900;
          font-size: clamp(22px, 6.6vw, 36px);
          font-style: italic;
          letter-spacing: .02em;
          text-shadow: 0 0 12px rgba(255, 75, 40, .55), 0 0 22px rgba(226, 31, 129, .42);
        }
        .spicey-live-ref-brand sup {
          font-style: normal;
          font-size: .55em;
          color: #ff2a87;
          margin-left: 1px;
        }
        .spicey-live-ref-mark {
          display: inline-grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 12px;
          background: linear-gradient(145deg, #ff7c11, #ff245f 48%, #bb20ff);
          color: #fff;
          box-shadow: 0 8px 22px rgba(255, 53, 95, .32);
          transform: skewX(-10deg);
        }
        .spicey-live-ref-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .spicey-live-ref-live,
        .spicey-live-ref-viewers {
          height: 38px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .spicey-live-ref-live {
          min-width: 74px;
          padding: 0 17px;
          background: linear-gradient(135deg, #ff7a18, #ff235d 58%, #d91cc8);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 10px 26px rgba(255, 39, 92, .32);
          font-size: 16px;
          font-weight: 850;
        }
        .spicey-live-ref-viewers {
          min-width: 88px;
          gap: 7px;
          padding: 0 12px;
          background: rgba(15, 10, 27, .42);
          color: rgba(255,255,255,.9);
          font-size: 16px;
          font-weight: 760;
        }
        .spicey-live-ref-close {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          color: #fff;
          background: transparent;
        }
        .spicey-live-ref-host {
          position: absolute;
          left: 28px;
          top: max(114px, env(safe-area-inset-top) + 98px);
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .spicey-live-ref-host img {
          width: 62px;
          height: 62px;
          border-radius: 999px;
          object-fit: cover;
          border: 3px solid transparent;
          background: linear-gradient(135deg, #ff7a18, #ff2c77, #a823ff) border-box;
          box-shadow: 0 0 0 2px rgba(255,255,255,.18), 0 12px 26px rgba(0,0,0,.35);
        }
        .spicey-live-ref-host-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: clamp(24px, 6.2vw, 34px);
          line-height: 1;
          font-weight: 850;
          text-shadow: 0 2px 12px rgba(0,0,0,.5);
        }
        .spicey-live-ref-verify,
        .spicey-live-ref-mini-verify {
          display: inline-grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(135deg, #8e2cff, #ad32ff);
          border-radius: 999px;
          font-weight: 900;
        }
        .spicey-live-ref-verify {
          width: 24px;
          height: 24px;
          font-size: 15px;
        }
        .spicey-live-ref-mini-verify {
          width: 14px;
          height: 14px;
          margin: 0 4px;
          font-size: 9px;
        }
        .spicey-live-ref-host-state {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
          color: rgba(255,255,255,.86);
          font-size: 18px;
        }
        .spicey-live-ref-host-state span {
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background: #24e943;
          box-shadow: 0 0 12px rgba(36, 233, 67, .65);
        }
        .spicey-live-ref-tools {
          position: absolute;
          right: 26px;
          top: max(146px, env(safe-area-inset-top) + 128px);
          display: flex;
          gap: 16px;
        }
        .spicey-live-ref-tools button,
        .spicey-live-ref-rail button,
        .spicey-live-ref-camera-mini button {
          display: grid;
          place-items: center;
          border-radius: 999px;
          color: #fff;
          background: rgba(34, 25, 50, .48);
          border: 1px solid rgba(255,255,255,.2);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 12px 30px rgba(0,0,0,.22);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }
        .spicey-live-ref-tools button {
          width: 56px;
          height: 56px;
        }
        .spicey-live-ref-comments {
          position: absolute;
          left: 26px;
          bottom: max(245px, env(safe-area-inset-bottom) + 228px);
          width: min(64vw, 315px);
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .spicey-live-ref-comment {
          width: fit-content;
          max-width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 13px 7px 7px;
          border-radius: 18px;
          background: linear-gradient(90deg, rgba(30, 22, 38, .68), rgba(80, 34, 28, .34));
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 10px 26px rgba(0,0,0,.2);
          backdrop-filter: blur(13px);
          -webkit-backdrop-filter: blur(13px);
        }
        .spicey-live-ref-comment.is-join {
          border-color: rgba(255,255,255,.18);
          background: rgba(37, 33, 54, .52);
        }
        .spicey-live-ref-comment img {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          object-fit: cover;
          border: 2px solid rgba(255, 46, 122, .8);
        }
        .spicey-live-ref-comment div {
          min-width: 0;
          color: #fff;
          font-size: 14px;
          line-height: 1.24;
          text-shadow: 0 1px 7px rgba(0,0,0,.35);
        }
        .spicey-live-ref-comment strong {
          color: #ff4c86;
          margin-right: 5px;
          font-weight: 850;
        }
        .spicey-live-ref-comment span {
          color: rgba(255,255,255,.94);
        }
        .spicey-live-ref-rail {
          position: absolute;
          right: 24px;
          bottom: max(236px, env(safe-area-inset-bottom) + 220px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #fff;
          text-shadow: 0 2px 10px rgba(0,0,0,.45);
          font-size: 15px;
          font-weight: 820;
        }
        .spicey-live-ref-rail button {
          width: 56px;
          height: 56px;
        }
        .spicey-live-ref-rail button:first-child {
          color: #ff425f;
          background: rgba(38, 28, 47, .42);
        }
        .spicey-live-ref-rail .is-gift {
          color: #ffb121;
          background: linear-gradient(145deg, rgba(255, 117, 24, .28), rgba(226, 31, 129, .24));
          border-color: rgba(255, 113, 24, .26);
        }
        .spicey-live-ref-cohost {
          position: absolute;
          left: 22px;
          right: 22px;
          bottom: max(108px, env(safe-area-inset-bottom) + 98px);
          padding: 15px 16px 14px;
          border-radius: 25px;
          border: 1px solid rgba(255,255,255,.09);
          background: linear-gradient(180deg, rgba(15, 11, 28, .74), rgba(8, 6, 18, .58));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 18px 38px rgba(0,0,0,.28);
        }
        .spicey-live-ref-cohost-title {
          margin-bottom: 12px;
          color: rgba(255,255,255,.92);
          font-size: 15px;
          font-weight: 820;
        }
        .spicey-live-ref-cohost-row {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          align-items: start;
          gap: 12px;
        }
        .spicey-live-ref-invite,
        .spicey-live-ref-person {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: #fff;
          font-size: 12px;
          min-width: 0;
        }
        .spicey-live-ref-invite svg {
          width: 56px;
          height: 56px;
          padding: 13px;
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,.28);
          background: rgba(0,0,0,.22);
        }
        .spicey-live-ref-person img {
          width: 58px;
          height: 58px;
          border-radius: 999px;
          object-fit: cover;
          border: 3px solid transparent;
          background: linear-gradient(135deg, #ff7a18, #ff2c77, #a823ff) border-box;
          box-shadow: 0 9px 20px rgba(0,0,0,.28);
        }
        .spicey-live-ref-person span,
        .spicey-live-ref-invite span {
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }
        .spicey-live-ref-composer {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: max(20px, env(safe-area-inset-bottom) + 12px);
          height: 70px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 50px 48px 48px 86px;
          gap: 10px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 28px;
          background: linear-gradient(90deg, rgba(20, 15, 32, .88), rgba(54, 17, 45, .82));
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 18px 44px rgba(0,0,0,.38);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .spicey-live-ref-composer input {
          width: 100%;
          min-width: 0;
          height: 50px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 22px;
          padding: 0 18px;
          color: #fff;
          outline: none;
          background: rgba(255,255,255,.08);
          font-size: 15px;
        }
        .spicey-live-ref-composer input::placeholder {
          color: rgba(255,255,255,.55);
        }
        .spicey-live-ref-composer button {
          height: 50px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          color: #fff;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.1);
        }
        .spicey-live-ref-composer .is-send,
        .spicey-live-ref-composer .is-follow {
          background: linear-gradient(135deg, #ff7a18, #ff2466 52%, #cf22ff);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.32), 0 10px 26px rgba(255, 39, 92, .33);
        }
        .spicey-live-ref-composer .is-follow {
          font-size: 17px;
          font-weight: 850;
        }
        .spicey-live-ref-camera-mini {
          position: absolute;
          left: 22px;
          bottom: max(188px, env(safe-area-inset-bottom) + 176px);
          display: flex;
          gap: 9px;
        }
        .spicey-live-ref-camera-mini button {
          width: 38px;
          height: 38px;
        }
        @media (max-width: 390px) {
          .spicey-live-ref-top {
            left: 18px;
            right: 16px;
            grid-template-columns: 1fr auto 30px;
          }
          .spicey-live-ref-brand {
            font-size: 22px;
          }
          .spicey-live-ref-live {
            min-width: 62px;
            height: 34px;
            padding: 0 13px;
            font-size: 14px;
          }
          .spicey-live-ref-viewers {
            min-width: 74px;
            height: 34px;
            font-size: 13px;
          }
          .spicey-live-ref-host {
            left: 20px;
            top: max(96px, env(safe-area-inset-top) + 84px);
          }
          .spicey-live-ref-host img {
            width: 52px;
            height: 52px;
          }
          .spicey-live-ref-host-name {
            font-size: 23px;
          }
          .spicey-live-ref-tools {
            right: 18px;
            top: max(128px, env(safe-area-inset-top) + 114px);
            gap: 10px;
          }
          .spicey-live-ref-tools button,
          .spicey-live-ref-rail button {
            width: 48px;
            height: 48px;
          }
          .spicey-live-ref-comments {
            left: 18px;
            width: min(66vw, 260px);
          }
          .spicey-live-ref-cohost {
            left: 14px;
            right: 14px;
            padding: 12px;
          }
          .spicey-live-ref-cohost-row {
            gap: 7px;
          }
          .spicey-live-ref-invite svg,
          .spicey-live-ref-person img {
            width: 48px;
            height: 48px;
          }
          .spicey-live-ref-composer {
            left: 12px;
            right: 12px;
            grid-template-columns: minmax(0, 1fr) 44px 40px 40px 70px;
            gap: 7px;
            height: 64px;
          }
          .spicey-live-ref-composer input,
          .spicey-live-ref-composer button {
            height: 44px;
          }
          .spicey-live-ref-composer .is-follow {
            font-size: 14px;
          }
        }
      `}</style>

      {/* ── END STREAM MODAL ── */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowEndModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="rounded-2xl p-6 max-w-sm w-full"
              style={{ background: 'rgba(16,6,30,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-white font-bold text-lg">End Live Stream?</h3>
              </div>
              <p className="text-white/60 text-sm mb-2">
                Your stream will end for all <strong className="text-white">{viewerCount}</strong> viewers.
              </p>
              {giftCount > 0 && <p className="text-pink-400 text-sm mb-4">🎁 You received {giftCount} gifts!</p>}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowEndModal(false)}
                  className="flex-1 py-3 rounded-full text-white font-semibold"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                <button onClick={stopStreaming}
                  className="flex-1 py-3 rounded-full text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ff4444)' }}>End Stream</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SAVE REPLAY MODAL ── */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="rounded-2xl p-6 max-w-sm w-full"
              style={{ background: 'rgba(16,6,30,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-white font-bold text-lg mb-2">Save Live Replay?</h3>
              <p className="text-white/60 text-sm mb-6">Share your live stream as a Spicey Clip so followers can watch it later.</p>
              <div className="flex gap-3">
                <button onClick={discardReplay}
                  className="flex-1 py-3 rounded-full text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button onClick={saveReplay} disabled={isSaving}
                  className="flex-1 py-3 rounded-full text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                  {isSaving ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Spicey Clip</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
