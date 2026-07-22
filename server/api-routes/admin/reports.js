import { handleOptions, sendJson, setCors } from '../_lib/http.js';
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
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await requireAdmin(req);
    const url = new URL(req.url, 'http://spicey.local');
    const limit = url.searchParams.get('limit') || '100';
    const reports = await supabaseTable('reports', {
      serviceRole: true,
      query: `?order=created_at.desc&limit=${encodeURIComponent(limit)}`,
    });
    return sendJson(res, 200, { reports });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin reports request failed' });
  }
}
