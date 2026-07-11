import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, MessageCircle, User, Search, Flame, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Play, label: 'Reels', path: '/reels' },
  { icon: Sparkles, label: 'AI', path: '/ai', isAI: true },
  { icon: Search, label: 'Explore', path: '/explore' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const TRENDING = ['#SpiceyNight', '#UrbanVibes', '#GlowUp', '#NoFilter', '#AfterDark'];

function LeftSidebar() {
  const location = useLocation();
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-30"
      style={{
        background: 'linear-gradient(180deg, rgba(10,4,16,0.97) 0%, rgba(18,5,22,0.97) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
      }}>

      {/* Ambient glow top-left */}
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,80,0,0.08) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="px-6 pt-8 pb-8">
        <img
          src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/f7e33989f_SpiceyLogo.png"
          alt="SPICEY"
          className="h-10 object-contain"
          style={{ filter: 'drop-shadow(0 0 12px rgba(255,100,0,0.5))' }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/profile' && location.pathname.startsWith('/profile'));
          return (
            <Link key={item.path} to={item.path}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all group relative"
              style={{
                background: isActive
                  ? item.isAI
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(233,30,140,0.1))'
                    : 'linear-gradient(135deg, rgba(255,80,0,0.15), rgba(220,30,120,0.12))'
                  : 'transparent',
                border: isActive
                  ? item.isAI ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(255,80,0,0.2)'
                  : '1px solid transparent',
              }}>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: item.isAI ? 'linear-gradient(to bottom, #8b5cf6, #e91e8c)' : 'linear-gradient(to bottom, #ff5500, #e91e8c)' }} />
              )}
              <item.icon
                className={`w-5 h-5 transition-all ${isActive ? (item.isAI ? 'text-purple-400' : 'text-orange-400') : 'text-white/40 group-hover:text-white/70'}`}
                style={isActive ? { filter: item.isAI ? 'drop-shadow(0 0 6px rgba(139,92,246,0.9))' : 'drop-shadow(0 0 6px rgba(255,100,0,0.7))' } : {}}
              />
              <span className={`font-semibold text-[15px] transition-all ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
                {item.label}
              </span>
              {item.isAI && !isActive && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Create */}
      <div className="px-4 pb-8">
        <Link to="/create"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
            boxShadow: '0 0 20px rgba(255,80,0,0.35), 0 0 40px rgba(220,30,120,0.2)',
          }}>
          <Plus className="w-4 h-4" />
          Create Post
        </Link>
      </div>
    </aside>
  );
}

function RightPanel() {
  const { data: posts = [] } = useQuery({
    queryKey: ['posts-suggestions'],
    queryFn: () => base44.entities.Post.list('-created_date', 20),
    staleTime: 300000, // 5 min — sidebar suggestions don't need to be fresh
    refetchOnWindowFocus: false,
  });

  // Get unique authors for suggestions
  const suggestions = [];
  const seen = new Set();
  for (const p of posts) {
    if (!seen.has(p.author_id) && suggestions.length < 4) {
      seen.add(p.author_id);
      suggestions.push(p);
    }
  }

  return (
    <aside className="hidden xl:flex fixed right-0 top-0 h-screen w-72 flex-col pt-8 px-5 z-30 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(10,4,16,0.95) 0%, rgba(18,5,22,0.95) 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        scrollbarWidth: 'none',
      }}>

      {/* Ambient glow */}
      <div className="absolute bottom-20 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,0,200,0.08) 0%, transparent 70%)' }} />

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <input
          placeholder="Search Spicey..."
          className="w-full h-10 pl-10 pr-4 rounded-2xl text-sm text-white placeholder:text-white/25 outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Trending */}
      <div className="rounded-2xl p-4 mb-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-white/60 tracking-widest uppercase">Trending</span>
        </div>
        <div className="space-y-2.5">
          {TRENDING.map((tag, i) => (
            <button key={tag}
              className="flex items-center justify-between w-full group">
              <div className="flex items-center gap-2.5">
                {i === 0 && <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />}
                {i !== 0 && <span className="w-3.5 text-center text-[11px] text-white/20 font-bold">{i + 1}</span>}
                <span className="text-sm font-semibold text-white/70 group-hover:text-white transition">{tag}</span>
              </div>
              <span className="text-[10px] text-white/25">{((i + 1) * 1.3).toFixed(1)}K posts</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested users */}
      {suggestions.length > 0 && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white/60 tracking-widest uppercase">Suggested</span>
          </div>
          <div className="space-y-3">
            {suggestions.map(p => {
              const avatar = p.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author_name || 'User')}&background=1a0a2e&color=fff&size=80`;
              return (
                <div key={p.author_id} className="flex items-center gap-3">
                  <img src={avatar} alt={p.author_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    style={{ border: '1.5px solid rgba(255,255,255,0.1)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.author_name}</p>
                    <p className="text-[11px] text-white/35 truncate">@{p.author_username}</p>
                  </div>
                  <Link to={`/profile/${p.author_id}`}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
                    style={{ background: 'rgba(255,80,0,0.12)', border: '1px solid rgba(255,80,0,0.25)', color: '#ff7733' }}>
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-white/15 mt-6 text-center">© 2025 Spicey</p>
    </aside>
  );
}

export default function WebLayout({ children }) {
  return (
    <div className="bg-background">
      <LeftSidebar />
      <RightPanel />

      {/* Center content — offset by sidebars on desktop, scrolls naturally with the page */}
      <main className="lg:ml-64 xl:mr-72">
        {children}
      </main>
    </div>
  );
}