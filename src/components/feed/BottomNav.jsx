import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, User, Zap, X, Bell } from 'lucide-react';
import CreateHub from './CreateHub';
import { base44 } from '@/api/base44Client';

const HIDDEN_PATHS = ['/live', '/stories', '/create-text', '/create-youtube', '/create-story-photo', '/create-story-video', '/create-photo', '/create-video', '/create-v2', '/reels', '/create'];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hubOpen, setHubOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refreshUnread = async () => {
      try {
        const response = await base44.functions.invoke('getUserChats', {});
        const chats = response.data?.chats || response.data || [];
        const total = chats.reduce((sum, chat) => sum + Number(chat.unread_count || 0), 0);
        if (!cancelled) setUnreadCount(total);
      } catch (_) {}
    };
    refreshUnread();
    const timer = setInterval(refreshUnread, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [location.pathname]);

  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        setKeyboardOpen(true);
      }
    };
    const handleFocusOut = (e) => {
      const target = e.target;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        setTimeout(() => {
          const activeEl = document.activeElement;
          const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA' || activeEl?.isContentEditable;
          setKeyboardOpen(Boolean(isInput));
        }, 50);
      }
    };
    const handleViewportResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      const keyboardLikelyOpen = viewport.height < window.innerHeight - 120;
      if (keyboardLikelyOpen) setKeyboardOpen(true);
      else if (!(document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.isContentEditable)) {
        setKeyboardOpen(false);
      }
    };
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.visualViewport?.addEventListener('resize', handleViewportResize);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('hub') === '1') {
      setHubOpen(true);
      navigate('/', { replace: true });
    }
  }, [location.search]);

  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setHubOpen(false);
    }
  }, [location.pathname]);

  const shouldHide = HIDDEN_PATHS.some(p => location.pathname.startsWith(p));
  const isAIPage = location.pathname === '/ai';
  const isAIInputFocused = isAIPage && document.body.classList.contains('ai-input-focused');
  if (shouldHide || keyboardOpen || isAIInputFocused) return null;

  const isHome = location.pathname === '/';
  const isMsgs = location.pathname.startsWith('/messages');
  const isAI = location.pathname === '/ai';
  const isProfile = location.pathname.startsWith('/profile');

  // Shared icon style — chrome/3D look
  const iconStyle = (active) => ({
    color: active ? '#FF6A00' : (isLightMode ? 'rgba(80,60,110,0.7)' : 'rgba(200,190,220,0.75)'),
    fill: active ? '#FF6A00' : 'none',
    filter: active
      ? 'drop-shadow(0 0 8px rgba(255,106,0,1)) drop-shadow(0 0 3px rgba(255,106,0,0.8))'
      : 'none',
    strokeWidth: 1.5,
    transition: 'color 0.2s, filter 0.2s, fill 0.2s',
  });

  const labelStyle = (active) => ({
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: active ? '#FF6A00' : (isLightMode ? 'rgba(80,60,110,0.6)' : 'rgba(180,170,200,0.55)'),
    marginTop: 2,
    transition: 'color 0.2s',
  });

  return (
    <>
      <CreateHub open={hubOpen} onClose={() => setHubOpen(false)} />

      <div
        id="bottom-nav"
        className="fixed bottom-0 left-0 right-0 flex items-end justify-center"
        style={{
          zIndex: 9999,
          paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
          pointerEvents: 'none',
          WebkitTransform: 'translate3d(0,0,0)',
          transform: 'translate3d(0,0,0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Pill container */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            height: 58,
            paddingLeft: 14,
            paddingRight: 14,
            borderRadius: 36,
            background: isLightMode
              ? 'rgba(255,255,255,0.55)'
              : 'rgba(28,16,48,0.45)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: isLightMode
              ? '1px solid rgba(255,255,255,0.7)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isLightMode
              ? '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
              : '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            gap: 0,
          }}
        >
          {/* Home */}
          <NavBtn to="/" active={isHome}>
            <Home className="w-[26px] h-[26px]" style={iconStyle(isHome)} />
          </NavBtn>

          {/* Messages */}
          <NavBtn to="/messages" active={isMsgs}>
            <MessageCircle className="w-[26px] h-[26px]" style={iconStyle(isMsgs)} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 6, minWidth: 18, height: 18,
                padding: '0 5px', borderRadius: 10, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'linear-gradient(135deg,#ff3b30,#ff2d8d)',
                color: '#fff', fontSize: 10, fontWeight: 900, border: 'none',
                boxShadow: '0 0 10px rgba(255,45,120,.85)'
              }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </NavBtn>

          {/* Center Orb — Create */}
          <button
            onClick={() => setHubOpen(o => !o)}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              marginTop: -28,
              marginBottom: -28,
              marginLeft: 8,
              marginRight: 8,
              flexShrink: 0,
              position: 'relative',
              background: hubOpen
                ? 'linear-gradient(145deg, #CC0040 0%, #880099 100%)'
                : 'linear-gradient(145deg, #FF9500 0%, #FF2D55 55%, #BF00FF 100%)',
              boxShadow: hubOpen
                ? '0 3px 18px rgba(200,0,100,0.7), 0 1px 0 rgba(0,0,0,0.3), inset 0 -4px 8px rgba(0,0,0,0.35), inset 0 4px 8px rgba(255,255,255,0.25)'
                : '0 3px 20px rgba(255,100,0,0.75), 0 6px 28px rgba(200,0,255,0.3), 0 1px 0 rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 4px 10px rgba(255,255,255,0.35)',
              border: '2.5px solid rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
            }}
            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.91)'; }}
            onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {/* Top gloss */}
            <div style={{
              position: 'absolute',
              top: 4, left: 7, right: 7,
              height: '38%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
              borderRadius: '50% 50% 40% 40%',
              pointerEvents: 'none',
            }} />
            {/* Bottom depth shadow */}
            <div style={{
              position: 'absolute',
              bottom: 4, left: 10, right: 10,
              height: '18%',
              background: 'rgba(0,0,0,0.22)',
              borderRadius: '50%',
              filter: 'blur(4px)',
              pointerEvents: 'none',
            }} />
            {/* Icon */}
            {hubOpen ? (
              <X className="w-6 h-6 text-white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.7))' }} />
            ) : (
              <div style={{ position: 'relative', width: 16, height: 16 }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2.5, marginTop: -1.25, borderRadius: 4, background: 'white', boxShadow: '0 0 6px rgba(255,255,255,0.9)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2.5, marginLeft: -1.25, borderRadius: 4, background: 'white', boxShadow: '0 0 6px rgba(255,255,255,0.9)' }} />
              </div>
            )}
          </button>

          {/* AI */}
          <NavBtn to="/ai" active={isAI}>
            <Zap className="w-[26px] h-[26px]" style={iconStyle(isAI)} />
            <span style={labelStyle(isAI)}>AI</span>
          </NavBtn>

          {/* Profile */}
          <NavBtn to="/profile" active={isProfile}>
            <User className="w-[26px] h-[26px]" style={iconStyle(isProfile)} />
          </NavBtn>
        </div>
      </div>
    </>
  );
}

function NavBtn({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 56,
        padding: '8px 6px',
        WebkitTapHighlightColor: 'transparent',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      {children}
      {active && (
        <div style={{
          position: 'absolute',
          bottom: 2,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'linear-gradient(to right, #FF6A00, #FF2D55)',
          boxShadow: '0 0 6px rgba(255,106,0,0.8)',
        }} />
      )}
    </Link>
  );
}
