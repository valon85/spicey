import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com']);
const TABLES = {
  post: 'posts',
  posts: 'posts',
  story: 'stories',
  stories: 'stories',
  comment: 'comments',
  comments: 'comments',
};

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

function tableFor(type) {
  const table = TABLES[String(type || '').toLowerCase()];
  if (!table) throw new Error('Invalid content type');
  return table;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    await requireAdmin(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const type = url.searchParams.get('type') || 'posts';
      const limit = url.searchParams.get('limit') || '100';
      const table = tableFor(type);
      const rows = await supabaseTable(table, {
        serviceRole: true,
        query: `?order=created_at.desc&limit=${encodeURIComponent(limit)}`,
      });
      return sendJson(res, 200, { [table]: rows, items: rows });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url, 'http://spicey.local');
      const type = url.searchParams.get('type');
      const id = url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { error: 'Missing content id' });
      const table = tableFor(type);
      await supabaseTable(table, {
        method: 'DELETE',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(id)}`,
        headers: { Prefer: 'return=minimal' },
      });
      return sendJson(res, 200, { success: true });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (body.action !== 'cleanup_damaged_images') {
        return sendJson(res, 400, { error: 'Unsupported admin content action' });
      }
      const posts = await supabaseTable('posts', {
        serviceRole: true,
        query: '?select=id,image_url,image_urls&order=created_at.desc&limit=500',
      }).catch(() => []);
      const candidates = posts.filter((post) => {
        const primary = String(post.image_url || '').trim();
        return primary === '' && Array.isArray(post.image_urls) && post.image_urls.length === 0;
      });
      return sendJson(res, 200, {
        removed_count: 0,
        candidate_count: candidates.length,
        message: 'Safe scan complete. No media was deleted automatically.',
      });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin content request failed' });
  }
}
