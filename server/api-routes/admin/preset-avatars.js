import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    await requireAdmin(req);

    if (req.method === 'GET') {
      const avatars = await supabaseTable('preset_avatars', {
        serviceRole: true,
        query: '?order=sort_order.asc&limit=500',
      });
      return sendJson(res, 200, { avatars });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body.image_url) return sendJson(res, 400, { error: 'image_url is required' });
      const rows = await supabaseTable('preset_avatars', {
        method: 'POST',
        serviceRole: true,
        body: {
          image_url: body.image_url,
          label: body.label || '',
          gender: body.gender || 'unisex',
          sort_order: Number(body.sort_order || 0),
          is_active: body.is_active !== false,
        },
      });
      return sendJson(res, 201, { avatar: rows[0] });
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const id = body.id;
      if (!id) return sendJson(res, 400, { error: 'Missing avatar id' });
      const updates = {};
      ['image_url', 'label', 'gender', 'is_active'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
      });
      if (Object.prototype.hasOwnProperty.call(body, 'sort_order')) updates.sort_order = Number(body.sort_order || 0);
      updates.updated_at = new Date().toISOString();
      const rows = await supabaseTable('preset_avatars', {
        method: 'PATCH',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(id)}`,
        body: updates,
      });
      return sendJson(res, 200, { avatar: rows[0] });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url, 'http://spicey.local');
      const id = url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { error: 'Missing avatar id' });
      await supabaseTable('preset_avatars', {
        method: 'DELETE',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(id)}`,
        headers: { Prefer: 'return=minimal' },
      });
      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin preset avatars request failed' });
  }
}
