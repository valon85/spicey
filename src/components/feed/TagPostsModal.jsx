import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, Heart, MessageCircle, Flame, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentsSheet from './CommentsSheet';

const asArray = (v) => Array.isArray(v) ? v : [];

const DEMO_POSTS_BY_TAG = {
  default: [
    { id: 'd1', author_name: 'Sofia Krasniqi', author_username: 'sofia.k', author_avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&q=80', caption: 'Living my best life ✨', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', likes_count: 2841, comments_count: 74, hashtags: [] },
    { id: 'd2', author_name: 'Ardi Berisha', author_username: 'ardi.b', author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80', caption: 'Nights like these 🌃', image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80', likes_count: 3512, comments_count: 118, hashtags: [] },
    { id: 'd3', author_name: 'Lira Gashi', author_username: 'lira.gashi', author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80', caption: 'Good energy only 💫', image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', likes_count: 1203, comments_count: 45, hashtags: [] },
    { id: 'd4', author_name: 'Blerim Hoxha', author_username: 'blerim_hx', author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80', caption: 'Weekend mode 🔥', image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=80', likes_count: 2107, comments_count: 87, hashtags: [] },
  ],
  spiceynight: [
    { id: 'sn1', author_name: 'Diona Rama', author_username: 'diona.r', author_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80', caption: 'The night is young 🌙🔥', image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&q=80', likes_count: 5420, comments_count: 203, hashtags: ['#SpiceyNight'] },
    { id: 'sn2', author_name: 'Kujtim Berisha', author_username: 'kujtim.b', author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80', caption: 'City lights hitting different tonight', image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80', likes_count: 3891, comments_count: 142, hashtags: ['#SpiceyNight'] },
    { id: 'sn3', author_name: 'Flaka Morina', author_username: 'flaka.m', author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80', caption: 'Midnight vibes only ✨', image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80', likes_count: 2234, comments_count: 89, hashtags: ['#SpiceyNight'] },
    { id: 'sn4', author_name: 'Erion Kastrati', author_username: 'erion.k', author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80', caption: 'Spicey nights in the city 🏙️', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80', likes_count: 4102, comments_count: 167, hashtags: ['#SpiceyNight'] },
  ],
  urbanvibes: [
    { id: 'uv1', author_name: 'Rina Kelmendi', author_username: 'rina.k', author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80', caption: 'Streets of the city 🏙️', image_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80', likes_count: 3201, comments_count: 98, hashtags: ['#UrbanVibes'] },
    { id: 'uv2', author_name: 'Gentian Hoxha', author_username: 'gentian.h', author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80', caption: 'Urban energy is unmatched', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80', likes_count: 2890, comments_count: 112, hashtags: ['#UrbanVibes'] },
    { id: 'uv3', author_name: 'Ardita Syla', author_username: 'ardita.s', author_avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&q=80', caption: 'Every corner tells a story 📸', image_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80', likes_count: 1945, comments_count: 67, hashtags: ['#UrbanVibes'] },
    { id: 'uv4', author_name: 'Besnik Aliu', author_username: 'besnik.a', author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80', caption: 'Concrete jungle we call home 🌆', image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', likes_count: 3678, comments_count: 134, hashtags: ['#UrbanVibes'] },
  ],
  glowup: [
    { id: 'gu1', author_name: 'Vlora Jashari', author_username: 'vlora.j', author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80', caption: 'Glowed up and never going back 💅', image_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80', likes_count: 6120, comments_count: 245, hashtags: ['#GlowUp'] },
    { id: 'gu2', author_name: 'Mirlinda Avdiu', author_username: 'mirlinda.a', author_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80', caption: 'Growing every single day 🌸', image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', likes_count: 4320, comments_count: 178, hashtags: ['#GlowUp'] },
    { id: 'gu3', author_name: 'Shpend Gashi', author_username: 'shpend.g', author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80', caption: 'Best version unlocked 🔓', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', likes_count: 2980, comments_count: 91, hashtags: ['#GlowUp'] },
    { id: 'gu4', author_name: 'Donika Peci', author_username: 'donika.p', author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80', caption: 'The glow is real ✨', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', likes_count: 5430, comments_count: 210, hashtags: ['#GlowUp'] },
  ],
  afterdark: [
    { id: 'ad1', author_name: 'Taulant Berisha', author_username: 'taulant.b', author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80', caption: 'After dark hits different 🌑', image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=80', likes_count: 4780, comments_count: 189, hashtags: ['#AfterDark'] },
    { id: 'ad2', author_name: 'Arta Osmani', author_username: 'arta.o', author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80', caption: 'When the sun goes down 🌙', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80', likes_count: 3210, comments_count: 124, hashtags: ['#AfterDark'] },
    { id: 'ad3', author_name: 'Lirim Krasniqi', author_username: 'lirim.k', author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80', caption: 'Nights are for the brave 🔥', image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80', likes_count: 2890, comments_count: 97, hashtags: ['#AfterDark'] },
    { id: 'ad4', author_name: 'Fjolla Ibishi', author_username: 'fjolla.i', author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80', caption: 'Living for these moments 💫', image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&q=80', likes_count: 5102, comments_count: 201, hashtags: ['#AfterDark'] },
  ],
  nofilter: [
    { id: 'nf1', author_name: 'Granit Morina', author_username: 'granit.m', author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80', caption: 'Real life, no edits 📸', image_url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80', likes_count: 3450, comments_count: 132, hashtags: ['#NoFilter'] },
    { id: 'nf2', author_name: 'Teuta Halili', author_username: 'teuta.h', author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80', caption: 'Authentic and unapologetic 💯', image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80', likes_count: 2780, comments_count: 88, hashtags: ['#NoFilter'] },
    { id: 'nf3', author_name: 'Agron Sadiku', author_username: 'agron.s', author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80', caption: 'This is me, take it or leave it', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', likes_count: 4120, comments_count: 156, hashtags: ['#NoFilter'] },
    { id: 'nf4', author_name: 'Blerta Rexhepi', author_username: 'blerta.r', author_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80', caption: 'Raw and real always 🌿', image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80', likes_count: 3891, comments_count: 145, hashtags: ['#NoFilter'] },
  ],
};

function getDemoPosts(tag) {
  const key = tag.toLowerCase().replace(/^#/, '').replace(/\s+/g, '');
  return DEMO_POSTS_BY_TAG[key] || DEMO_POSTS_BY_TAG.default;
}

export default function TagPostsModal({ tag, onClose, currentUser }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentPost, setCommentPost] = useState(null);
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light-mode'));

  useEffect(() => {
    const obs = new MutationObserver(() => setIsLight(document.documentElement.classList.contains('light-mode')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ['posts-tag', tag],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
  });

  const q = tag.toLowerCase().replace(/^#/, '');
  const realPosts = asArray(allPosts).filter(p =>
    (p.caption && p.caption.toLowerCase().includes(q)) ||
    (p.hashtags && p.hashtags.some(h => h.toLowerCase().replace(/^#/, '').includes(q)))
  );
  const posts = realPosts.length > 0 ? realPosts : getDemoPosts(tag);

  const bg = isLight ? 'linear-gradient(160deg, #FFF5F5 0%, #FFE8EF 50%, #F8F0FF 100%)' : '#0a0614';
  const cardBg = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.05)';
  const textColor = isLight ? '#111' : '#FFF';
  const subColor = isLight ? '#666' : 'rgba(255,255,255,0.5)';

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: bg,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: bg,
        padding: 'max(2.5rem, env(safe-area-inset-top, 0px) + 1rem) 16px 12px',
        borderBottom: `1px solid ${isLight ? '#F0F0F4' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: isLight ? '#F4F4F8' : 'rgba(255,255,255,0.1)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={18} color={textColor} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#FF6B35' }}>{tag}</p>
          <p style={{ margin: 0, fontSize: 12, color: subColor }}>{posts.length.toLocaleString()} posts</p>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 20,
          background: 'linear-gradient(135deg, #FF6B35, #e91e8c)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Flame size={13} color="white" />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>Trending</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '12px 16px 80px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{ width: 36, height: 36, border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>✨</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: textColor }}>No posts yet for {tag}</p>
            <p style={{ fontSize: 13, color: subColor }}>Be the first to post!</p>
          </div>
        ) : (
          <>
            {/* Grid view */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {posts.map((post, i) => {
                const img = post.image_url || (post.image_urls && post.image_urls[0]);
                if (!img) return null;
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedPost(post)}
                    style={{
                      borderRadius: 16, overflow: 'hidden',
                      position: 'relative', aspectRatio: '1',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Heart size={11} style={{ color: '#FF6B35', fill: '#FF6B35' }} />
                        <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{post.likes_count || 0}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MessageCircle size={11} style={{ color: 'white' }} />
                        <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{post.comments_count || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Text-only posts */}
            {posts.filter(p => !p.image_url && !(p.image_urls && p.image_urls[0])).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedPost(post)}
                style={{
                  marginBottom: 10, padding: '14px 16px',
                  borderRadius: 16, background: cardBg,
                  border: `1px solid ${isLight ? '#E5E5EA' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <img
                    src={post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'U')}&background=ff5500&color=fff&size=40`}
                    alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textColor }}>{post.author_name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: subColor }}>@{post.author_username}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: textColor, lineHeight: 1.5 }}>{post.caption}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={14} style={{ color: '#FF6B35', fill: '#FF6B35' }} />
                    <span style={{ fontSize: 12, color: subColor }}>{post.likes_count || 0}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageCircle size={14} style={{ color: subColor }} />
                    <span style={{ fontSize: 12, color: subColor }}>{post.comments_count || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Post Detail Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <PostDetailOverlay
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onComment={() => { setCommentPost(selectedPost); setSelectedPost(null); }}
            isLight={isLight}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      {/* Comments Sheet */}
      <AnimatePresence>
        {commentPost && (
          <CommentsSheet post={commentPost} open={!!commentPost} onClose={() => setCommentPost(null)} />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

function PostDetailOverlay({ post, onClose, onComment, isLight, currentUser }) {
  const img = post.image_url || (post.image_urls && post.image_urls[0]);
  const textColor = isLight ? '#111' : '#FFF';
  const subColor = isLight ? '#666' : 'rgba(255,255,255,0.5)';
  const bg = isLight ? '#FFFFFF' : '#0a0614';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: bg,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: bg,
        padding: 'max(2.5rem, env(safe-area-inset-top, 0px) + 0.5rem) 16px 12px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: isLight ? '#F4F4F8' : 'rgba(255,255,255,0.1)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={18} color={textColor} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'U')}&background=ff5500&color=fff&size=40`}
            alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textColor }}>{post.author_name}</p>
            <p style={{ margin: 0, fontSize: 11, color: subColor }}>@{post.author_username}</p>
          </div>
        </div>
      </div>

      {/* Image */}
      {img && (
        <div style={{ width: '100%', maxHeight: '55vh', overflow: 'hidden' }}>
          <img src={img} alt="" style={{ width: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div style={{ padding: '16px 16px 8px' }}>
          <p style={{ margin: 0, fontSize: 15, color: textColor, lineHeight: 1.6 }}>{post.caption}</p>
        </div>
      )}

      {/* Hashtags */}
      {asArray(post.hashtags).length > 0 && (
        <div style={{ padding: '4px 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {asArray(post.hashtags).map((h, i) => (
            <span key={i} style={{ fontSize: 13, fontWeight: 600, color: '#FF6B35' }}>{h.startsWith('#') ? h : `#${h}`}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '12px 16px 16px',
        borderTop: `1px solid ${isLight ? '#F0F0F4' : 'rgba(255,255,255,0.08)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Heart size={22} style={{ color: '#FF6B35', fill: '#FF6B35' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{post.likes_count || 0}</span>
        </div>
        <button
          onClick={onComment}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <MessageCircle size={22} style={{ color: subColor }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{post.comments_count || 0}</span>
        </button>
      </div>

      {/* Open Comments CTA */}
      <div style={{ padding: '0 16px 32px' }}>
        <button
          onClick={onComment}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #FF6B35, #e91e8c)',
            color: 'white', fontSize: 15, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,107,53,0.4)',
          }}
        >
          💬 View Comments
        </button>
      </div>
    </motion.div>
  );
}