import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, SlidersHorizontal } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { spiceyColors, spiceyGlass, spiceyShadows } from './spiceyNeonGlassTokens';
import SpiceyLogoText from '@/components/shared/SpiceyLogoText';

const SEARCH_HISTORY_KEY = 'spicey.feed.searchHistory.v1';

function readSearchHistory() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    return Array.isArray(stored) ? stored.slice(0, 6) : [];
  } catch {
    return [];
  }
}

function normalizeSearchUser(user) {
  if (!user) return null;
  const targetUserId = user.user_id || user.auth_user_id || user.id;
  if (!targetUserId) return null;
  return {
    ...user,
    targetUserId,
    full_name: user.full_name || user.name || user.username || 'Spicey user',
    username: user.username || 'spicey',
  };
}

// Tap the S logo 5 times quickly to open the iOS debug panel
function LogoWithDebugTap({ navigate, isLight }) {
  const tapCount = React.useRef(0);
  const tapTimer = React.useRef(null);
  const headerImage = '/spicey-assets/spicey-real-s-logo-20260723.png';

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
    <div className="w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center" style={{ position: 'relative' }} onClick={handleTap}>
      <img
        src={headerImage}
        alt="Spicey"
        className="w-12 h-12 object-contain spicey-original-feed-logo"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(255,106,0,0.42)) drop-shadow(0 0 16px rgba(255,45,143,0.28))',
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
    <button
      onClick={() => navigate('/notifications')}
      className="spicey-header-bell"
      style={{
        width: isLight ? 36 : 42,
        height: isLight ? 36 : 42,
        borderRadius: isLight ? 18 : 21,
        background: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.10)',
        border: isLight ? '1px solid rgba(255,255,255,0.88)' : '1px solid rgba(255,255,255,0.14)',
        boxShadow: isLight
          ? 'inset 0 1px 0 rgba(255,255,255,0.95), 0 10px 22px rgba(78,36,64,0.14)'
          : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 24px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(16px) saturate(1.15)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.15)',
      }}
    >
      <Bell
        className="w-6 h-6"
        style={{
          color: isLight ? 'var(--spicey-page-accent, #24112f)' : '#FFFFFF',
          strokeWidth: 2.4,
          filter: isLight
            ? 'drop-shadow(0 1px 3px var(--spicey-theme-shadow, rgba(36,17,47,0.18)))'
            : 'drop-shadow(0 1px 5px rgba(0,0,0,0.55))',
        }}
      />
      {unreadCount > 0 && (
        <span className="absolute top-[1px] right-[1px] min-w-[12px] h-[12px] px-[2px] rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF2D55] text-[7px] leading-none font-black flex items-center justify-center text-white pointer-events-none"
          style={{ boxShadow: '0 1px 4px rgba(255,106,0,0.35)' }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

export default function Header({ isLight }) {
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState(readSearchHistory);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const [hasVipTheme, setHasVipTheme] = useState(() => !!document.documentElement.getAttribute('data-vip-theme'));

  useEffect(() => {
    const obs = new MutationObserver(() => setHasVipTheme(!!document.documentElement.getAttribute('data-vip-theme')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-vip-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const loadSearchResults = async (value = '') => {
    try {
      const response = await base44.functions.invoke('searchUsers', {
        query: value,
        limit: value.trim() ? 10 : 6,
      });
      const data = response.data || response || {};
      setSearchResults(Array.isArray(data) ? data : (data.users || data.profiles || []));
    } catch {
      setSearchResults([]);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadSearchResults(value), 220);
  };

  const saveSearchHistory = (user) => {
    const normalized = normalizeSearchUser(user);
    if (!normalized) return;
    setSearchHistory((previous) => {
      const next = [normalized, ...previous.filter((item) => normalizeSearchUser(item)?.targetUserId !== normalized.targetUserId)].slice(0, 6);
      try {
        window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      window.localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {}
  };

  const visibleSearchItems = (search.trim() ? searchResults : (searchResults.length ? searchResults : searchHistory))
    .map(normalizeSearchUser)
    .filter(Boolean)
    .slice(0, 6);
  const shouldShowSearchPanel = searchFocused && (visibleSearchItems.length > 0 || searchHistory.length > 0 || search.trim());

  return (
    <div className="relative pb-0 feed-header-bar spicey-feed-header spicey-ng-header spicey-fluid-header">
      {/* Top bar — with iOS safe-area padding for Dynamic Island */}
      <div 
        className="flex items-center justify-between relative spicey-ng-topbar spicey-fluid-topbar"
        style={{ 
          minHeight: 68,
          paddingTop: 'max(10px, env(safe-area-inset-top))',
        }}
      >
        {/* S Logo left — tap 5x quickly to open iOS debug */}
        <div className="spicey-ng-logo-slot spicey-fluid-s-logo">
          <LogoWithDebugTap navigate={navigate} isLight={isLight} />
        </div>

        {/* SPICEY logo centered */}
        <div
          className="spicey-reference-logo spicey-fluid-wordmark"
          aria-label="SPICEY"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLight ? 'transparent' : '#000',
            borderRadius: 18,
            padding: isLight ? '0' : '2px 16px',
          }}
        >
          {isLight ? (
            <div className="spicey-light-script-logo">
              <span className="spicey-light-script-star">✦</span>
              <span>Spicey</span>
            </div>
          ) : (
            <SpiceyLogoText height={112} />
          )}
        </div>

        <div className="flex items-center gap-2 relative z-50 spicey-ng-header-actions spicey-fluid-header-actions">
          {isLight && (
            <button
              type="button"
              onClick={() => setSearchFocused(true)}
              className="spicey-light-icon-button"
              aria-label="Search"
            >
              <Search className="w-5 h-5" strokeWidth={2.2} />
            </button>
          )}
          <NotificationBell isLight={isLight} navigate={navigate} />
        </div>
      </div>

      {/* Search bar */}
      <div className="px-0 pb-0 pt-2 spicey-ng-search-row spicey-fluid-search-row">
        <div
          className="relative flex items-center spicey-ng-search-wrap spicey-fluid-search-wrap"
          style={{
            width: '100%',
            gap: 10,
          }}
        >
          <div className="relative flex-1">
            {isLight ? (
              <>
                <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] z-10" style={{ color: 'var(--spicey-page-accent, rgba(255,106,0,0.86))', strokeWidth: 1.9 }} />
                <Input
                  placeholder="Search creators, hashtags..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  onFocus={() => { setSearchFocused(true); loadSearchResults(search); }}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 130)}
                  className="pl-10 pr-12 rounded-full spicey-top-search"
                  style={{
                    height: 42,
                    borderRadius: 21,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,246,252,0.84))',
                    border: '1px solid color-mix(in srgb, var(--spicey-page-accent, #ff6a00) 32%, rgba(255,255,255,0.86))',
                    color: '#24112f',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 0 0 1px color-mix(in srgb, var(--spicey-page-accent-2, #ff2d8f) 24%, transparent), 0 12px 26px var(--spicey-theme-shadow, rgba(233,30,140,0.12))',
                    backdropFilter: 'blur(18px) saturate(1.15)',
                    WebkitBackdropFilter: 'blur(18px) saturate(1.15)',
                  }}
                />
              </>
            ) : (
              <>
                <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: 'rgba(255,255,255,0.58)', strokeWidth: 1.9 }} />
                <Input
                  placeholder="Search creators, hashtags..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  onFocus={() => { setSearchFocused(true); loadSearchResults(search); }}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 130)}
                  className="pl-10 pr-12 rounded-full spicey-top-search"
                  style={{
                    height: 46,
                    borderRadius: 24,
                    ...spiceyGlass.search,
                    background: 'linear-gradient(180deg, rgba(10, 9, 13, 0.94), rgba(0, 0, 0, 0.96))',
                    border: '1px solid color-mix(in srgb, var(--spicey-page-accent, #ff6a00) 36%, rgba(255,255,255,0.18))',
                    color: spiceyColors.white,
                    boxShadow: `${spiceyShadows.glassInset}, 0 10px 24px rgba(0,0,0,0.32), 0 0 18px var(--spicey-theme-shadow, rgba(255,45,143,0.16))`,
                  }}
                />
              </>
            )}
            <AnimatePresence>
              {shouldShowSearchPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 overflow-hidden"
                  style={{
                    top: 'calc(100% + 7px)',
                    zIndex: 9999,
                    borderRadius: 18,
                    background: '#030303',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 18px 42px rgba(0,0,0,0.62), 0 0 22px rgba(255,45,143,0.14)',
                    backdropFilter: 'blur(18px) saturate(1.18)',
                    WebkitBackdropFilter: 'blur(18px) saturate(1.18)',
                  }}
                >
                  <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.52)' }}>
                      {search.trim() ? 'Results' : 'Recent'}
                    </span>
                    {searchHistory.length > 0 && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearSearchHistory();
                        }}
                        className="text-[11px] font-extrabold"
                        style={{ color: '#ff5ab7' }}
                      >
                        Clear history
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 'min(45vh, 320px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {visibleSearchItems.length === 0 ? (
                      <div className="px-3 py-4 text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.48)' }}>
                        Search friends or creators
                      </div>
                    ) : visibleSearchItems.map((user, i) => (
                      <button
                        key={user.targetUserId || i}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          saveSearchHistory(user);
                          setSearch('');
                          setSearchResults([]);
                          setSearchFocused(false);
                          navigate(`/profile/${user.targetUserId}`);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                        style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : '0' }}
                      >
                        <img
                          src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=ff5500&color=fff&size=64`}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          style={{ padding: 2, background: 'linear-gradient(135deg, #ff8a00, #ff2d8f 50%, #8b2cff)' }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold" style={{ color: '#fff' }}>{user.full_name}</p>
                          <p className="truncate text-[11px]" style={{ color: 'rgba(255,255,255,0.48)' }}>@{user.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Settings button */}
          <button
            onClick={() => navigate('/settings')}
            className="spicey-filter-button active:scale-90 transition-all duration-200 group"
            style={{
              width: isLight ? 38 : 44,
              height: isLight ? 38 : 44,
              minWidth: isLight ? 38 : 44,
              flex: isLight ? '0 0 38px' : '0 0 44px',
              display: 'grid',
              placeItems: 'center',
              padding: 0,
              borderRadius: isLight ? 19 : 22,
              background: isLight
                ? 'radial-gradient(circle at 32% 18%, rgba(255,255,255,0.98), rgba(255,255,255,0.18) 28%, transparent 45%), var(--spicey-theme-soft, linear-gradient(145deg, #ffffff 0%, #f4f1f7 45%, #ded9e8 100%))'
                : 'radial-gradient(circle at 32% 18%, rgba(255,255,255,0.20), rgba(255,255,255,0.06) 28%, transparent 46%), linear-gradient(145deg, rgba(40,38,48,0.99) 0%, rgba(12,11,16,0.99) 58%, #000 100%)',
              border: isLight ? '1px solid color-mix(in srgb, var(--spicey-page-accent, #ff6a00) 34%, rgba(255,255,255,0.78))' : '1px solid color-mix(in srgb, var(--spicey-page-accent, #ff6a00) 32%, rgba(255,255,255,0.16))',
              boxShadow: isLight
                ? 'inset 0 3px 0 rgba(255,255,255,0.98), inset 0 -9px 15px rgba(30,24,42,0.14), inset -5px -5px 10px rgba(64,58,76,0.10), 0 8px 0 color-mix(in srgb, var(--spicey-page-accent, #ff6a00) 20%, rgba(80,72,94,0.18)), 0 16px 24px var(--spicey-theme-shadow, rgba(36,17,47,0.14))'
                : 'inset 0 3px 0 rgba(255,255,255,0.16), inset 0 -10px 16px rgba(0,0,0,0.58), inset -5px -5px 10px rgba(255,255,255,0.05), 0 8px 0 rgba(0,0,0,0.46), 0 17px 26px rgba(0,0,0,0.44), 0 0 16px var(--spicey-theme-shadow, rgba(255,45,143,0.14))',
              transform: isLight ? 'translateY(-1px)' : 'translateY(-3px)',
            }}>
            <SlidersHorizontal className={`${isLight ? 'w-[16px] h-[16px]' : 'w-[18px] h-[18px]'} transition-all duration-300 group-hover:rotate-90`}
              style={{ color: isLight ? 'var(--spicey-page-accent, #8b2cff)' : 'var(--spicey-page-accent, #f4eefc)', strokeWidth: 2.15, filter: isLight ? 'drop-shadow(0 1px 4px var(--spicey-theme-shadow, rgba(123,43,255,0.20)))' : 'drop-shadow(0 0 6px var(--spicey-theme-shadow, rgba(255,255,255,0.20)))' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
