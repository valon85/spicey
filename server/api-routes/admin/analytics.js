import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseAdminAuth, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);
const DAY_MS = 86400000;

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

function since(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function inPeriod(rows, field, days) {
  const start = Date.now() - days * DAY_MS;
  return rows.filter((row) => {
    const time = new Date(row[field] || row.created_at || row.created_date || 0).getTime();
    return Number.isFinite(time) && time >= start;
  }).length;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function planOf(subscription) {
  return subscription.plan_type || subscription.plan || 'vip';
}

function contentType(post) {
  if (post.youtube_url || post.source === 'youtube') return 'youtube';
  if (post.post_type === 'reel' || post.video_url) return 'reel';
  if (post.image_url || (Array.isArray(post.image_urls) && post.image_urls.length)) return 'photo';
  return 'text';
}

function trendRows(authUsers, posts, stories) {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.now() - (29 - index) * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: authUsers.filter((user) => String(user.created_at || '').startsWith(key)).length,
      posts: posts.filter((post) => String(post.created_at || '').startsWith(key)).length,
      stories: stories.filter((story) => String(story.created_at || '').startsWith(key)).length,
    };
  });
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await requireAdmin(req);

    const authData = await supabaseAdminAuth('/users?page=1&per_page=1000');
    const authUsers = authData.users || [];

    const [profiles, posts, stories, comments, reactions, follows, subscriptions, reports, blocks] = await Promise.all([
      supabaseTable('profiles', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('posts', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('stories', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('comments', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('reactions', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('follows', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('subscriptions', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('reports', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
      supabaseTable('blocks', { serviceRole: true, query: '?order=created_at.desc&limit=1000' }).catch(() => []),
    ]);

    const activeSubs = subscriptions.filter((sub) => sub.status === 'active');
    const postCounts = posts.reduce((map, post) => {
      map[post.author_id] = (map[post.author_id] || 0) + 1;
      return map;
    }, {});
    const profileByUserId = Object.fromEntries(profiles.map((profile) => [profile.user_id, profile]));

    const data = {
      users: {
        totalUsers: authUsers.length || profiles.length,
        newUsersToday: inPeriod(authUsers, 'created_at', 1),
        newUsersWeek: inPeriod(authUsers, 'created_at', 7),
        newUsersMonth: inPeriod(authUsers, 'created_at', 30),
      },
      content: {
        totalPosts: posts.length,
        totalPhotos: posts.filter((post) => contentType(post) === 'photo').length,
        totalReels: posts.filter((post) => contentType(post) === 'reel').length,
        totalYoutube: posts.filter((post) => contentType(post) === 'youtube').length,
        totalText: posts.filter((post) => contentType(post) === 'text').length,
        totalStories: stories.length,
        postsToday: inPeriod(posts, 'created_at', 1),
        postsWeek: inPeriod(posts, 'created_at', 7),
        postsMonth: inPeriod(posts, 'created_at', 30),
        photosToday: inPeriod(posts.filter((post) => contentType(post) === 'photo'), 'created_at', 1),
        photosWeek: inPeriod(posts.filter((post) => contentType(post) === 'photo'), 'created_at', 7),
        photosMonth: inPeriod(posts.filter((post) => contentType(post) === 'photo'), 'created_at', 30),
        reelsToday: inPeriod(posts.filter((post) => contentType(post) === 'reel'), 'created_at', 1),
        reelsWeek: inPeriod(posts.filter((post) => contentType(post) === 'reel'), 'created_at', 7),
        reelsMonth: inPeriod(posts.filter((post) => contentType(post) === 'reel'), 'created_at', 30),
        storiesToday: inPeriod(stories, 'created_at', 1),
        storiesWeek: inPeriod(stories, 'created_at', 7),
        storiesMonth: inPeriod(stories, 'created_at', 30),
      },
      engagement: {
        totalLikes: reactions.filter((reaction) => reaction.type === 'like').length || sum(posts, 'likes_count'),
        totalPostFire: reactions.filter((reaction) => reaction.type === 'fire').length || sum(posts, 'fire_count'),
        totalComments: comments.length,
        totalFollows: follows.length,
        likesToday: inPeriod(reactions.filter((reaction) => reaction.type === 'like'), 'created_at', 1),
        likesWeek: inPeriod(reactions.filter((reaction) => reaction.type === 'like'), 'created_at', 7),
        likesMonth: inPeriod(reactions.filter((reaction) => reaction.type === 'like'), 'created_at', 30),
        commentsToday: inPeriod(comments, 'created_at', 1),
        commentsWeek: inPeriod(comments, 'created_at', 7),
        commentsMonth: inPeriod(comments, 'created_at', 30),
        followsToday: inPeriod(follows, 'created_at', 1),
        followsWeek: inPeriod(follows, 'created_at', 7),
        followsMonth: inPeriod(follows, 'created_at', 30),
      },
      vip: {
        totalVIP: activeSubs.length,
        giftedVip: activeSubs.filter((sub) => sub.provider === 'admin_gift').length,
        paidVip: activeSubs.filter((sub) => sub.provider && sub.provider !== 'admin_gift').length,
        expiredVip: subscriptions.filter((sub) => sub.status !== 'active').length,
        vipByPlan: activeSubs.reduce((acc, sub) => {
          const plan = planOf(sub);
          acc[plan] = (acc[plan] || 0) + 1;
          return acc;
        }, {}),
        vipToday: inPeriod(activeSubs, 'created_at', 1),
        vipWeek: inPeriod(activeSubs, 'created_at', 7),
        vipMonth: inPeriod(activeSubs, 'created_at', 30),
      },
      moderation: {
        totalReports: reports.length,
        pendingReports: reports.filter((report) => !report.status || report.status === 'pending').length,
        postReports: reports.filter((report) => report.reported_post_id || report.target_type === 'post').length,
        userReports: reports.filter((report) => report.reported_user_id || report.target_type === 'user').length,
        totalBlocks: blocks.length,
      },
      topCreators: Object.entries(postCounts)
        .map(([userId, count]) => ({
          userId,
          username: profileByUserId[userId]?.username || profileByUserId[userId]?.full_name || 'user',
          avatar: profileByUserId[userId]?.avatar_url || '',
          posts: count,
        }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 10),
      topPosts: [...posts]
        .sort((a, b) =>
          (Number(b.likes_count || 0) + Number(b.comments_count || 0) + Number(b.fire_count || 0)) -
          (Number(a.likes_count || 0) + Number(a.comments_count || 0) + Number(a.fire_count || 0))
        )
        .slice(0, 10)
        .map((post) => ({
          id: post.id,
          type: contentType(post),
          author: post.author_username || post.author_name || 'user',
          caption: post.caption,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
        })),
      growthTrend: trendRows(authUsers, posts, stories),
    };

    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin analytics request failed' });
  }
}
