import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);

async function requireAdmin(req) {
  const { token, user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return { token, user };
}

function parseTags(tags) {
  if (!tags) return {};
  if (typeof tags === 'object') return tags;
  try {
    return JSON.parse(tags);
  } catch (_) {
    return {};
  }
}

function normalizeReel(post) {
  const tags = parseTags(post.tags);
  return {
    ...post,
    title: tags.title || post.caption || 'Untitled reel',
    thumbnail_url: tags.thumbnail_url || post.image_url || '',
    youtube_url: tags.youtube_url || post.video_link || '',
    category: tags.category || 'trending',
    source: tags.source || 'admin_upload',
    is_active: post.visibility !== 'hidden',
    is_featured: Boolean(tags.is_featured),
    duration_seconds: Number(tags.duration_seconds || 0),
    stock_tags: tags.stock_tags || [],
    views_count: tags.views_count || 0,
    likes_count: post.likes_count || 0,
  };
}

async function currentProfile(user) {
  const profiles = await supabaseTable('profiles', {
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
  }).catch(() => []);
  return profiles[0] || {};
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await requireAdmin(req);

    if (req.method === 'GET') {
      const posts = await supabaseTable('posts', {
        serviceRole: true,
        query: '?post_type=eq.reel&order=created_at.desc&limit=500',
      });
      return sendJson(res, 200, { reels: posts.map(normalizeReel) });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const videoUrl = String(body.video_url || '').trim();
      if (!videoUrl) return sendJson(res, 400, { error: 'Video URL is required' });
      const profile = await currentProfile(user);
      const tags = {
        title: body.title || body.caption || 'Curated reel',
        thumbnail_url: body.thumbnail_url || '',
        youtube_url: body.youtube_url || '',
        category: body.category || 'trending',
        source: body.source || 'admin_upload',
        is_featured: Boolean(body.is_featured),
        duration_seconds: Number(body.duration_seconds || 0),
        stock_tags: Array.isArray(body.tags) ? body.tags : [],
      };
      const rows = await supabaseTable('posts', {
        method: 'POST',
        serviceRole: true,
        body: {
          author_id: user.id,
          author_name: body.author_name || profile.full_name || 'Spicey Admin',
          author_username: String(body.author_username || profile.username || 'spicey').replace(/^@/, ''),
          author_avatar: profile.avatar_url || '',
          caption: body.caption || body.title || '',
          post_type: 'reel',
          visibility: 'public',
          image_url: body.thumbnail_url || null,
          video_url: videoUrl,
          video_link: body.youtube_url || null,
          tags: JSON.stringify(tags),
          hashtags: body.hashtags || [],
        },
      });
      return sendJson(res, 201, { reel: normalizeReel(rows[0]) });
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const id = body.id || body.reel_id || body.reelId;
      if (!id) return sendJson(res, 400, { error: 'Missing reel id' });
      const updates = { updated_at: new Date().toISOString() };
      if (Object.prototype.hasOwnProperty.call(body, 'is_active')) {
        updates.visibility = body.is_active ? 'public' : 'hidden';
      }
      const metadataKeys = ['is_featured', 'duration_seconds', 'category', 'source', 'thumbnail_url', 'title'];
      const metadataUpdates = {};
      metadataKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) metadataUpdates[key] = body[key];
      });
      if (Object.keys(metadataUpdates).length) {
        const current = await supabaseTable('posts', {
          serviceRole: true,
          query: `?id=eq.${encodeURIComponent(id)}&post_type=eq.reel&limit=1`,
        });
        const tags = parseTags(current[0]?.tags);
        updates.tags = JSON.stringify({ ...tags, ...metadataUpdates });
      }
      const rows = await supabaseTable('posts', {
        method: 'PATCH',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(id)}&post_type=eq.reel`,
        body: updates,
      });
      return sendJson(res, 200, { reel: normalizeReel(rows[0]) });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url, 'http://spicey.local');
      const id = url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { error: 'Missing reel id' });
      await supabaseTable('posts', {
        method: 'DELETE',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(id)}&post_type=eq.reel`,
        headers: { Prefer: 'return=minimal' },
      });
      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin reels request failed' });
  }
}
