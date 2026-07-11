import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Mic, Settings } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Tap the S logo 5 times quickly to open the iOS debug panel
function LogoWithDebugTap({ navigate, isLight }) {
  const tapCount = React.useRef(0);
  const tapTimer = React.useRef(null);

  const handleTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      navigate('/ios-debug');
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
  };

  return (
    <div className="w-[88px] h-[88px] flex-shrink-0" style={{ position: 'relative' }} onClick={handleTap}>
      <img
        src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a645abc1a_6ab1672f-73ff-4c98-a1ef-817016549a2f.png"
        alt="S"
        className="w-full h-full object-contain"
        style={{
          filter: isLight
            ? 'brightness(0.85) saturate(1.4) contrast(1.15) drop-shadow(0 0 12px rgba(255,106,0,0.35)) drop-shadow(0 0 24px rgba(255,45,85,0.25))'
            : 'drop-shadow(0 0 20px rgba(255,80,0,0.8)) drop-shadow(0 0 40px rgba(220,30,120,0.5))',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}

function NotificationBell({ isLight, navigate }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notification-count', currentUser?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: currentUser?.id, read: false }, '-created_date', 100),
    enabled: !!currentUser?.id,
    staleTime: 10000,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.length;

  return (
    <button onClick={() => navigate('/notifications')} className="relative p-2 hover:opacity-85 active:scale-95 transition z-50 mt-1">
      <Bell
        className="w-7 h-7"
        style={{
          color: isLight ? '#6E6E73' : 'rgba(255,255,255,0.65)',
          filter: isLight ? 'none' : 'drop-shadow(0 0 6px rgba(255,106,0,0.4)) drop-shadow(0 0 12px rgba(193,0,255,0.25))',
        }}
      />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-[15px] h-[15px] rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF2D55] text-[8px] font-black flex items-center justify-center text-white pointer-events-none"
          style={{ boxShadow: '0 2px 6px rgba(255,106,0,0.4)' }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

export default function Header({ isLight }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  return (
    <div
      className="relative pb-0 feed-header-bar"
      style={{
        background: isLight ? 'linear-gradient(135deg, rgba(251,211,233,0.5) 0%, rgba(255,218,185,0.5) 100%)' : 'rgba(6,3,12,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: isLight ? '1px solid rgba(255,106,0,0.1)' : '1px solid rgba(255,255,255,0.05)',
        boxShadow: isLight ? '0 2px 10px rgba(255,106,0,0.06), 0 4px 20px rgba(255,45,85,0.04)' : 'none',
      }}
    >
      {/* Ambient glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6A00]/30 to-transparent" />

      {/* Soft pink/peach glow from top right — light mode */}
      {isLight && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,180,180,0.4) 0%, rgba(255,200,200,0.3) 40%, transparent 70%)',
              filter: 'blur(60px)',
              transform: 'translate(30%, -20%)',
            }} />
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }} />
          <div className="absolute top-0 right-20 w-24 h-24 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,220,180,0.5) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }} />
        </>
      )}

      {/* Top bar — with iOS safe-area padding for Dynamic Island */}
      <div 
        className="flex items-center justify-between px-4 pb-2 relative" 
        style={{ 
          minHeight: 100,
          paddingTop: 'max(20px, env(safe-area-inset-top))',
        }}
      >
        {/* S Logo left — tap 5x quickly to open iOS debug */}
        <LogoWithDebugTap navigate={navigate} isLight={isLight} />

        {/* SPICEY logo centered — gradient wordmark */}
         <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none" style={{ height: 88, zIndex: 1 }}>
           <img
             src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/55bf52a6a_841b8be5-b1e6-4719-9a32-36fafbb51084.png"
             alt="SPICEY"
             className="object-contain"
             style={{
               height: 160,
               filter: isLight ? 'brightness(0)' : 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 20px rgba(200,100,255,0.6)) drop-shadow(0 0 40px rgba(233,30,140,0.4))',
             }}
           />
         </div>

        <div className="flex items-center gap-3 relative z-50">
          <NotificationBell isLight={isLight} navigate={navigate} />
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3 pt-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            {isLight ? (
              <div
                className="flex items-center h-12 rounded-full px-4 gap-3 cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #FF6A00 0%, #FF2D55 50%, #C100FF 100%)',
                  boxShadow: '0 4px 20px rgba(255,106,0,0.35)',
                }}
                onClick={() => navigate('/explore')}
              >
                <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
                <span className="flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Search creators, hashtags...</span>
                <Mic className="w-5 h-5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
              </div>
            ) : (
              <>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <Input
                  placeholder="Search creators, hashtags..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => navigate('/explore')}
                  className="pl-12 pr-10 rounded-full h-12 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.95)',
                  }}
                />
                <Mic className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
              </>
            )}
          </div>
          {/* Settings button */}
          <button
            onClick={() => navigate('/settings')}
            className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-all duration-200 group"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'radial-gradient(circle at 32% 20%, rgba(255,255,255,0.22) 0%, rgba(44,38,52,0.88) 20%, rgba(12,10,16,0.98) 58%, rgba(0,0,0,1) 100%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: isLight
                ? '0 10px 22px rgba(0,0,0,0.18), 0 4px 14px rgba(255,45,133,0.08), inset 0 2px 5px rgba(255,255,255,0.25), inset 0 -9px 18px rgba(0,0,0,0.55)'
                : '0 12px 28px rgba(0,0,0,0.50), 0 0 18px rgba(255,45,133,0.12), inset 0 2px 5px rgba(255,255,255,0.20), inset 0 -9px 18px rgba(0,0,0,0.72)',
              backdropFilter: 'blur(16px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'radial-gradient(circle at 32% 20%, rgba(255,255,255,0.28) 0%, rgba(54,47,64,0.9) 20%, rgba(16,13,20,1) 58%, rgba(0,0,0,1) 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.55), 0 0 22px rgba(255,45,133,0.14), inset 0 2px 6px rgba(255,255,255,0.26), inset 0 -10px 20px rgba(0,0,0,0.72)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'radial-gradient(circle at 32% 20%, rgba(255,255,255,0.22) 0%, rgba(44,38,52,0.88) 20%, rgba(12,10,16,0.98) 58%, rgba(0,0,0,1) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isLight
                ? '0 10px 22px rgba(0,0,0,0.18), 0 4px 14px rgba(255,45,133,0.08), inset 0 2px 5px rgba(255,255,255,0.25), inset 0 -9px 18px rgba(0,0,0,0.55)'
                : '0 12px 28px rgba(0,0,0,0.50), 0 0 18px rgba(255,45,133,0.12), inset 0 2px 5px rgba(255,255,255,0.20), inset 0 -9px 18px rgba(0,0,0,0.72)';
            }}>
            <span
              aria-hidden="true"
              className="absolute left-2 top-1.5 w-5 h-3 rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.08))',
                filter: 'blur(0.2px)',
                transform: 'rotate(-18deg)',
              }}
            />
            <Settings className="w-6 h-6 transition-all duration-300 group-hover:rotate-90" 
              style={{ color: '#FFFFFF', filter: 'drop-shadow(0 2px 4px rgba(70,0,90,0.55)) drop-shadow(0 0 8px rgba(255,255,255,0.22))' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
