import React, { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Flame,
  Heart,
  Image,
  MessageCircle,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';

const FILTER_TABS = ['For You', 'Trending', 'Reels', 'People', 'Places', 'Music', 'Games'];
const SORT_OPTIONS = ['Most Popular', 'Most Recent', 'Most Commented'];
const FILTER_OPTIONS = [
  { id: 'all', label: 'All Posts', desc: 'Everything' },
  { id: 'photos', label: 'Photos', desc: 'Images only' },
  { id: 'videos', label: 'Videos', desc: 'Video posts' },
  { id: 'reels', label: 'Reels', desc: 'Short clips' },
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&h=720&fit=crop&q=92';
const AVATAR_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&q=90';

const TRENDING_HASHTAGS = [
  { tag: 'SpicyLife', posts: '12.4K', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=220&h=160&fit=crop&q=90', gradient: 'linear-gradient(135deg, #ff6a1a 0%, #ff2d70 100%)' },
  { tag: 'SummerVibes', posts: '8.7K', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=220&h=160&fit=crop&q=90', gradient: 'linear-gradient(135deg, #ff5d35 0%, #d828ef 100%)' },
  { tag: 'ReelsOfTheDay', posts: '5.3K', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=220&h=160&fit=crop&q=90', gradient: 'linear-gradient(135deg, #b935ff 0%, #6f3dff 100%)' },
  { tag: 'FoodMood', posts: '4.2K', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=220&h=160&fit=crop&q=90', gradient: 'linear-gradient(135deg, #ff7a19 0%, #ff4faf 100%)' },
];

const FALLBACK_POSTS = [
  { id: 'fallback-1', image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=520&h=700&fit=crop&q=92', likes_count: 12400, comments_count: 128, video_url: 'demo' },
  { id: 'fallback-2', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=520&h=700&fit=crop&q=92', likes_count: 8200, comments_count: 96 },
  { id: 'fallback-3', image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=520&h=700&fit=crop&q=92', likes_count: 10100, comments_count: 142, video_url: 'demo' },
  { id: 'fallback-4', image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=520&h=700&fit=crop&q=92', likes_count: 9300, comments_count: 112 },
  { id: 'fallback-5', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520&h=700&fit=crop&q=92', likes_count: 7600, comments_count: 84, video_url: 'demo' },
  { id: 'fallback-6', image_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=520&h=700&fit=crop&q=92', likes_count: 6400, comments_count: 73 },
];

const formatCount = (value = 0) => {
  const count = Number(value) || 0;
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count);
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value) => UUID_RE.test(String(value || '').trim());
const getProfileTargetId = (user = {}) => user.user_id || user.auth_user_id || user.id;
const getFollowTargetId = (user = {}) => {
  const candidates = [user.user_id, user.auth_user_id, user.owner_id, user.author_id, user.id];
  return candidates.find(isUuid) || '';
};
const getFollowKey = (user = {}) => getFollowTargetId(user) || getProfileTargetId(user);

export default function Explore() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialTag = urlParams.get('tag') || '';
  const searchMode = urlParams.get('search') === '1';
  const [activeTab, setActiveTab] = useState(initialTag ? 'Trending' : 'For You');
  const [search, setSearch] = useState(initialTag);
  const [activeHashtag, setActiveHashtag] = useState(initialTag);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [followPendingId, setFollowPendingId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light-mode'));
  const debounceRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const checkTheme = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['posts-explore'],
    queryFn: () => base44.entities.Post.list('-likes_count', 50),
    retry: 0,
  });

  const visiblePosts = useMemo(() => {
    let items = Array.isArray(posts) ? posts.filter((post) => post.image_url || post.video_url) : [];
    const activeFilter = activeHashtag || search.trim();
    if (activeFilter) {
      const q = activeFilter.toLowerCase().replace(/^#/, '');
      items = items.filter((post) =>
        post.caption?.toLowerCase().includes(q) ||
        post.author_username?.toLowerCase().includes(q) ||
        post.author_name?.toLowerCase().includes(q) ||
        post.hashtags?.some((tag) => tag.toLowerCase().replace(/^#/, '').includes(q))
      );
    }
    if (selectedFilter === 'photos') items = items.filter((post) => post.image_url && !post.video_url);
    if (selectedFilter === 'videos') items = items.filter((post) => post.video_url);
    if (selectedFilter === 'reels') items = items.filter((post) => post.post_type === 'reel' || post.video_url);
    return (items.length >= 4 ? items : FALLBACK_POSTS).slice(0, 9);
  }, [activeHashtag, posts, search, selectedFilter]);

  const loadSearchResults = async (value = '') => {
    setSearchingUsers(true);
    try {
      const response = await base44.functions.invoke('searchUsers', { query: value, limit: value.trim() ? 12 : 8 });
      const data = response.data || response || {};
      setSearchResults(Array.isArray(data) ? data : (data.users || data.profiles || []));
    } catch {
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setActiveHashtag('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadSearchResults(value), 300);
  };

  useEffect(() => {
    if (searchMode) loadSearchResults(initialTag);
  }, [searchMode]);

  const toggleFollowUser = async (user) => {
    const targetUserId = getFollowTargetId(user);
    const followKey = getFollowKey(user);
    if (!currentUser?.id) {
      toast.message('Log in to follow this profile.');
      return;
    }
    if (!followKey) {
      toast.error('Could not find this profile.');
      return;
    }
    if (targetUserId === currentUser.id || followPendingId) return;
    if (!targetUserId) {
      setRequestedIds((current) => {
        const next = new Set(current);
        if (next.has(followKey)) next.delete(followKey); else next.add(followKey);
        return next;
      });
      toast.success(requestedIds.has(followKey) ? 'Invite removed' : 'Invite sent');
      return;
    }
    setFollowPendingId(followKey);
    try {
      const response = await base44.functions.invoke('toggleFollow', { target_user_id: targetUserId });
      const data = response.data || response || {};
      setFollowingIds((current) => {
        const next = new Set(current);
        if (data.following) next.add(followKey); else next.delete(followKey);
        return next;
      });
      setRequestedIds((current) => {
        const next = new Set(current);
        if (data.requested) next.add(followKey); else next.delete(followKey);
        return next;
      });
      toast.success(data.requested ? 'Follow request sent' : data.following ? 'Following' : 'Unfollowed');
    } catch (error) {
      toast.error(error?.message || 'Follow could not be updated');
    } finally {
      setFollowPendingId(null);
    }
  };

  const peopleResults = searchResults.filter((user) => {
    const targetUserId = getProfileTargetId(user);
    return targetUserId && targetUserId !== currentUser?.id;
  });

  useEffect(() => {
    document.body.classList.toggle('spicey-explore-light-open', isLight);
    document.body.classList.toggle('spicey-explore-dark-open', !isLight);
    return () => {
      document.body.classList.remove('spicey-explore-light-open');
      document.body.classList.remove('spicey-explore-dark-open');
    };
  }, [isLight]);

  return (
    <main className={`explore-copy-page ${isLight ? 'is-light' : 'is-dark'}`}>
      <div className="explore-copy-shell">
        <header className="explore-copy-header">
          <div className="explore-copy-avatar">
            <img
              src={currentUser?.avatar_url || AVATAR_IMAGE}
              alt=""
            />
            <span />
          </div>

          <div className="explore-copy-logo" aria-label="Spicey">
            <img src="/spicey-assets/spicey-s-symbol.svg" alt="" />
            <strong>SPICEY</strong>
            <b>+</b>
          </div>

          <button type="button" className="explore-copy-bell" aria-label="Notifications">
            <Bell size={24} />
            <span>8</span>
          </button>
        </header>

        <section className="explore-copy-search-wrap">
          <Search className="explore-copy-search-icon" size={24} />
          <input
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            onFocus={() => { setSearchFocused(true); loadSearchResults(search); }}
            onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
            placeholder={searchMode ? 'Search name or @username...' : 'Search people, posts, hashtags...'}
            autoFocus={searchMode}
          />
          <button type="button" onClick={() => searchMode ? loadSearchResults(search) : setFilterOpen(true)} aria-label={searchMode ? 'Search users' : 'Filters'}>
            {searchMode ? <Search size={24} /> : <SlidersHorizontal size={28} />}
          </button>

          <AnimatePresence>
            {!searchMode && searchFocused && searchResults.length > 0 && (
              <motion.div
                className="explore-copy-results"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {searchResults.slice(0, 5).map((user, index) => {
                  const profileTargetId = getProfileTargetId(user);
                  const followTargetId = getFollowTargetId(user);
                  const followKey = getFollowKey(user);
                  const canFollow = !!followKey && followTargetId !== currentUser?.id;
                  const isFollowing = followingIds.has(followKey);
                  const isRequested = requestedIds.has(followKey);
                  return (
                    <article key={profileTargetId || index} className="explore-copy-result-row">
                      <button
                        type="button"
                        className="explore-copy-result-person"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setSearch('');
                          setSearchResults([]);
                          navigate(`/profile/${profileTargetId}`);
                        }}
                      >
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=ff5500&color=fff&size=80`} alt="" />
                        <span>
                          <strong>{user.full_name || 'Creator'}</strong>
                          <small>@{user.username || 'spicey'}</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`explore-copy-result-follow ${isFollowing || isRequested ? 'active' : ''}`}
                        disabled={!canFollow || followPendingId === followKey}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFollowUser(user);
                        }}
                      >
                        {isFollowing || isRequested ? <UserCheck size={14} /> : <UserPlus size={14} />}
                        {!canFollow ? 'Profile' : followPendingId === followKey ? '...' : isRequested ? 'Requested' : isFollowing ? 'Following' : 'Invite'}
                      </button>
                    </article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {searchMode ? (
          <section className="explore-user-search-panel">
            <div className="explore-user-search-heading">
              <div>
                <h1>Search users</h1>
                <p>Find friends and creators on Spicey.</p>
              </div>
              <button type="button" onClick={() => navigate(`/explore?previewTheme=${isLight ? 'light' : 'dark'}`)}>Discovery</button>
            </div>

            {searchingUsers ? (
              <div className="explore-user-search-state"><span className="explore-copy-loading" /> Searching users...</div>
            ) : peopleResults.length > 0 ? (
              <div className="explore-user-list">
                {peopleResults.map((user) => {
                  const profileTargetId = getProfileTargetId(user);
                  const followTargetId = getFollowTargetId(user);
                  const followKey = getFollowKey(user);
                  const canFollow = !!followKey && followTargetId !== currentUser?.id;
                  const isFollowing = followingIds.has(followKey);
                  const isRequested = requestedIds.has(followKey);
                  return (
                    <article key={profileTargetId} className="explore-user-card">
                      <button type="button" className="explore-user-identity" onClick={() => navigate(`/profile/${profileTargetId}`)}>
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || 'User')}&background=ff5500&color=fff&size=96`} alt="" />
                        <span>
                          <strong>{user.full_name || user.username || 'Spicey user'}</strong>
                          <small>@{user.username || user.email?.split('@')[0] || 'spicey'}</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`explore-user-follow ${isFollowing || isRequested ? 'active' : ''}`}
                        disabled={!canFollow || followPendingId === followKey}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFollowUser(user);
                        }}
                      >
                        {isFollowing || isRequested ? <UserCheck size={16} /> : <UserPlus size={16} />}
                        {!canFollow ? 'Profile only' : followPendingId === followKey ? '...' : isRequested ? 'Requested' : isFollowing ? 'Following' : 'Invite'}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="explore-user-search-state">Type a name or username to find friends.</div>
            )}
          </section>
        ) : (
        <>
        <nav className="explore-copy-tabs" aria-label="Explore filters">
          {FILTER_TABS.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="explore-copy-hero">
          <img src={HERO_IMAGE} alt="" />
          <div className="explore-copy-hero-wash" />
          <div className="explore-copy-hero-copy">
            <p><Sparkles size={16} /> EXPLORE THE WORLD</p>
            <h1>Discover new<br />things every day</h1>
            <span>People, places, ideas and moments that inspire you.</span>
            <button type="button">Explore Now <ChevronRight size={22} /></button>
          </div>
          <div className="explore-copy-hero-pill top">Travel<br /><small>The World</small></div>
          <div className="explore-copy-hero-pill bottom"><Heart size={20} fill="white" /> Good Vibes<br /><small>Only</small></div>
        </section>

        <section className="explore-copy-section">
          <div className="explore-copy-title-row">
            <h2><Flame size={23} fill="#ff3b30" /> Trending Now</h2>
            <button type="button">See all <ChevronRight size={19} /></button>
          </div>
          <div className="explore-copy-trends">
            {TRENDING_HASHTAGS.map((trend) => (
              <button
                type="button"
                key={trend.tag}
                style={{ background: trend.gradient }}
                onClick={() => { setActiveHashtag(`#${trend.tag}`); setActiveTab('Trending'); setSearch(`#${trend.tag}`); }}
              >
                <strong># {trend.tag}</strong>
                <small>{trend.posts} posts</small>
                <img src={trend.image} alt="" />
              </button>
            ))}
          </div>
        </section>

        {activeHashtag && (
          <section className="explore-copy-active-tag">
            <span>{activeHashtag}</span>
            <button type="button" onClick={() => { setActiveHashtag(''); setSearch(''); setActiveTab('For You'); }}>Clear</button>
          </section>
        )}

        <section className="explore-copy-section explore-copy-posts-section">
          <div className="explore-copy-title-row">
            <h2>{activeHashtag ? `Posts for ${activeHashtag}` : 'Top Posts'}</h2>
            <div className="explore-copy-sort">
              <button type="button" onClick={() => setSortOpen((open) => !open)}>
                {sortBy} <ChevronDown size={18} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    {SORT_OPTIONS.map((option) => (
                      <button type="button" key={option} onClick={() => { setSortBy(option); setSortOpen(false); }}>{option}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="explore-copy-grid">
            {visiblePosts.map((post, index) => {
              const image = post.image_url || post.video_url || FALLBACK_POSTS[index % FALLBACK_POSTS.length].image_url;
              const isVideo = Boolean(post.video_url);
              return (
                <motion.button
                  type="button"
                  key={post.id || index}
                  className="explore-copy-post"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedCard({ image, user: post.author_username || 'creator', likes: formatCount(post.likes_count), comments: post.comments_count || 0 })}
                >
                  <img src={image} alt="" />
                  <span className="media-badge">{isVideo ? <Play size={15} fill="white" /> : <Image size={15} />}</span>
                  <span className="post-stats">
                    <b><Heart size={15} fill="white" /> {formatCount(post.likes_count)}</b>
                    <b><MessageCircle size={15} /> {post.comments_count || 0}</b>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
        </>
        )}
      </div>

      <AnimatePresence>
        {selectedCard && (
          <>
            <motion.button
              type="button"
              className="explore-copy-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              aria-label="Close"
            />
            <motion.section
              className="explore-copy-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
            >
              <img src={selectedCard.image} alt="" />
              <button type="button" onClick={() => setSelectedCard(null)}><X size={18} /></button>
              <div>
                <strong>@{selectedCard.user}</strong>
                <p>{selectedCard.likes} likes · {selectedCard.comments} comments</p>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.button
              type="button"
              className="explore-copy-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              aria-label="Close filters"
            />
            <motion.section
              className="explore-copy-filter"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
            >
              <div className="filter-head">
                <strong>Filter Content</strong>
                <button type="button" onClick={() => setFilterOpen(false)}><X size={18} /></button>
              </div>
              <div className="filter-options">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={selectedFilter === option.id ? 'active' : ''}
                    onClick={() => setSelectedFilter(option.id)}
                  >
                    <strong>{option.label}</strong>
                    <small>{option.desc}</small>
                  </button>
                ))}
              </div>
              <button type="button" className="apply" onClick={() => setFilterOpen(false)}>Apply Filters</button>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <style>{`
        body.spicey-explore-light-open,
        body.spicey-explore-light-open #root {
          background:
            radial-gradient(circle at -8% 0%, rgba(255, 238, 218, 0.95), transparent 32%),
            radial-gradient(circle at 96% 4%, rgba(255, 45, 143, 0.25), transparent 36%),
            radial-gradient(circle at 96% 88%, rgba(255, 45, 143, 0.22), transparent 34%),
            linear-gradient(135deg, #fffaf5 0%, #fff2f7 48%, #ffd5ea 100%) !important;
        }

        body.spicey-explore-dark-open,
        body.spicey-explore-dark-open #root,
        .explore-copy-page.is-dark {
          background:
            radial-gradient(circle at 8% 0%, rgba(255,106,0,.12), transparent 30%),
            radial-gradient(circle at 94% 8%, rgba(255,45,143,.14), transparent 34%),
            linear-gradient(155deg, #050208 0%, #0b0610 48%, #130818 100%) !important;
          color: #ffffff;
        }

        .explore-copy-page.is-dark .explore-copy-search-wrap,
        .explore-copy-page.is-dark .explore-copy-results,
        .explore-copy-page.is-dark .explore-copy-filter {
          background: rgba(20,12,26,.92);
          border-color: rgba(255,255,255,.12);
          color: #fff;
        }

        .explore-copy-page.is-dark input,
        .explore-copy-page.is-dark button,
        .explore-copy-page.is-dark strong,
        .explore-copy-page.is-dark h1,
        .explore-copy-page.is-dark h2 {
          color: #fff;
        }

        .explore-copy-page {
          min-height: 100dvh;
          overflow-x: hidden;
          padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));
          background:
            radial-gradient(circle at -8% 0%, rgba(255, 238, 218, 0.95), transparent 32%),
            radial-gradient(circle at 96% 4%, rgba(255, 45, 143, 0.25), transparent 36%),
            radial-gradient(circle at 96% 88%, rgba(255, 45, 143, 0.22), transparent 34%),
            linear-gradient(135deg, #fffaf5 0%, #fff2f7 48%, #ffd5ea 100%);
          color: #15111e;
        }

        .explore-copy-shell {
          width: min(100%, 430px);
          margin: 0 auto;
          padding: max(17px, env(safe-area-inset-top)) 14px 0;
        }

        .explore-copy-header {
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr) 50px;
          align-items: center;
          gap: 10px;
          min-height: 66px;
        }

        .explore-copy-avatar {
          position: relative;
          width: 39px;
          height: 39px;
          padding: 3px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6a00, #ff2d55, #d81bff);
          box-shadow: 0 8px 18px rgba(255, 45, 85, 0.18);
        }

        .explore-copy-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #fff;
        }

        .explore-copy-avatar span {
          position: absolute;
          right: -1px;
          bottom: 5px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #26d22f;
          border: 2px solid #fff;
        }

        .explore-copy-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          color: transparent;
          transform: skewX(-10deg);
          filter: drop-shadow(0 6px 13px rgba(255, 45, 85, 0.22));
        }

        .explore-copy-logo img {
          width: 28px;
          height: 28px;
          margin-right: 5px;
          object-fit: contain;
        }

        .explore-copy-logo strong {
          font-size: clamp(24px, 7vw, 32px);
          line-height: 1;
          font-weight: 950;
          letter-spacing: -0.035em;
          background: linear-gradient(92deg, #ff7a1a 0%, #ff2d55 46%, #e91edc 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .explore-copy-logo b {
          align-self: flex-start;
          color: #ff2d8f;
          font-size: 17px;
          line-height: 1;
          transform: translate(2px, 0);
        }

        .explore-copy-bell {
          position: relative;
          width: 47px;
          height: 47px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.88);
          border-radius: 50%;
          color: #111018;
          background: rgba(255,255,255,0.58);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px rgba(111, 45, 87, 0.10);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .explore-copy-bell span {
          position: absolute;
          top: 1px;
          right: 2px;
          width: 19px;
          height: 19px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          background: #ff2d55;
        }

        .explore-copy-search-wrap {
          position: relative;
          height: 58px;
          display: grid;
          grid-template-columns: 28px 1fr 50px;
          align-items: center;
          gap: 8px;
          margin: 12px 0 16px;
          padding: 0 6px 0 17px;
          border-radius: 20px;
          background: rgba(255,255,255,0.74);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.94), 0 18px 38px rgba(92, 39, 70, 0.12);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .explore-copy-search-icon {
          color: #ff2d55;
        }

        .explore-copy-search-wrap input {
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          color: #706a84;
          background: transparent;
          font-size: 13px;
          font-weight: 650;
        }

        .explore-copy-search-wrap input::placeholder {
          color: rgba(68, 61, 90, 0.72);
        }

        .explore-copy-search-wrap > button {
          width: 48px;
          height: 48px;
          border: 0;
          border-radius: 15px;
          color: #fff;
          background: linear-gradient(135deg, #ff6a00 0%, #ff2d55 48%, #d51bff 100%);
          box-shadow: 0 14px 28px rgba(255, 45, 143, 0.32);
        }

        .explore-copy-results {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 8px);
          z-index: 20;
          overflow: hidden;
          border-radius: 22px;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 20px 46px rgba(65, 25, 58, 0.16);
        }

        .explore-copy-result-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 15px;
          color: #15111e;
          border-bottom: 1px solid rgba(255, 45, 143, 0.08);
        }

        .explore-copy-result-person {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0;
          border: 0;
          color: inherit;
          text-align: left;
          background: transparent;
        }

        .explore-copy-results img {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          border-radius: 50%;
          object-fit: cover;
        }

        .explore-copy-results span {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .explore-copy-results small {
          margin-top: 3px;
          color: rgba(35, 24, 44, 0.58);
        }

        .explore-copy-result-follow {
          flex: 0 0 auto;
          min-width: 78px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 0 9px;
          border: 0;
          border-radius: 12px;
          color: #fff;
          background: linear-gradient(135deg, #ff6a00, #ff2d70, #c51cff);
          box-shadow: 0 8px 18px rgba(255,45,112,.20);
          font-size: 11px;
          font-weight: 900;
          -webkit-tap-highlight-color: transparent;
        }

        .explore-copy-result-follow.active {
          color: #ff2d70;
          background: rgba(255,45,112,.10);
          border: 1px solid rgba(255,45,112,.22);
          box-shadow: none;
        }

        .explore-copy-result-follow:disabled,
        .explore-user-follow:disabled {
          opacity: .55;
          box-shadow: none;
          cursor: not-allowed;
        }

        .explore-user-search-panel {
          min-height: 58vh;
          padding: 4px 0 28px;
        }

        .explore-user-search-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin: 8px 2px 18px;
        }

        .explore-user-search-heading h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 950;
          letter-spacing: -0.035em;
        }

        .explore-user-search-heading p {
          margin: 4px 0 0;
          color: rgba(68,61,90,.64);
          font-size: 13px;
        }

        .explore-user-search-heading > button {
          flex: 0 0 auto;
          padding: 9px 13px;
          border: 1px solid rgba(255,45,143,.22);
          border-radius: 14px;
          color: #ff2d70;
          background: rgba(255,255,255,.56);
          font-size: 12px;
          font-weight: 850;
        }

        .explore-user-list {
          display: grid;
          gap: 10px;
        }

        .explore-user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 74px;
          padding: 10px;
          border: 1px solid rgba(255,255,255,.78);
          border-radius: 22px;
          background: rgba(255,255,255,.68);
          box-shadow: 0 12px 28px rgba(92,39,70,.09);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .explore-user-identity {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0;
          border: 0;
          text-align: left;
          background: transparent;
        }

        .explore-user-identity img {
          width: 50px;
          height: 50px;
          flex: 0 0 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,45,143,.30);
        }

        .explore-user-identity span {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .explore-user-identity strong,
        .explore-user-identity small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .explore-user-identity strong { font-size: 14px; }
        .explore-user-identity small { margin-top: 4px; color: rgba(68,61,90,.58); font-size: 12px; }

        .explore-user-follow {
          min-width: 88px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 11px;
          border: 0;
          border-radius: 14px;
          color: #fff;
          background: linear-gradient(135deg, #ff6a00, #ff2d70, #c51cff);
          box-shadow: 0 8px 18px rgba(255,45,112,.22);
          font-size: 12px;
          font-weight: 900;
        }

        .explore-user-follow.active {
          color: #ff2d70;
          background: rgba(255,45,112,.10);
          box-shadow: none;
          border: 1px solid rgba(255,45,112,.22);
        }

        .explore-user-search-state {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: rgba(68,61,90,.58);
          text-align: center;
          font-size: 13px;
        }

        .explore-copy-page.is-dark .explore-user-card,
        .explore-copy-page.is-dark .explore-user-search-heading > button {
          background: rgba(255,255,255,.055);
          border-color: rgba(255,255,255,.11);
        }

        .explore-copy-page.is-dark .explore-user-search-heading p,
        .explore-copy-page.is-dark .explore-user-identity small,
        .explore-copy-page.is-dark .explore-user-search-state {
          color: rgba(255,255,255,.48);
        }

        .explore-copy-tabs {
          display: flex;
          gap: 8px;
          margin: 0 -14px 17px;
          padding: 0 14px 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .explore-copy-tabs::-webkit-scrollbar,
        .explore-copy-trends::-webkit-scrollbar {
          display: none;
        }

        .explore-copy-tabs button {
          flex: 0 0 auto;
          min-width: 78px;
          height: 43px;
          border: 1px solid rgba(255,255,255,0.86);
          border-radius: 18px;
          color: rgba(64, 58, 85, 0.72);
          background: rgba(255,255,255,0.52);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 22px rgba(90, 35, 70, 0.07);
          font-size: 13px;
          font-weight: 800;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .explore-copy-tabs button.active {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(135deg, #ff6a00 0%, #ff2d55 52%, #d51bff 100%);
          box-shadow: 0 14px 28px rgba(255, 45, 143, 0.24);
        }

        .explore-copy-hero {
          position: relative;
          height: 188px;
          overflow: hidden;
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(115, 34, 80, 0.15);
        }

        .explore-copy-hero > img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .explore-copy-hero-wash {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(255, 112, 30, 0.82) 0%, rgba(255, 45, 143, 0.58) 42%, rgba(97, 38, 166, 0.10) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.18) 100%);
        }

        .explore-copy-hero-copy {
          position: absolute;
          left: 16px;
          bottom: 15px;
          width: 58%;
          color: #fff;
        }

        .explore-copy-hero-copy p {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0 0 8px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.02em;
        }

        .explore-copy-hero-copy h1 {
          margin: 0 0 8px;
          font-size: 23px;
          font-weight: 950;
          line-height: 1.08;
          letter-spacing: 0;
        }

        .explore-copy-hero-copy span {
          display: block;
          max-width: 176px;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.35;
        }

        .explore-copy-hero-copy button {
          height: 39px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 12px;
          padding: 0 16px;
          border: 1px solid rgba(255,255,255,0.62);
          border-radius: 16px;
          color: #fff;
          background: linear-gradient(135deg, rgba(255,106,0,0.78), rgba(213,27,255,0.72));
          font-size: 13px;
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.28);
        }

        .explore-copy-hero-pill {
          position: absolute;
          right: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 92px;
          padding: 9px 10px;
          border-radius: 12px;
          color: #fff;
          background: rgba(255,255,255,0.28);
          border: 1px solid rgba(255,255,255,0.28);
          font-size: 11px;
          font-weight: 900;
          line-height: 1.08;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .explore-copy-hero-pill small {
          font-size: 10px;
          font-weight: 700;
        }

        .explore-copy-hero-pill.top {
          top: 13px;
        }

        .explore-copy-hero-pill.bottom {
          right: 18px;
          bottom: 26px;
          min-width: 101px;
        }

        .explore-copy-section {
          margin-top: 22px;
        }

        .explore-copy-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin: 0 5px 11px;
        }

        .explore-copy-title-row h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #17131f;
          font-size: 16px;
          font-weight: 950;
        }

        .explore-copy-title-row > button {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          border: 0;
          color: rgba(92, 74, 118, 0.82);
          background: transparent;
          font-size: 13px;
          font-weight: 850;
        }

        .explore-copy-trends {
          display: flex;
          gap: 9px;
          margin: 0 -14px;
          padding: 0 14px 2px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .explore-copy-trends button {
          position: relative;
          flex: 0 0 116px;
          height: 70px;
          overflow: hidden;
          border: 0;
          border-radius: 10px;
          color: #fff;
          text-align: left;
          padding: 12px 10px;
          box-shadow: 0 14px 28px rgba(185, 50, 117, 0.14);
        }

        .explore-copy-trends strong,
        .explore-copy-trends small {
          position: relative;
          z-index: 2;
          display: block;
        }

        .explore-copy-trends strong {
          font-size: 11px;
          font-weight: 950;
          white-space: nowrap;
        }

        .explore-copy-trends small {
          margin-top: 7px;
          font-size: 10px;
          font-weight: 750;
        }

        .explore-copy-trends img {
          position: absolute;
          right: 9px;
          bottom: 7px;
          width: 41px;
          height: 41px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.68);
        }

        .explore-copy-active-tag {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 18px;
          padding: 13px 16px;
          border-radius: 20px;
          color: #ff2d55;
          background: rgba(255,255,255,0.68);
          border: 1px solid rgba(255,255,255,0.88);
          font-weight: 900;
        }

        .explore-copy-active-tag button {
          border: 0;
          color: #fff;
          background: linear-gradient(135deg, #ff6a00, #ff2d8f);
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 850;
        }

        .explore-copy-posts-section {
          margin-top: 24px;
        }

        .explore-copy-sort {
          position: relative;
        }

        .explore-copy-sort > button {
          height: 36px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,0.88);
          border-radius: 13px;
          color: #17131f;
          background: rgba(255,255,255,0.64);
          font-size: 12px;
          font-weight: 850;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .explore-copy-sort div {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          z-index: 10;
          width: 158px;
          overflow: hidden;
          border-radius: 16px;
          background: rgba(255,255,255,0.98);
          box-shadow: 0 18px 36px rgba(68, 21, 59, 0.16);
        }

        .explore-copy-sort div button {
          width: 100%;
          border: 0;
          padding: 11px 14px;
          color: #17131f;
          background: transparent;
          text-align: left;
          font-size: 13px;
          font-weight: 800;
        }

        .explore-copy-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }

        .explore-copy-post {
          position: relative;
          aspect-ratio: 0.86 / 1;
          overflow: hidden;
          padding: 0;
          border: 0;
          border-radius: 8px;
          background: #f4dfe9;
          box-shadow: 0 12px 24px rgba(70, 29, 58, 0.11);
        }

        .explore-copy-post > img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .explore-copy-post::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.02) 44%, rgba(0,0,0,0.66) 100%);
        }

        .media-badge {
          position: absolute;
          z-index: 2;
          top: 7px;
          right: 7px;
          width: 21px;
          height: 21px;
          display: grid;
          place-items: center;
          border-radius: 6px;
          color: #fff;
          background: rgba(255,255,255,0.78);
          color: #fff;
        }

        .media-badge svg {
          color: #fff;
          filter: drop-shadow(0 1px 4px rgba(0,0,0,0.35));
        }

        .post-stats {
          position: absolute;
          left: 7px;
          right: 7px;
          bottom: 7px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #fff;
        }

        .post-stats b {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #fff;
          font-size: 9px;
          font-weight: 900;
          text-shadow: 0 2px 9px rgba(0,0,0,0.45);
          white-space: nowrap;
        }

        .explore-copy-loading {
          width: 36px;
          height: 36px;
          margin: 44px auto;
          border-radius: 50%;
          border: 3px solid rgba(255,45,143,0.18);
          border-top-color: #ff2d55;
          animation: explore-spin 0.8s linear infinite;
        }

        .explore-copy-modal-backdrop,
        .explore-copy-filter-backdrop {
          position: fixed;
          inset: 0;
          z-index: 60;
          border: 0;
          background: rgba(0,0,0,0.58);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .explore-copy-modal {
          position: fixed;
          z-index: 70;
          left: max(16px, calc((100vw - 430px) / 2 + 16px));
          right: max(16px, calc((100vw - 430px) / 2 + 16px));
          top: 22%;
          overflow: hidden;
          border-radius: 28px;
          background: #111;
          box-shadow: 0 26px 80px rgba(0,0,0,0.48);
        }

        .explore-copy-modal img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          display: block;
        }

        .explore-copy-modal > button {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: rgba(0,0,0,0.45);
        }

        .explore-copy-modal div {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 16px;
          color: #fff;
          text-shadow: 0 2px 12px rgba(0,0,0,0.58);
        }

        .explore-copy-modal strong {
          font-size: 18px;
          font-weight: 950;
        }

        .explore-copy-modal p {
          margin: 4px 0 0;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          font-weight: 700;
        }

        .explore-copy-filter {
          position: fixed;
          z-index: 70;
          left: max(16px, calc((100vw - 430px) / 2 + 16px));
          right: max(16px, calc((100vw - 430px) / 2 + 16px));
          bottom: max(18px, env(safe-area-inset-bottom));
          padding: 18px;
          border-radius: 28px;
          background: rgba(255,255,255,0.98);
          box-shadow: 0 26px 80px rgba(0,0,0,0.24);
        }

        .filter-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .filter-head strong {
          color: #17131f;
          font-size: 18px;
          font-weight: 950;
        }

        .filter-head button {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #f3edf5;
        }

        .filter-options {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .filter-options button {
          min-height: 82px;
          padding: 14px 12px;
          border: 1px solid rgba(55, 35, 62, 0.08);
          border-radius: 16px;
          color: #17131f;
          background: #fff;
          text-align: left;
        }

        .filter-options button.active {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(135deg, #ff6a00, #ff2d55 52%, #d51bff);
        }

        .filter-options strong,
        .filter-options small {
          display: block;
        }

        .filter-options strong {
          font-size: 14px;
          font-weight: 950;
        }

        .filter-options small {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 700;
          opacity: 0.72;
        }

        .explore-copy-filter .apply {
          width: 100%;
          height: 50px;
          margin-top: 16px;
          border: 0;
          border-radius: 17px;
          color: #fff;
          background: linear-gradient(135deg, #ff6a00, #ff2d55 52%, #d51bff);
          font-size: 15px;
          font-weight: 950;
        }

        @keyframes explore-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 380px) {
          .explore-copy-shell {
            padding-left: 12px;
            padding-right: 12px;
          }

          .explore-copy-header {
            grid-template-columns: 44px minmax(0, 1fr) 48px;
          }

          .explore-copy-logo strong {
            font-size: 24px;
          }

          .explore-copy-search-wrap {
            height: 56px;
            grid-template-columns: 27px 1fr 48px;
            padding-left: 16px;
          }

          .explore-copy-search-wrap > button {
            width: 46px;
            height: 46px;
          }

          .explore-copy-tabs button {
            min-width: 74px;
          }

          .explore-copy-hero {
            height: 180px;
          }

          .explore-copy-hero-copy h1 {
            font-size: 21px;
          }

          .explore-copy-grid {
            gap: 7px;
          }

          .post-stats {
            gap: 6px;
          }

          .post-stats b {
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  );
}
