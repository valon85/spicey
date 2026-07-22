import supabaseApi from './supabaseApi';
import { ensureFreshSpiceySession, spiceyApi, spiceySession } from './spiceyApi';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'spicey_session';
const PROFILE_OVERRIDES_KEY = 'spicey_profile_overrides';
const LEGACY_KEYS = [
  'base44_access_token',
  'base44_auth_token',
  'base44_user_data',
  'base44_user_email',
  'base44_app_id',
  'base44_app_base_url',
  'base44_from_url',
  'base44_server_url',
  'token',
];
const ROOT_ADMIN_EMAILS = ['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com'];

const AI_TALK_GREETINGS = {
  en: "Hi! Welcome to Spicey AI. I'm your AI assistant. How can I help you today?",
  sq: "Përshëndetje! Mirë se erdhe te Spicey AI. Si mund të të ndihmoj sot?",
  de: "Hallo! Willkommen bei Spicey AI. Wie kann ich dir heute helfen?",
  fr: "Bonjour! Bienvenue sur Spicey AI. Comment puis-je vous aider aujourd'hui?",
  es: "¡Hola! Bienvenido a Spicey AI. ¿Cómo puedo ayudarte hoy?",
  it: "Ciao! Benvenuto su Spicey AI. Come posso aiutarti oggi?",
  pt: "Olá! Bem-vindo ao Spicey AI. Como posso ajudar hoje?",
  tr: "Merhaba! Spicey AI'a hoş geldin. Bugün sana nasıl yardımcı olabilirim?",
  ar: "مرحباً! أهلاً بك في Spicey AI. كيف يمكنني مساعدتك اليوم؟",
};

function aiTalkGreeting(language = 'en') {
  return AI_TALK_GREETINGS[language] || AI_TALK_GREETINGS.en;
}

function profileOverrides() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_OVERRIDES_KEY) || '{}');
  } catch (_) {
    return {};
  }
}

function saveProfileOverride(userId, payload = {}) {
  if (!userId) return;
  const current = profileOverrides();
  current[userId] = { ...(current[userId] || {}), ...payload };
  localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(current));
}

function unwrapUser(result) {
  const user = result?.user || result || null;
  if (!user) return null;
  const meta = user.user_metadata || {};
  const override = profileOverrides()[user.id] || {};
  const normalized = {
    ...user,
    ...override,
    username: override.username || user.username || meta.username || user.email?.split('@')[0],
    full_name: override.full_name || user.full_name || meta.full_name || meta.name || user.email?.split('@')[0],
    bio: override.bio || user.bio || meta.bio || '',
    avatar_url: override.avatar_url || user.avatar_url || meta.avatar_url || '',
  };
  const email = String(user.email || '').toLowerCase();
  if (ROOT_ADMIN_EMAILS.includes(email)) {
    return { ...normalized, role: 'admin', is_admin: true, admin_level: 'root' };
  }
  return normalized;
}

const FALLBACK_YOUTUBE_REELS = [
  { youtubeVideoId: 'sLR-1sZqROo', title: 'Try Not To Laugh 😅 Funny Video', channelName: 'boxtoxtv', durationSeconds: 35 },
  { youtubeVideoId: 'MR1bdFP0MXk', title: 'BEST TREND AGAIN 😱😥🍬🍭', channelName: 'Canal Kimberlly e Kyann', durationSeconds: 35 },
  { youtubeVideoId: 'Vwik2yE9hFk', title: 'The cat NEVER saw me coming 😹', channelName: "America's Funniest Home Videos", durationSeconds: 35 },
  { youtubeVideoId: '6H5AImEWu0s', title: 'Try not to laugh impossible 🤣', channelName: 'AllthingZFunny', durationSeconds: 35 },
  { youtubeVideoId: 'nR06vtLCeOs', title: 'Try Not to Laugh #44', channelName: 'Panda Shorts', durationSeconds: 35 },
  { youtubeVideoId: 'ckJL1TMtDlM', title: 'When Kids Ask The DARNEST Things🤣', channelName: 'Shekindafunny', durationSeconds: 35 },
  { youtubeVideoId: 'XulN4FZCqJ4', title: 'Top 5 FALLING Moments 😂', channelName: 'TopOfficial', durationSeconds: 35 },
  { youtubeVideoId: 'WwUFu5WAfSw', title: 'Of COURSE she spoke too soon', channelName: "America's Funniest Home Videos", durationSeconds: 35 },
];

const BASE44_CURRENT_USER_ID = '69fe90d3bbe7ad47925e4a0b';

const FALLBACK_PEOPLE = [
  { id: '69feae083aa61326b91c603e', user_id: '69feae083aa61326b91c603e', full_name: 'Valon Dervishi', username: 'valondervishi', email: 'valondervishi@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Valon%20Dervishi&background=ff5500&color=fff&size=256' },
  { id: '69fef3afd4b8a59a0460e8d9', user_id: '69fef3afd4b8a59a0460e8d9', full_name: 'Valon Dervishi', username: 'appspicey', email: 'appspicey@gmail.com', avatar_url: 'https://ui-avatars.com/api/?name=Valon%20Dervishi&background=ff5500&color=fff&size=256' },
  { id: '6a0a10c4bb8c5deb31d7999d', user_id: '6a0a10c4bb8c5deb31d7999d', full_name: 'Ardian Dervishi', username: 'ardiandervishi', email: 'ardiandervishi@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Ardian%20Dervishi&background=ff5500&color=fff&size=256' },
  { id: '6a05114447b0efd796d85e1e', user_id: '6a05114447b0efd796d85e1e', full_name: 'Lonny Dee', username: 'lonnydee', email: 'lonnydee@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Lonny%20Dee&background=e91e8c&color=fff&size=256' },
  { id: '6a0ba30a7ed1076276059082', user_id: '6a0ba30a7ed1076276059082', full_name: 'Avni Dear', username: 'avnidear', email: 'avnidear@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Avni%20Dear&background=9c27b0&color=fff&size=256' },
  { id: '6a069d8cd355f8ebc3455257', user_id: '6a069d8cd355f8ebc3455257', full_name: 'Power NYC', username: 'powernyc', email: 'powernyc@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Power%20NYC&background=ff5500&color=fff&size=256' },
  { id: '6a049b37e1a76da1bb6ce47b', user_id: '6a049b37e1a76da1bb6ce47b', full_name: 'Beko', username: 'beko', email: 'beko@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Beko&background=e91e8c&color=fff&size=256' },
  { id: '6a027805928983c3fe51b2eb', user_id: '6a027805928983c3fe51b2eb', full_name: 'Spicey Support', username: 'spiceysupport', email: 'info@spicey.live', avatar_url: 'https://ui-avatars.com/api/?name=Spicey%20Support&background=ff5500&color=fff&size=256' },
  { id: '69feb0e9c1fe3f359ac8bcdb', user_id: '69feb0e9c1fe3f359ac8bcdb', full_name: 'Vlora Dervishi', username: 'vlora.dervisi', email: 'vlora@spicey.local', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&q=80' },
  { id: '6a00c072d40a9ca53179fc05', user_id: '6a00c072d40a9ca53179fc05', full_name: 'Gazi Dervishi', username: 'gazidervishi', email: 'gazidervishi@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Gazi%20Dervishi&background=9c27b0&color=fff&size=256' },
  { id: '6a2a56181f37c258a43a8dd5', user_id: '6a2a56181f37c258a43a8dd5', full_name: 'Zeri Drinit', username: 'zeridrinit', email: 'zeridrinit@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Zeri%20Drinit&background=ff5500&color=fff&size=256' },
  { id: '6a2dbeceffc757b80ecf6643', user_id: '6a2dbeceffc757b80ecf6643', full_name: 'Terry Hill', username: 'terryhill', email: 'terryhill@spicey.local', avatar_url: 'https://ui-avatars.com/api/?name=Terry%20Hill&background=e91e8c&color=fff&size=256' },
  { id: '6a33eecbe291ce5003115d6d', user_id: '6a33eecbe291ce5003115d6d', full_name: 'testarnoalex', username: 'testarnoalex', email: 'testarnoalex@gmail.com', avatar_url: 'https://ui-avatars.com/api/?name=testarnoalex&background=9c27b0&color=fff&size=256' },
  { id: '6a027805928983c3fe51b2eb', user_id: '6a027805928983c3fe51b2eb', full_name: 'info', username: 'info', email: 'info@spicey.live', avatar_url: 'https://ui-avatars.com/api/?name=info&background=ff5500&color=fff&size=256' },
  { id: 'demo-vlora', user_id: 'demo-vlora', full_name: 'Vlora Dervishi', username: 'vlora.d', email: 'vlora@spicey.local', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&q=80' },
  { id: 'demo-dardan', user_id: 'demo-dardan', full_name: 'Dardan Berisha', username: 'dardan.b', email: 'dardan@spicey.local', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80' },
];

const LOCAL_CALL_SESSIONS = new Map();

const FALLBACK_REELS = [
  {
    id: 'local-funny-bunny',
    author_id: 'demo-vlora',
    author_name: 'Funny Shorts',
    author_username: 'funnyshorts',
    author_avatar: 'https://ui-avatars.com/api/?name=Funny%20Shorts&background=ff5500&color=fff&size=256',
    caption: 'Funny cartoon moment 😂',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    post_type: 'reel',
    likes_count: 1280,
    comments_count: 84,
    fire_count: 420,
    created_date: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'local-funny-elephant',
    author_id: 'demo-dardan',
    author_name: 'Spicey Laughs',
    author_username: 'spiceylaughs',
    author_avatar: 'https://ui-avatars.com/api/?name=Spicey%20Laughs&background=e91e8c&color=fff&size=256',
    caption: 'Quick funny video vibe 🔥',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    post_type: 'reel',
    likes_count: 940,
    comments_count: 51,
    fire_count: 260,
    created_date: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'local-funny-sintel',
    author_id: 'demo-vlora',
    author_name: 'Daily Clips',
    author_username: 'dailyclips',
    author_avatar: 'https://ui-avatars.com/api/?name=Daily%20Clips&background=9c27b0&color=fff&size=256',
    caption: 'Short video for testing autoplay ✨',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    post_type: 'reel',
    likes_count: 760,
    comments_count: 33,
    fire_count: 180,
    created_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

function normalizeYouTubeVideos(videos = []) {
  return videos.map((video) => {
    const videoId = video.youtubeVideoId || video.youtube_id || video.id?.replace(/^youtube-/, '');
    return {
      ...video,
      id: video.id || `youtube-${videoId}`,
      youtubeVideoId: videoId,
      title: video.title || video.caption || 'Funny short video',
      channelName: video.channelName || video.author_name || video.author_username || 'YouTube',
      thumbnailUrl: video.thumbnailUrl || video.image_url || video.author_avatar || '',
      watchUrl: video.watchUrl || video.external_url || (videoId ? `https://www.youtube.com/shorts/${videoId}` : 'https://www.youtube.com'),
      durationSeconds: video.durationSeconds || 45,
    };
  }).filter((video) => video.youtubeVideoId);
}

async function currentUser() {
  const result = await spiceyApi.auth.me();
  return unwrapUser(result);
}

function normalizeUser(profile = {}) {
  const id = profile.user_id || profile.id;
  const email = String(profile.email || '').toLowerCase();
  const isRootAdmin = ROOT_ADMIN_EMAILS.includes(email);
  return {
    ...profile,
    id,
    user_id: id,
    role: isRootAdmin ? 'admin' : profile.role,
    is_admin: isRootAdmin || profile.is_admin,
    admin_level: isRootAdmin ? 'root' : profile.admin_level,
    full_name: profile.full_name || profile.username || profile.email?.split('@')[0] || 'Spicey User',
    username: profile.username || profile.email?.split('@')[0] || 'spicey',
    avatar_url: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.username || 'Spicey')}&background=ff5500&color=fff&size=256`,
  };
}

function countSince(rows = [], days = 0) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return rows.filter((row) => {
    const value = row.created_at || row.created_date || row.inserted_at;
    return value && new Date(value).getTime() >= threshold;
  }).length;
}

async function listForAdmin(entityName, limit = 1000) {
  try {
    return await supabaseApi.entities[entityName].list('-created_date', limit);
  } catch (_) {
    return [];
  }
}

async function getAdminAnalyticsFallback() {
  const [profiles, posts, stories, reactions, comments, follows, subscriptions, reports, blocks] = await Promise.all([
    listForAdmin('UserProfile', 1000),
    listForAdmin('Post', 1000),
    listForAdmin('Story', 1000),
    listForAdmin('Reaction', 1000),
    listForAdmin('Comment', 1000),
    listForAdmin('Follow', 1000),
    listForAdmin('Subscription', 1000),
    listForAdmin('Report', 1000),
    listForAdmin('Block', 1000),
  ]);
  const activeVip = subscriptions.filter((row) => ['active', 'trialing'].includes(row.status));
  const growthTrend = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(Date.now() - (13 - index) * 24 * 60 * 60 * 1000);
    const day = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      users: profiles.filter((row) => String(row.created_at || row.created_date || '').startsWith(day)).length,
      posts: posts.filter((row) => String(row.created_at || row.created_date || '').startsWith(day)).length,
      stories: stories.filter((row) => String(row.created_at || row.created_date || '').startsWith(day)).length,
    };
  });
  return {
    users: {
      totalUsers: profiles.length,
      newUsersToday: countSince(profiles, 1),
      newUsersWeek: countSince(profiles, 7),
      newUsersMonth: countSince(profiles, 30),
    },
    content: {
      totalPosts: posts.length,
      totalPhotos: posts.filter((row) => row.image_url || row.media_type === 'photo').length,
      totalReels: posts.filter((row) => row.type === 'reel' || row.media_type === 'video').length,
      totalStories: stories.length,
      totalYoutube: posts.filter((row) => row.youtube_url || row.youtube_video_id).length,
      totalText: posts.filter((row) => !row.image_url && !row.video_url && !row.youtube_url).length,
      postsToday: countSince(posts, 1),
      postsWeek: countSince(posts, 7),
      postsMonth: countSince(posts, 30),
      photosToday: countSince(posts.filter((row) => row.image_url || row.media_type === 'photo'), 1),
      photosWeek: countSince(posts.filter((row) => row.image_url || row.media_type === 'photo'), 7),
      photosMonth: countSince(posts.filter((row) => row.image_url || row.media_type === 'photo'), 30),
      reelsToday: countSince(posts.filter((row) => row.type === 'reel' || row.media_type === 'video'), 1),
      reelsWeek: countSince(posts.filter((row) => row.type === 'reel' || row.media_type === 'video'), 7),
      reelsMonth: countSince(posts.filter((row) => row.type === 'reel' || row.media_type === 'video'), 30),
      storiesToday: countSince(stories, 1),
      storiesWeek: countSince(stories, 7),
      storiesMonth: countSince(stories, 30),
    },
    engagement: {
      totalLikes: reactions.filter((row) => row.type === 'like' || row.reaction_type === 'like').length,
      totalPostFire: reactions.filter((row) => row.type === 'fire' || row.reaction_type === 'fire').length,
      totalComments: comments.length,
      totalFollows: follows.length,
      likesToday: countSince(reactions, 1),
      likesWeek: countSince(reactions, 7),
      likesMonth: countSince(reactions, 30),
      commentsToday: countSince(comments, 1),
      commentsWeek: countSince(comments, 7),
      commentsMonth: countSince(comments, 30),
      followsToday: countSince(follows, 1),
      followsWeek: countSince(follows, 7),
      followsMonth: countSince(follows, 30),
    },
    vip: {
      totalVIP: activeVip.length,
      giftedVip: subscriptions.filter((row) => row.source === 'gift' || row.is_gifted).length,
      paidVip: subscriptions.filter((row) => row.source === 'stripe' || row.stripe_subscription_id).length,
      expiredVip: subscriptions.filter((row) => row.status === 'expired' || row.status === 'cancelled').length,
      vipByPlan: {
        vip: activeVip.filter((row) => row.plan_type === 'vip' || row.plan === 'vip').length,
        creator: activeVip.filter((row) => row.plan_type === 'creator' || row.plan === 'creator').length,
        business: activeVip.filter((row) => row.plan_type === 'business' || row.plan === 'business').length,
      },
      vipToday: countSince(activeVip, 1),
      vipWeek: countSince(activeVip, 7),
      vipMonth: countSince(activeVip, 30),
    },
    moderation: {
      totalReports: reports.length,
      pendingReports: reports.filter((row) => !row.status || row.status === 'pending').length,
      postReports: reports.filter((row) => row.target_type === 'post').length,
      userReports: reports.filter((row) => row.target_type === 'user').length,
      totalBlocks: blocks.length,
    },
    topCreators: profiles.slice(0, 8).map((profile) => ({
      userId: profile.user_id || profile.id,
      username: profile.username || profile.full_name || profile.email || 'user',
      avatar: profile.avatar_url || profile.profile_photo_url,
      posts: posts.filter((post) => post.user_id === profile.user_id || post.author_id === profile.user_id).length,
    })),
    topPosts: posts.slice(0, 8).map((post) => ({
      id: post.id,
      type: post.type || post.media_type || 'post',
      author: post.author_username || post.username || 'creator',
      caption: post.caption || post.text || '',
      likes: post.likes_count || post.like_count || 0,
      comments: post.comments_count || post.comment_count || 0,
    })),
    growthTrend,
  };
}

function fallbackPeople(query = '', limit = 12) {
  const q = query.trim().toLowerCase();
  return FALLBACK_PEOPLE
    .map(normalizeUser)
    .filter((user) => !q || [user.full_name, user.username, user.email].some((value) => String(value || '').toLowerCase().includes(q)))
    .slice(0, limit);
}

function currentUserIdForFallback(user) {
  return user?.id || user?.user_id || BASE44_CURRENT_USER_ID;
}

function mapBase44CurrentId(value, user) {
  return value === BASE44_CURRENT_USER_ID ? currentUserIdForFallback(user) : value;
}

function isMissingCallSessionsTable(error) {
  return /call_sessions.*schema cache|schema cache.*call_sessions|could not find the table.*call_sessions|pgrst205/i
    .test(error?.message || '');
}

function warnMissingCallSessions(error) {
  if (isMissingCallSessionsTable(error)) {
    console.warn('[Spicey Calls] Supabase call_sessions table is missing. Run supabase/supabase/fix_call_sessions_schema_cache.sql.');
    return;
  }
  console.warn('[Spicey Calls] Using local call fallback:', error?.message || error);
}

function makeLocalCallSession(payload = {}, user = null) {
  const now = new Date().toISOString();
  return {
    id: payload.id || `local-call-${Date.now()}`,
    caller_id: payload.caller_id || currentUserIdForFallback(user),
    receiver_id: payload.receiver_id,
    type: payload.type === 'video' ? 'video' : 'voice',
    status: payload.status || 'ringing',
    caller_name: payload.caller_name || user?.full_name || user?.username || 'User',
    caller_avatar: payload.caller_avatar || user?.avatar_url || null,
    receiver_name: payload.receiver_name || null,
    receiver_avatar: payload.receiver_avatar || null,
    caller_ice: payload.caller_ice || [],
    receiver_ice: payload.receiver_ice || [],
    created_at: payload.created_at || now,
    created_date: payload.created_date || now,
    updated_at: payload.updated_at || now,
    local_only: true,
  };
}

function filterLocalCallSessions(filters = {}) {
  return Array.from(LOCAL_CALL_SESSIONS.values()).filter((session) =>
    Object.entries(filters || {}).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return String(session[key]) === String(value);
    })
  );
}

function funnyYoutubeReels() {
  return normalizeYouTubeVideos(FALLBACK_YOUTUBE_REELS).map((video, index) => ({
    id: video.id,
    author_id: `youtube-${video.channelName || index}`,
    author_name: video.channelName || 'Funny Shorts',
    author_username: String(video.channelName || 'funnyshorts').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'funnyshorts',
    author_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelName || 'Funny Shorts')}&background=ff5500&color=fff&size=256`,
    caption: video.title,
    title: video.title,
    thumbnail_url: video.thumbnailUrl,
    youtube_video_id: video.youtubeVideoId,
    youtubeVideoId: video.youtubeVideoId,
    external_url: video.watchUrl,
    post_type: 'reel',
    likes_count: 1200 - index * 73,
    comments_count: 84 - index * 5,
    fire_count: 420 - index * 24,
    created_date: new Date(Date.now() - 1000 * 60 * (10 + index * 8)).toISOString(),
  }));
}

async function invokeFunction(name, payload = {}) {
  switch (name) {
    case 'aiVoiceRealtime':
      try {
        return { data: await spiceyApi.ai.getRealtimeSession(payload) };
      } catch (error) {
        console.error('[Spicey AI Realtime] Session failed:', error.message);
        return { data: { error: error.message || 'Realtime session failed' } };
      }
    case 'getUserProfile': {
      const userId = payload.userId || payload.user_id || payload.id;
      let profile = null;
      try {
        const result = await spiceyApi.profile.get(userId);
        profile = result?.profile || result?.user || result || null;
      } catch (error) {
        console.warn('[Spicey Profile] API profile lookup failed, using local fallback:', error.message);
      }
      if (!profile) {
        profile = fallbackPeople('', 50).find((user) =>
          [user.id, user.user_id, user.auth_user_id, user.email, user.username].includes(userId)
        ) || null;
      }
      return { data: profile ? normalizeUser(profile) : null };
    }
    case 'getUserSubscription': {
      try {
        const result = await spiceyApi.subscriptions.status();
        return { data: result };
      } catch (error) {
        return { data: { hasSubscription: false, planType: null, subscription: null } };
      }
    }
    case 'toggleFollow': {
      const targetUserId = payload.target_user_id || payload.targetUserId || payload.userId;
      if (!targetUserId) throw new Error('Missing target user id');
      return { data: await spiceyApi.follows.toggle(targetUserId) };
    }
    case 'stripeCheckout':
      return { data: await spiceyApi.subscriptions.checkout(payload) };
    case 'aiVoiceChat': {
      const prompt = payload.text_override || payload.prompt || payload.message || payload.command ||
        (payload.is_greeting ? aiTalkGreeting(payload.language) : '');
      let result = null;
      try {
        result = await spiceyApi.ai.voiceChat({ ...payload, prompt });
      } catch (error) {
        console.warn('[Spicey AI] Using local AI Talk fallback:', error.message);
      }
      const text = result?.text || result?.output_text || result?.message ||
        (payload.is_greeting
          ? aiTalkGreeting(payload.language)
          : `I heard you. ${prompt ? `You said: "${prompt}".` : 'Ask me anything and I will help.'}`);
      return {
        data: {
          ai_text: text,
          text,
          transcription: result?.transcription || payload.text_override || '',
          speech_url: result?.speech_url || '',
          no_speech: Boolean(result?.no_speech),
        },
      };
    }
    case 'adminAIAssistant':
      return { data: await spiceyApi.ai.text({ prompt: payload.prompt || payload.message || payload.command || '' }) };
    case 'getReelsFeed': {
      let result = null;
      try {
        result = await spiceyApi.reels.list(payload);
      } catch (error) {
        console.warn('[Spicey Reels] Using local reel fallback:', error.message);
      }
      // Keep YouTube items out of the Spicey reel collection. SpiceyReels loads
      // them through getYouTubeReels so they always use the official player.
      return { data: { reels: result?.reels || [] } };
    }
    case 'getYouTubeReels': {
      let result = null;
      try {
        result = await spiceyApi.youtube.reels({
          query: payload.query || 'funny short videos',
          limit: payload.limit || 12,
        });
      } catch (error) {
        console.warn('[Spicey API] Using local YouTube fallback:', error.message);
      }
      const videos = normalizeYouTubeVideos(result?.videos?.length ? result.videos : FALLBACK_YOUTUBE_REELS);
      return { data: { videos } };
    }
    case 'toggleReaction': {
      const type = payload.type || 'like';
      const postId = payload.post_id || payload.postId;
      try {
        const result = await spiceyApi.reactions.create({ post_id: postId, type });
        return { data: result };
      } catch (error) {
        console.warn('[Spicey Reactions] Using local reaction fallback:', error.message);
        return {
          data: {
            action: 'added',
            type,
            post_id: postId,
            reaction: {
              id: `local-reaction-${postId || 'post'}-${type}-${Date.now()}`,
              post_id: postId,
              type,
              local_only: true,
            },
          },
        };
      }
    }
    case 'getCuratedReelsAdmin':
      return { data: await spiceyApi.admin.curatedReels(payload) };
    case 'addCuratedReel':
      return { data: await spiceyApi.admin.addCuratedReel(payload) };
    case 'searchUsers':
    case 'adminSearchUsers': {
      const query = payload.query || payload.search || '';
      const limit = payload.limit || 12;
      let users = [];
      try {
        const result = await spiceyApi.users.search({ query, limit });
        users = result?.users || result?.profiles || [];
      } catch (error) {
        console.warn('[Spicey Users] API search failed, trying Supabase profiles:', error.message);
      }
      if (!users.length) {
        try {
          const profiles = await supabaseApi.entities.UserProfile.list('-created_date', 500);
          const q = query.trim().toLowerCase();
          users = profiles
            .map(normalizeUser)
            .filter((user) => !q || [user.full_name, user.username, user.email].some((value) => String(value || '').toLowerCase().includes(q)))
            .slice(0, limit);
        } catch (error) {
          console.warn('[Spicey Users] Supabase profile fallback failed:', error.message);
        }
      }
      if (!users.length) users = fallbackPeople(query, limit);
      return { data: { users: users.map(normalizeUser), profiles: users.map(normalizeUser) } };
    }
    case 'searchMusic':
      return { data: await spiceyApi.music.search(payload) };
    case 'getOrCreateChat':
      return { data: await spiceyApi.chats.create(payload) };
    case 'getUserChats':
      return { data: await spiceyApi.chats.list() };
    case 'getChatMessages': {
      const chatId = payload.chat_id || payload.chatId;
      if (!chatId) throw new Error('Missing chat id');
      const chatResult = await spiceyApi.chats.list();
      const allowedChats = Array.isArray(chatResult?.chats) ? chatResult.chats : [];
      const allowed = allowedChats.some((chat) => String(chat.id) === String(chatId));
      if (!allowed) throw new Error('Chat access denied');
      return { data: await spiceyApi.messages.list(chatId) };
    }
    case 'markChatRead': {
      const chatId = payload.chat_id || payload.chatId;
      if (!chatId) throw new Error('Missing chat id');
      return { data: await spiceyApi.messages.markRead(chatId) };
    }
    case 'sendDirectMessage': {
      const chatId = payload.chat_id || payload.chatId;
      if (chatId) {
        const chatResult = await spiceyApi.chats.list();
        const allowedChats = Array.isArray(chatResult?.chats) ? chatResult.chats : [];
        const allowed = allowedChats.some((chat) => String(chat.id) === String(chatId));
        if (!allowed) throw new Error('Chat access denied');
        return { data: await spiceyApi.messages.create(chatId, payload) };
      }
      const receiverId = payload.receiver_id || payload.to_user_id || payload.receiverId;
      const chat = await spiceyApi.chats.create({ other_user_id: receiverId });
      return { data: await spiceyApi.messages.create(chat.chat?.id || chat.id, payload) };
    }
    case 'initiateCall':
      return { data: await spiceyApi.callSessions.create(payload) };
    case 'notifyNewMessage':
      return { data: { ok: true } };
    case 'sendCallNotification':
      return { data: { ok: true } };
    case 'getBanubaToken':
      return { data: await spiceyApi.banuba.token() };
    case 'getAdminUsers':
    case 'adminGetAllUsers':
      try {
        return { data: await spiceyApi.admin.users(payload) };
      } catch (_) {
        const users = (await listForAdmin('UserProfile', 1000)).map(normalizeUser);
        return { data: { users, total: users.length } };
      }
    case 'getAdminAnalytics':
    case 'getAnalytics':
      try {
        return { data: await spiceyApi.admin.analytics() };
      } catch (_) {
        return { data: await getAdminAnalyticsFallback() };
      }
    case 'adminModerateUser':
      return { data: await spiceyApi.admin.moderateUser(payload) };
    case 'giftVIPAccess':
    case 'grantVIPAccess':
      return { data: await spiceyApi.subscriptions.gift(payload) };
    case 'getVIPUsers':
      return { data: await spiceyApi.subscriptions.adminList() };
    case 'removeVIPAccess':
      return { data: await spiceyApi.subscriptions.adminUpdate(payload.subscriptionId || payload.subscription_id || payload.id, { status: 'cancelled', cancellation_reason: payload.reason || null }) };
    case 'getClientInfo':
      return { data: { user_agent: navigator.userAgent, captured_at: new Date().toISOString() } };
    default:
      throw new Error(`Spicey API function "${name}" is not mapped yet.`);
  }
}

export const TokenStorage = {
  async get() {
    const token = spiceySession.token();
    if (token) return token;
    try {
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      if (!value) return null;
      try {
        const storedSession = JSON.parse(value);
        if (storedSession?.access_token) {
          spiceySession.set(storedSession);
          return storedSession.access_token;
        }
        return value;
      } catch (_) {
        return value;
      }
    } catch (_) {
      return null;
    }
  },
  async set(value) {
    if (!value) return;
    const existingSession = spiceySession.get() || {};
    const session = typeof value === 'object'
      ? { ...existingSession, ...value }
      : { ...existingSession, access_token: value, token_type: existingSession.token_type || 'bearer' };
    spiceySession.set(session);
    try { await Preferences.set({ key: TOKEN_KEY, value: JSON.stringify(session) }); } catch (_) {}
  },
  async remove() {
    spiceySession.clear();
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    try {
      await Preferences.remove({ key: TOKEN_KEY });
      await Preferences.remove({ key: 'spicey_user_data' });
      await Preferences.remove({ key: 'spicey_cached_user' });
    } catch (_) {}
  },
  async setUser(userObj) {
    if (!userObj) return;
    const value = JSON.stringify(userObj);
    localStorage.setItem('spicey_user_data', value);
    localStorage.setItem('spicey_cached_user', value);
    try {
      await Preferences.set({ key: 'spicey_user_data', value });
      await Preferences.set({ key: 'spicey_cached_user', value });
    } catch (_) {}
  },
  async getUser() {
    try {
      const localValue = localStorage.getItem('spicey_user_data') || localStorage.getItem('spicey_cached_user');
      if (localValue) return JSON.parse(localValue);
      const primary = await Preferences.get({ key: 'spicey_user_data' });
      const fallback = primary?.value ? primary : await Preferences.get({ key: 'spicey_cached_user' });
      return fallback?.value ? JSON.parse(fallback.value) : null;
    } catch (_) {
      return null;
    }
  },
};

export async function initializeAuth() {
  try {
    const user = await currentUser();
    if (user) await TokenStorage.setUser(user);
    return user;
  } catch (_) {
    return null;
  }
}

export async function persistLogin(sessionOrToken, maybeEmailOrUser, maybeUser) {
  const user = maybeUser || maybeEmailOrUser;
  if (typeof sessionOrToken === 'string') {
    await TokenStorage.set(sessionOrToken);
  } else if (sessionOrToken?.access_token) {
    spiceySession.set(sessionOrToken);
    try { await Preferences.set({ key: TOKEN_KEY, value: JSON.stringify(sessionOrToken) }); } catch (_) {}
  }
  if (user) await TokenStorage.setUser(user);
}

export function injectSDKToken(token) {
  if (token) TokenStorage.set(token);
}

export function clearSDKToken() {
  TokenStorage.remove();
}

const wrappedEntities = {
  ...supabaseApi.entities,
  Chat: {
    ...supabaseApi.entities.Chat,
    async list(...args) {
      return supabaseApi.entities.Chat.list(...args);
    },
  },
  CallSession: {
    ...supabaseApi.entities.CallSession,
    async list(...args) {
      try {
        return await supabaseApi.entities.CallSession.list(...args);
      } catch (error) {
        warnMissingCallSessions(error);
        return Array.from(LOCAL_CALL_SESSIONS.values());
      }
    },
    async filter(filters = {}, ...args) {
      try {
        return await supabaseApi.entities.CallSession.filter(filters, ...args);
      } catch (error) {
        warnMissingCallSessions(error);
        return filterLocalCallSessions(filters);
      }
    },
    async get(id) {
      try {
        return await supabaseApi.entities.CallSession.get(id);
      } catch (error) {
        warnMissingCallSessions(error);
        return LOCAL_CALL_SESSIONS.get(id) || null;
      }
    },
    async create(payload = {}) {
      const result = await spiceyApi.callSessions.create(payload);
      const session = result?.call_session || result?.session || result;
      if (!session?.id) throw new Error('Call session was not created');
      return session;
    },
    async update(id, payload = {}) {
      const result = await spiceyApi.callSessions.update(id, payload);
      return result?.call_session || result?.session || result;
    },
  },
};

export const base44 = {
  auth: {
    me: currentUser,
    getToken: async () => {
      await ensureFreshSpiceySession();
      return spiceySession.token();
    },
    setToken: injectSDKToken,
    loginViaEmailPassword: async ({ email, password }) => {
      const result = await spiceyApi.auth.login({ email, password });
      await persistLogin(result.session, result.user);
      return result.user;
    },
    loginWithProvider: () => Promise.resolve(),
    redirectToLogin: () => Promise.resolve(),
    resetPasswordRequest: (email) => spiceyApi.auth.forgotPassword({ email }),
    logout: async () => {
      spiceyApi.auth.logout();
      await TokenStorage.remove();
    },
    updateMe: async (payload = {}) => {
      const result = await spiceyApi.profile.update(payload);
      const updated = result.profile || result.user || result;
      saveProfileOverride(updated?.user_id || updated?.id || result?.user?.id, payload);
      return { ...updated, ...payload };
    },
  },
  entities: wrappedEntities,
  functions: { invoke: invokeFunction },
  integrations: {
    Core: {
      UploadFile: ({ file, ...options } = {}) => spiceyApi.media.upload(file, options),
      UploadPrivateFile: ({ file, ...options } = {}) => spiceyApi.media.upload(file, options),
      CreateFileSignedUrl: ({ file_uri, file_url } = {}) => ({ signed_url: file_url || file_uri }),
      InvokeLLM: async ({ prompt, ...options } = {}) => {
        try {
          const result = await spiceyApi.ai.text({ prompt, ...options });
          return result.text || result;
        } catch (error) {
          console.warn('[Spicey AI] Text fallback:', error.message);
          const userText = String(prompt || '').replace(/^.*User says:\s*"/s, '').replace(/"$/s, '').trim();
          return `Spicey AI preview is ready. ${userText ? `For "${userText}", ` : ''}try a short hook, one clear idea, and a clean finish with 3 focused hashtags.`;
        }
      },
      GenerateImage: ({ prompt, existing_image_urls = [], size, quality } = {}) => {
        const sourceUrl = existing_image_urls?.[0];
        if (sourceUrl) return spiceyApi.ai.enhanceImage({ image_url: sourceUrl, prompt });
        return spiceyApi.ai.generateImage({ prompt, size, quality });
      },
      GenerateVideo: async ({ prompt, size, seconds } = {}) => {
        const created = await spiceyApi.ai.generateVideo({ prompt, size, seconds });
        if (!created?.id || created.url) return created;
        for (let attempt = 0; attempt < 40; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          const status = await spiceyApi.ai.getVideo(created.id);
          if (status?.status === 'failed') throw new Error(status.error?.message || 'AI video generation failed.');
          if (status?.url) return status;
        }
        throw new Error('Video is still processing. Please try again in a moment.');
      },
      GenerateSpeech: async ({ text } = {}) => ({ audio_url: '', text }),
      TranscribeAudio: async () => ({ text: '' }),
    },
  },
  asServiceRole: { entities: wrappedEntities },
};

export const User = { ...wrappedEntities.User, me: currentUser };
export const Post = wrappedEntities.Post;
export const Chat = wrappedEntities.Chat;
export const Message = wrappedEntities.Message;
export const Reaction = wrappedEntities.Reaction;
export const Comment = wrappedEntities.Comment;

export default base44;
