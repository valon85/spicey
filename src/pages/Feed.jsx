import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/feed/Header';
import StoryBar from '../components/feed/StoryBar';
import PostCard from '../components/feed/PostCard';
import TrendingNow from '../components/feed/TrendingNow';
const MemoPostCard = memo(PostCard);
import CommentsSheet from '../components/feed/CommentsSheet';
import TagPostsModal from '../components/feed/TagPostsModal';
import { TrendingUp, Sparkles, Flame, Plus, ChevronRight, Image, Video, Type } from 'lucide-react';
import AIAssistantSheet from '../components/panels/AIAssistantSheet.jsx';
import AIOrb from '../components/ai/AIOrb';
import AITalkMode from '../components/ai/AITalkMode';
import { AIProvider, useAI } from '@/lib/AIContext';
import TestCallButton from '../components/TestCallButton';
import ActiveLiveBar from '../components/feed/ActiveLiveBar.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];

const TRENDING_TAGS = ['#SpiceyNight', '#UrbanVibes', '#GlowUp', '#NoFilter', '#AfterDark'];

const FASHION_FEED_IMAGES = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/2010877/pexels-photo-2010877.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/2122362/pexels-photo-2122362.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/2531552/pexels-photo-2531552.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/2787341/pexels-photo-2787341.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3059402/pexels-photo-3059402.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3065096/pexels-photo-3065096.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3771118/pexels-photo-3771118.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3992658/pexels-photo-3992658.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
  'https://images.pexels.com/photos/3992663/pexels-photo-3992663.jpeg?auto=compress&cs=tinysrgb&w=900&h=1250&fit=crop',
];

function getFashionImageSet(postIndex = 0, count = 1) {
  const start = (Number(postIndex) * 7) % FASHION_FEED_IMAGES.length;
  return Array.from({ length: count }, (_, index) => (
    `${FASHION_FEED_IMAGES[(start + index) % FASHION_FEED_IMAGES.length]}&spiceyFresh=20260711c_${postIndex}_${index}`
  ));
}

function withFashionFeedImages(post, index) {
  const hasPhoto = Boolean(post?.image_url) || asArray(post?.image_urls).length > 0;
  if (!hasPhoto) return post;

  const imageCount = Math.max(1, asArray(post.image_urls).length || 1);
  const imageSet = getFashionImageSet(index, imageCount);

  return {
    ...post,
    image_url: imageSet[0],
    image_urls: asArray(post.image_urls).length > 0 ? imageSet : post.image_urls,
  };
}

function TrendingBar() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (!isLight) {
    // Dark mode — unchanged
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>Trending</span>
        </div>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {asArray(TRENDING_TAGS).map((tag, i) => (
            <button key={tag}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform"
              style={{
                background: i === 0 ? 'linear-gradient(135deg, rgba(255,80,0,0.22), rgba(220,30,120,0.22))' : 'rgba(255,255,255,0.05)',
                border: i === 0 ? '1px solid rgba(255,80,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
              }}>
              {i === 0 && <Flame className="w-3 h-3 inline mr-1 text-orange-400" />}
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Light mode — Instagram/Snapchat style
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex items-center gap-1.5 mb-3">
        <Flame className="w-4 h-4" style={{ color: '#FF6B35' }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#000000' }}>Trending Now</span>
      </div>
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {asArray(TRENDING_TAGS).map((tag, i) => (
          <button key={tag}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
            style={{
              background: i === 0 ? 'linear-gradient(135deg, #FF6B35, #e91e8c)' : '#F0F0F0',
              color: i === 0 ? '#FFFFFF' : '#000000',
              boxShadow: i === 0 ? '0 2px 8px rgba(255,107,53,0.35)' : 'none',
            }}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

// Global user cache to prevent rate limiting
const USER_CACHE = { user: null, fetched: false };

function AIFloatingSection() {
  const { phase } = useAI();
  const [talkOpen, setTalkOpen] = React.useState(false);
  return (
    <>
      {!talkOpen && (
        <div style={{ position: 'fixed', right: 18, bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))', zIndex: 200, pointerEvents: 'auto' }}>
          <AIOrb onClick={() => setTalkOpen(true)} status={phase === 'stopped' ? 'idle' : phase} />
        </div>
      )}
      {talkOpen && (
        <AITalkMode onClose={() => setTalkOpen(false)} />
      )}
    </>
  );
}

export default function Feed() {
  const [commentPost, setCommentPost] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Cache user at Feed level to prevent N auth.me() calls from PostCard instances
  useEffect(() => {
    if (!currentUser && !USER_CACHE.fetched) {
      USER_CACHE.fetched = true;
      base44.auth.me().then(user => {
        USER_CACHE.user = user;
        setCurrentUser(user);
      }).catch(() => {
        USER_CACHE.fetched = false;
      });
    } else if (USER_CACHE.user) {
      setCurrentUser(USER_CACHE.user);
    }
  }, []);



  const DEFAULT_POSTS = [
    {
      id: 'demoA',
      author_name: 'Sophia Laurent',
      author_username: 'sophia.laurent',
      author_avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80',
      caption: 'Golden hour magic ✨☀️ When the light hits just right and everything feels perfect 💛',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 7842,
      comments_count: 321,
      fire_count: 1203,
      hashtags: ['#GoldenHour', '#SummerGlow', '#GlowUp'],
      created_date: new Date(Date.now() - 300000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoB',
      author_name: 'Isabella Rose',
      author_username: 'isabella.rose',
      author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
      caption: 'Laughing until my stomach hurts 😂💜 Best day ever with these amazing people!',
      image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&h=1250&fit=crop&q=92',
      likes_count: 5931,
      comments_count: 274,
      fire_count: 988,
      hashtags: ['#HappyVibes', '#BestFriends', '#NoFilter'],
      created_date: new Date(Date.now() - 600000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoC',
      author_name: 'Mia Castellano',
      author_username: 'mia.cstl',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'Beach days forever 🌊👙 Sun, sea, and the best company — nothing else needed! 🐚',
      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 9214,
      comments_count: 408,
      fire_count: 1540,
      hashtags: ['#BeachVibes', '#Summer2026', '#SummerGirls'],
      created_date: new Date(Date.now() - 450000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoD',
      author_name: 'Leona Blake',
      author_username: 'leona.blake',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
      caption: 'OOTD 🖤 Simplicity is the ultimate sophistication. Thoughts? 👇',
      image_url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&h=1250&fit=crop&q=92',
      likes_count: 6477,
      comments_count: 193,
      fire_count: 872,
      hashtags: ['#OOTD', '#Fashion', '#StyleInspo'],
      created_date: new Date(Date.now() - 750000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoE',
      author_name: 'Sara Mitchell',
      author_username: 'sara.mitchell',
      author_avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80',
      caption: 'Confidence is the best makeup 💄✨ Feeling like a queen today and every day!',
      image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1250&fit=crop&q=92',
      likes_count: 8340,
      comments_count: 356,
      fire_count: 1420,
      hashtags: ['#Confidence', '#SelfLove', '#BeautyTips'],
      created_date: new Date(Date.now() - 200000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoF',
      author_name: 'Becca Monroe',
      author_username: 'becca.monroe',
      author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
      caption: 'Weekend with my girls 🥂💕 Life is too short to not celebrate every moment!',
      image_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 4812,
      comments_count: 201,
      fire_count: 763,
      hashtags: ['#WeekendVibes', '#GirlsNight', '#HappyMoments'],
      created_date: new Date(Date.now() - 350000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoG',
      author_name: 'Maya Fontaine',
      author_username: 'maya.fontaine',
      author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
      caption: 'Sunsets and good vibes only 🌅🧡 When the sky turns into a painting...',
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1250&fit=crop&q=92',
      likes_count: 11203,
      comments_count: 487,
      fire_count: 1890,
      hashtags: ['#SunsetVibes', '#GoldenHour', '#Blessed'],
      created_date: new Date(Date.now() - 550000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoH',
      author_name: 'Zoe Hartley',
      author_username: 'zoe.hartley',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'City girl energy 🏙️💋 When the city becomes your playground and every street tells a story!',
      image_url: 'https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 7629,
      comments_count: 298,
      fire_count: 1102,
      hashtags: ['#CityGirl', '#UrbanVibes', '#PowerGirl'],
      created_date: new Date(Date.now() - 680000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo0',
      author_name: 'Diana Ramos',
      author_username: 'diana.ramos',
      author_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80',
      caption: 'Wonderful weekend with the girls 🌸✨ Happiness looks like this!',
      image_urls: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 5420,
      comments_count: 218,
      fire_count: 870,
      hashtags: ['#BestieGoals', '#WeekendVibes', '#HappyGirls'],
      created_date: new Date(Date.now() - 900000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo00',
      author_name: 'Flavia Morgan',
      author_username: 'flavia.morgan',
      author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
      caption: 'Last moments with the crew 💕🎉 These faces, this love!',
      image_urls: [
        'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 3891,
      comments_count: 142,
      fire_count: 601,
      hashtags: ['#FriendshipGoals', '#PartyNight', '#SpiceyNight'],
      created_date: new Date(Date.now() - 1800000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo000',
      author_name: 'Valeria James',
      author_username: 'valeria.j',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'Summer look 2026 ☀️💛 Choose what makes you happy — always!',
      image_urls: [
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 6103,
      comments_count: 289,
      fire_count: 942,
      hashtags: ['#SummerLook', '#GlowUp', '#Fashion'],
      created_date: new Date(Date.now() - 2700000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo1',
      author_name: 'Diana Ramos',
      author_username: 'diana.ramos2',
      author_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80',
      caption: 'Life is beautiful when you surround yourself with good people ✨💕 Every day is a gift!',
      image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&h=1250&fit=crop&q=92',
      likes_count: 4821,
      comments_count: 193,
      fire_count: 672,
      hashtags: ['#HappyVibes', '#GoodLife', '#Blessed'],
      created_date: new Date(Date.now() - 1800000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo2',
      author_name: 'Flavia Morgan',
      author_username: 'flavia.morgan2',
      author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
      caption: 'Last night with the girls 🎉🥂 So long without seeing each other — our love never expires! Party mode ON 🔥',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1250&fit=crop&q=92',
      likes_count: 6103,
      comments_count: 248,
      fire_count: 891,
      hashtags: ['#PartyNight', '#BestieGoals', '#SpiceyNight'],
      created_date: new Date(Date.now() - 3600000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo3',
      author_name: 'Valeria James',
      author_username: 'valeria.j2',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'A smile is the best accessory 😊✨ Feeling happy today and ready to conquer the world!',
      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
      likes_count: 3940,
      comments_count: 157,
      fire_count: 543,
      hashtags: ['#GlowUp', '#HappyGirl', '#GoodVibes'],
      created_date: new Date(Date.now() - 5400000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo4',
      author_name: 'Miranda Avery',
      author_username: 'miranda.avery',
      author_avatar: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=120&q=80',
      caption: 'When your bestie texts "how are you?" and you both know you\'re ready for an adventure 😂💜 Our friendship is unmatched!',
      image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&h=1250&fit=crop&q=92',
      likes_count: 2781,
      comments_count: 312,
      fire_count: 421,
      hashtags: ['#BestFriends', '#FriendshipGoals', '#GoodVibes'],
      created_date: new Date(Date.now() - 7200000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo5',
      author_name: 'Rina Kelley',
      author_username: 'rina.kelley',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
      caption: 'Dancing the night away 💃🎵 This is the energy that keeps us alive! Weekend vibes ❤️‍🔥',
      image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1250&fit=crop&q=92',
      likes_count: 5230,
      comments_count: 201,
      fire_count: 780,
      hashtags: ['#Dance', '#WeekendParty', '#AfterDark'],
      created_date: new Date(Date.now() - 9000000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo6',
      author_name: 'Aria Stone',
      author_username: 'aria.stone',
      author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
      caption: 'A good morning starts with coffee and positive energy ☕🌸 May your day be full of smiles and success!',
      image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&h=1250&fit=crop&q=92',
      likes_count: 1893,
      comments_count: 94,
      fire_count: 287,
      hashtags: ['#MorningVibes', '#Positivity', '#HappyLife'],
      created_date: new Date(Date.now() - 10800000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo7',
      author_name: 'Taylor Hall',
      author_username: 'taylor.hall',
      author_avatar: 'https://images.unsplash.com/photo-1502767089025-6572583495f4?w=120&q=80',
      caption: 'Nothing better than laughing with friends until it hurts 😂❤️ These moments are life\'s greatest treasure!',
      image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&h=1250&fit=crop&q=92',
      likes_count: 3417,
      comments_count: 178,
      fire_count: 502,
      hashtags: ['#FriendshipGoals', '#Laughing', '#BestieVibes'],
      created_date: new Date(Date.now() - 12600000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo8',
      author_name: 'Bella Ray',
      author_username: 'bella.ray',
      author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
      caption: 'Summer is calling and I must go 🌊☀️ Life is too short not to enjoy every single moment! Live. Laugh. Love. 💛',
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1250&fit=crop&q=92',
      likes_count: 4650,
      comments_count: 163,
      fire_count: 610,
      hashtags: ['#SummerVibes', '#BeachLife', '#HappyDays'],
      created_date: new Date(Date.now() - 14400000).toISOString(),
      post_type: 'feed',
    },
  ];

  const { data: fetchedPosts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const posts = await base44.entities.Post.list('-created_date', 20);
      const safePostsList = asArray(posts);
      const feedPosts = safePostsList.filter(p => p.post_type === 'feed' || !p.post_type);
      
      const uniqueAuthorIds = [...new Set(asArray(feedPosts).map(p => p.author_id).filter(Boolean))];
      let profilesByUserId = {};
      if (uniqueAuthorIds.length > 0) {
        try {
          const profiles = await base44.entities.UserProfile.list('-created_date', 500);
          asArray(profiles).forEach(p => { if (p.user_id) profilesByUserId[p.user_id] = p; });
        } catch (e) {}
      }
      
      const enrichedPosts = asArray(feedPosts).map(post => {
        const profile = profilesByUserId[post.author_id];
        if (!profile) return post;
        const realName = (profile.full_name && profile.full_name.trim()) ? profile.full_name : (post.author_name && post.author_name !== 'User' ? post.author_name : null);
        const realAvatar = (profile.avatar_url && profile.avatar_url.trim()) ? profile.avatar_url : (post.author_avatar && post.author_avatar.trim() ? post.author_avatar : null);
        return {
          ...post,
          author_name: realName || profile.username || post.author_username || 'User',
          author_avatar: realAvatar,
        };
      });
      
      return enrichedPosts;
    },
    staleTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 0,
  });

  const safePosts = Array.isArray(fetchedPosts) ? fetchedPosts : [];
  // Always show demo posts + any real posts from DB merged together
  console.log('[MAP_CHECK] fetchedPosts', Array.isArray(fetchedPosts), typeof fetchedPosts, Array.isArray(fetchedPosts) ? fetchedPosts.length : fetchedPosts);
  const realPostIds = new Set(safePosts.map(p => p.id));
  const demoPosts = DEFAULT_POSTS.filter(p => !realPostIds.has(p.id));
  const posts = [...safePosts, ...demoPosts].map(withFashionFeedImages);
  console.log('[MAP_CHECK] posts final', Array.isArray(posts), typeof posts, posts.length);

  // Stable callback so PostCard doesn't re-render on parent state changes
  const handleCommentClick = useCallback((p) => setCommentPost(p), []);
  const handleAiOpen = useCallback(() => setAiOpen(true), []);
  const handleTrendingTagClick = useCallback((tag) => {
    setActiveTag(tag);
    setTagModalOpen(true);
  }, []);

  return (
    <>
      <div style={{ paddingBottom: '80px' }}>
        <Header isLight={isLight} />
        <ActiveLiveBar />
        <StoryBar />
        <TrendingNow onTagClick={handleTrendingTagClick} activeTag={activeTag} />

        <div>
          {(console.log('[MAP_CHECK] render posts', Array.isArray(posts), posts?.length), asArray(posts)).map((post) => (
            <MemoPostCard key={post.id} post={post} onCommentClick={handleCommentClick} currentUser={currentUser} />
          ))}
        </div>

        <AnimatePresence>
          {!!commentPost && (
            <CommentsSheet key={commentPost?.id} post={commentPost} open={!!commentPost} onClose={() => setCommentPost(null)} />
          )}
        </AnimatePresence>
        <AIAssistantSheet open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>

      {/* Tag Posts Modal */}
      <AnimatePresence>
        {tagModalOpen && activeTag && (
          <TagPostsModal
            tag={activeTag}
            currentUser={currentUser}
            onClose={() => { setTagModalOpen(false); setActiveTag(null); }}
          />
        )}
      </AnimatePresence>

      {/* Floating AI Orb + Talk Mode — wrapped in shared AIProvider */}
      <AIProvider>
        <AIFloatingSection />
      </AIProvider>


    </>
  );
};
