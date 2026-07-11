import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, Heart, MessageCircle, Play, Image, X, SlidersHorizontal, ChevronRight, Flame, Star } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import SpiceyLogoText from '@/components/shared/SpiceyLogoText';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_TABS = ['For You', 'Trending', 'Reels', 'People', 'Places', 'Music', 'Games'];

const TRENDING_HASHTAGS = [
  { tag: 'SpicyLife',    posts: '12.4K', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80', color: '#FF6B35' },
  { tag: 'SummerVibes', posts: '8.7K',  img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&q=80', color: '#e91e8c' },
  { tag: 'ReelsOfTheDay',posts: '5.3K', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=120&q=80', color: '#8b5cf6' },
  { tag: 'FoodPorn',     posts: '4.2K', img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=120&q=80', color: '#FF9500' },
];

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
];

const SORT_OPTIONS = ['Most Popular', 'Most Recent', 'Most Commented'];

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Posts', desc: 'Show all types of content' },
  { id: 'photos', label: 'Photos Only', desc: 'Show photos only' },
  { id: 'videos', label: 'Videos Only', desc: 'Show videos only' },
  { id: 'reels', label: 'Reels', desc: 'Show reels only' },
];

export default function Explore() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTag = urlParams.get('tag') || '';
  const [activeTab, setActiveTab] = useState(initialTag ? 'Trending' : 'For You');
  const [search, setSearch] = useState(initialTag);
  const [activeHashtag, setActiveHashtag] = useState(initialTag);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light-mode'));
  const pageBg = usePageBackground();
  const debounceRef = useRef(null);
  const [notifCount] = useState(8);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    const obs = new MutationObserver(() => setIsLight(document.documentElement.classList.contains('light-mode')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-vip-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts-explore'],
    queryFn: () => base44.entities.Post.list('-likes_count', 50),
  });

  let postsWithImages = posts.filter(p => p.image_url || p.video_url);

  // Apply hashtag/search filter
  const activeFilter = activeHashtag || search.trim();
  if (activeFilter) {
    const q = activeFilter.toLowerCase().replace(/^#/, '');
    postsWithImages = postsWithImages.filter(p =>
      (p.caption && p.caption.toLowerCase().includes(q)) ||
      (p.hashtags && p.hashtags.some(h => h.toLowerCase().replace(/^#/, '').includes(q))) ||
      (p.author_username && p.author_username.toLowerCase().includes(q)) ||
      (p.author_name && p.author_name.toLowerCase().includes(q))
    );
  }
  
  // Apply content filter
  if (selectedFilter === 'photos') {
    postsWithImages = postsWithImages.filter(p => p.image_url && !p.video_url);
  } else if (selectedFilter === 'videos') {
    postsWithImages = postsWithImages.filter(p => p.video_url);
  } else if (selectedFilter === 'reels') {
    postsWithImages = postsWithImages.filter(p => p.post_type === 'reel' || p.video_url);
  }

  const loadSearchResults = async (value = '') => {
    try {
      const response = await base44.functions.invoke('searchUsers', { query: value, limit: value.trim() ? 12 : 8 });
      const data = response.data || response || {};
      setSearchResults(Array.isArray(data) ? data : (data.users || data.profiles || []));
    } catch {
      setSearchResults([]);
    }
  };

  const handleSearch = async (value) => {
    setSearch(value);
    setActiveHashtag(''); // clear hashtag filter when user types manually
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await loadSearchResults(value);
    }, 300);
  };



  return (
    <>
    <div style={{ minHeight: '100vh', background: pageBg, paddingBottom: 'max(7rem, env(safe-area-inset-bottom) + 6rem)', overflow: 'hidden', position: 'relative' }}>



      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: isLight ? 'linear-gradient(135deg, rgba(251,211,233,0.5) 0%, rgba(255,218,185,0.5) 100%)' : (document.documentElement.getAttribute('data-vip-theme') ? 'rgba(0,0,0,0.25)' : 'rgba(6,3,10,0.96)'), backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>

        {/* Row 1: avatar | SPICEY logo | bell */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'max(2.5rem, env(safe-area-inset-top) + 0.5rem)', paddingLeft: 16, paddingRight: 16, paddingBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', padding: 2, background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', flexShrink: 0 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#fff' }}>
              <img src={currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'U')}&background=ff5500&color=fff&size=80`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SpiceyLogoText height={160} />
          </div>

          {/* Bell with badge */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: isLight ? 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(233,30,140,0.15))' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isLight ? '1.5px solid rgba(255,107,53,0.3)' : 'none', boxShadow: isLight ? '0 2px 10px rgba(255,107,53,0.2)' : 'none' }}>
              <Bell style={{ width: 20, height: 20, color: isLight ? '#FF6B35' : 'white' }} />
            </div>
            {notifCount > 0 && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#e91e8c', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                <span style={{ color: 'white', fontSize: 9, fontWeight: 800 }}>{notifCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search bar — outside backdrop container so it's never clipped */}
        <div style={{ padding: '0 16px 12px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isLight ? (
              <div
                className="flex items-center h-12 rounded-full px-4 gap-3 cursor-pointer"
                style={{
                  flex: 1,
                  background: 'linear-gradient(90deg, #FF6A00 0%, #FF2D55 50%, #C100FF 100%)',
                  boxShadow: '0 4px 20px rgba(255,106,0,0.35)',
                }}
              >
                <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
                <input
                  value={search} onChange={e => handleSearch(e.target.value)}
                  onFocus={() => { setSearchFocused(true); loadSearchResults(search); }} onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                  placeholder="Search people, posts, hashtags..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    color: '#FFFFFF',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            ) : (
              <div
                className="flex items-center h-12 rounded-full px-4 gap-3"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.12)',
                }}
              >
                <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <input
                  value={search} onChange={e => handleSearch(e.target.value)}
                  onFocus={() => { setSearchFocused(true); loadSearchResults(search); }} onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                  placeholder="Search people, posts, hashtags..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.95)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            )}
            {/* Filter button */}
            <button
              onClick={() => setFilterOpen(true)}
              style={{ width: 52, height: 52, borderRadius: 999, background: isLight ? 'linear-gradient(135deg, #FF6B35, #e91e8c)' : 'rgba(255,255,255,0.08)', border: isLight ? 'none' : '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isLight ? '0 4px 16px rgba(255,107,53,0.45)' : 'none', flexShrink: 0, cursor: 'pointer', padding: 0 }}>
              <SlidersHorizontal style={{ width: 20, height: 20, color: isLight ? 'white' : 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>

          {/* Search results dropdown */}
          <AnimatePresence>
            {searchFocused && searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginTop: 4, borderRadius: 18, overflow: 'hidden', background: isLight ? 'rgba(255,245,248,0.95)' : 'rgba(14,6,22,0.97)', border: isLight ? '1.5px solid rgba(255,107,53,0.2)' : '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.15)', position: 'absolute', left: 16, right: 16, zIndex: 50 }}>
                {searchResults.slice(0, 5).map((user, i) => {
                  const targetUserId = user.user_id || user.auth_user_id || user.id;
                  return (
                  <a key={targetUserId || i} href={`/profile/${targetUserId}`} onClick={() => { setSearch(''); setSearchResults([]); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: isLight ? '1px solid rgba(255,107,53,0.1)' : '1px solid rgba(0,0,0,0.05)', textDecoration: 'none' }}>
                    <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=ff5500&color=fff&size=40`}
                      alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: isLight ? '#1C1C1E' : 'white', margin: 0 }}>{user.full_name}</p>
                      <p style={{ fontSize: 12, color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.4)', margin: 0 }}>@{user.username}</p>
                    </div>
                  </a>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingLeft: 16, paddingRight: 16, paddingBottom: 12 }}>
          {FILTER_TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                flexShrink: 0, padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: activeTab === tab
                  ? 'linear-gradient(135deg, #FF6B35, #e91e8c)'
                  : (isLight ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.07)'),
                color: activeTab === tab ? 'white' : (isLight ? '#FF6B35' : 'rgba(255,255,255,0.6)'),
                boxShadow: activeTab === tab ? '0 3px 12px rgba(255,107,53,0.4)' : 'none',
                border: isLight && activeTab !== tab ? '1.5px solid rgba(255,107,53,0.2)' : 'none',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero Banner */}
        <div style={{ margin: '16px 16px 0', borderRadius: 24, overflow: 'hidden', position: 'relative', height: 200 }}>
          <img src={HERO_IMGS[0]} alt="explore" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
          {/* Top pill */}
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.45)', borderRadius: 20, padding: '5px 12px' }}>
            <Star size={11} color="white" fill="white" />
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>EXPLORE THE WORLD</span>
          </div>
          {/* Top right tag */}
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: '6px 10px', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: 9, fontWeight: 700, margin: 0 }}>Travel</p>
            <p style={{ color: 'white', fontSize: 9, margin: 0 }}>The World</p>
          </div>
          {/* Text content */}
          <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: '0 0 4px', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Discover new<br />things every day</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '0 0 12px' }}>People, places, ideas and moments that inspire you.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 30, background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,53,0.5)' }}>
                Explore Now <ChevronRight size={14} />
              </button>
              <div style={{ background: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Heart size={12} style={{ color: '#FF6B35', fill: '#FF6B35' }} />
                <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>Good Vibes<br/>Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Now */}
        <div style={{ padding: '20px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={18} style={{ color: '#FF6B35' }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: isLight ? '#1C1C1E' : 'white' }}>Trending Now</span>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 600, color: '#e91e8c', background: 'none', border: 'none', cursor: 'pointer' }}>
              See all <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {TRENDING_HASHTAGS.map((h, i) => (
              <motion.div key={h.tag} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                style={{ flexShrink: 0, width: 130, borderRadius: 18, overflow: 'hidden', position: 'relative', height: 80, cursor: 'pointer', boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.1)' : '0 4px 16px rgba(0,0,0,0.3)' }}>
                <img src={h.img} alt={h.tag} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${h.color}CC 0%, transparent 60%)` }} />
                <div style={{ position: 'absolute', top: 10, left: 10, right: 10 }}>
                  <p style={{ color: 'white', fontSize: 12, fontWeight: 800, margin: '0 0 2px' }}># {h.tag}</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, margin: 0 }}>{h.posts} posts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Hashtag Banner */}
        {activeHashtag && (
          <div style={{ margin: '8px 16px 0', padding: '12px 16px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(233,30,140,0.15))', border: '1.5px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} style={{ color: '#FF6B35' }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#FF6B35', margin: 0 }}>{activeHashtag}</p>
                <p style={{ fontSize: 11, color: isLight ? '#555' : 'rgba(255,255,255,0.5)', margin: 0 }}>Showing posts with this hashtag</p>
              </div>
            </div>
            <button onClick={() => { setActiveHashtag(''); setSearch(''); setActiveTab('For You'); }}
              style={{ background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: 20, padding: '6px 12px', color: '#FF6B35', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ✕ Clear
            </button>
          </div>
        )}

        {/* Top Posts */}
        <div style={{ padding: '8px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: isLight ? '#1C1C1E' : 'white' }}>{activeHashtag ? `Posts for ${activeHashtag}` : 'Top Posts'}</span>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setSortOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: isLight ? '#555' : 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {sortBy} <ChevronRight size={14} style={{ transform: sortOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, borderRadius: 14, background: isLight ? 'rgba(255,245,248,0.95)' : '#1C1C1E', border: isLight ? '1.5px solid rgba(255,107,53,0.2)' : 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 50, minWidth: 150 }}>
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false); }}
                        style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 600, textAlign: 'left', background: sortBy === opt ? 'rgba(255,107,53,0.1)' : 'transparent', color: sortBy === opt ? '#FF6B35' : (isLight ? '#1C1C1E' : 'white'), border: 'none', cursor: 'pointer' }}>
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ width: 32, height: 32, border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(postsWithImages.length >= 4 ? postsWithImages.slice(0, 6) : [
                { id: '1', image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80', likes_count: 12400, comments_count: 128, video_url: null },
                { id: '2', image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80', likes_count: 8200, comments_count: 96, video_url: null },
                { id: '3', image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', likes_count: 10100, comments_count: 142, video_url: 'x' },
                { id: '4', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80', likes_count: 9300, comments_count: 112, video_url: null },
                { id: '5', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', likes_count: 7600, comments_count: 84, video_url: 'x' },
                { id: '6', image_url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80', likes_count: 6400, comments_count: 73, video_url: null },
              ]).map((post, i) => {
                const img = post.image_url || post.video_url;
                const isVideo = !!post.video_url;
                const likes = post.likes_count >= 1000 ? `${(post.likes_count / 1000).toFixed(1)}K` : post.likes_count;
                const comments = post.comments_count || 0;
                return (
                  <motion.div key={post.id || i}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedCard({ img, hashtag: `#Post${i + 1}`, label: post.author_username || 'creator', views: String(likes) })}
                    style={{ borderRadius: 18, overflow: 'hidden', position: 'relative', aspectRatio: '0.85', cursor: 'pointer', boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.1)' : '0 4px 16px rgba(0,0,0,0.3)' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                    {/* Type badge */}
                    <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isVideo ? <Play size={12} style={{ color: 'white', fill: 'white' }} /> : <Image size={12} style={{ color: 'white' }} />}
                    </div>
                    {/* Bottom stats */}
                    <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Heart size={12} style={{ color: '#FF6B35', fill: '#FF6B35' }} />
                        <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{likes}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageCircle size={12} style={{ color: 'white' }} />
                        <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{comments}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card detail overlay */}
      <AnimatePresence>
        {selectedCard && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              style={{ position: 'fixed', left: 16, right: 16, top: '25%', zIndex: 50, borderRadius: 28, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
              <img src={selectedCard.img} alt="" style={{ width: '100%', objectFit: 'cover', aspectRatio: '4/3' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 30%, transparent)' }} />
              <button onClick={() => setSelectedCard(null)}
                style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="white" />
              </button>
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <p style={{ color: 'white', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>{selectedCard.hashtag}</p>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '0 0 14px' }}>@{selectedCard.label} · {selectedCard.views} likes</p>
                <button onClick={() => setSelectedCard(null)}
                  style={{ width: '100%', padding: '12px', borderRadius: 30, background: 'linear-gradient(135deg, #FF6B35, #e91e8c)', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,53,0.5)' }}>
                  Explore More
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter modal - Spicy design with gradient */}
      {filterOpen && (
        <>
          <div
            onClick={() => setFilterOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 60 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              left: 16,
              right: 16,
              top: '8%',
              zIndex: 70,
              borderRadius: 24,
              background: isLight ? '#FFFFFF' : '#0f0a1a',
              boxShadow: isLight ? '0 24px 80px rgba(0,0,0,0.2)' : '0 24px 80px rgba(0,0,0,0.7)',
              overflow: 'hidden',
              maxWidth: '420px',
              margin: '0 auto',
              border: isLight ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Header with gradient icon */}
            <div style={{ padding: '24px 24px 18px', borderBottom: `1px solid ${isLight ? '#F0F0F4' : 'rgba(255,255,255,0.08)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF8C00 0%, #FF00FF 50%, #9370DB 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <SlidersHorizontal size={20} style={{ color: '#FFFFFF' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: isLight ? '#1C1C1E' : '#FFFFFF', margin: 0 }}>Filter Content</h3>
                </div>
                <button
                  onClick={() => setFilterOpen(false)}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: isLight ? '#F4F4F4' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}
                >
                  <X size={16} style={{ color: isLight ? '#8E8E93' : 'rgba(255,255,255,0.6)' }} />
                </button>
              </div>
            </div>
            
            {/* Filter Grid */}
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {FILTER_OPTIONS.map((opt) => {
                  const isActive = selectedFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedFilter(opt.id)}
                      style={{
                        position: 'relative',
                        padding: '16px 12px',
                        borderRadius: 14,
                        background: isActive
                          ? 'linear-gradient(135deg, #FF8C00 0%, #FF00FF 50%, #9370DB 100%)'
                          : (isLight ? '#FFFFFF' : 'rgba(255,255,255,0.05)'),
                        border: isActive ? 'none' : `1px solid ${isLight ? '#E0E0E0' : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        minHeight: 85,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = '#FF8C00';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = '#E0E0E0';
                        }
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#FFFFFF' : (isLight ? '#1A1A1A' : '#FFFFFF'), marginBottom: 3 }}>{opt.label}</div>
                      <div style={{ fontSize: 10, color: isActive ? 'rgba(255,255,255,0.9)' : (isLight ? '#757575' : 'rgba(255,255,255,0.45)') }}>{opt.desc}</div>
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: 10, right: 10,
                          width: 18, height: 18, borderRadius: '50%',
                          background: '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ color: '#FF8C00', fontSize: 11, fontWeight: 800 }}>✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Footer with buttons */}
            <div style={{ padding: '16px 24px 24px', borderTop: `1px solid ${isLight ? '#F0F0F4' : 'rgba(255,255,255,0.08)'}` }}>
              <button
                onClick={() => setFilterOpen(false)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #FF8C00 0%, #FF00FF 50%, #9370DB 100%)',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8,
                  marginBottom: 10,
                  boxShadow: '0 4px 16px rgba(255,140,0,0.35)',
                }}
              >
                Apply Filters
              </button>
              <button
                onClick={() => { setSelectedFilter('all'); setFilterOpen(false); }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'transparent',
                  color: isLight ? '#555555' : 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  fontWeight: 600,
                  border: `1px solid ${isLight ? '#E0E0E0' : 'rgba(255,255,255,0.12)'}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8,
                }}
              >
                Reset
              </button>
            </div>
          </motion.div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    </>
  );
}
