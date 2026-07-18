import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function profileFromUser(user) {
  const meta = user.user_metadata || {};
  const email = user.email || '';
  return {
    user_id: user.id,
    email,
    username: meta.username || email.split('@')[0] || 'user',
    full_name: meta.full_name || meta.name || email.split('@')[0] || 'User',
    avatar_url: meta.avatar_url || '',
  };
}

async function getProfile(token, user) {
  const rows = await supabaseTable('profiles', {
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
  });
  if (rows[0]) return rows[0];

  const created = await supabaseTable('profiles', {
    method: 'POST',
    serviceRole: true,
    body: profileFromUser(user),
  });
  return created[0];
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const profile = await getProfile(token, user);
      return sendJson(res, 200, { profile, user });
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const allowed = [
        'username',
        'full_name',
        'bio',
        'avatar_url',
        'avatar_3d_url',
        'cover_url',
        'location',
        'website',
        'is_private',
        'profile_theme',
        'push_token',
        'voip_push_token',
        'platform',
      ];
      const updates = {};
      allowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
      });
      updates.updated_at = new Date().toISOString();

      await getProfile(token, user);
      const rows = await supabaseTable('profiles', {
        method: 'PATCH',
        serviceRole: true,
        query: `?user_id=eq.${encodeURIComponent(user.id)}`,
        body: updates,
      });

      return sendJson(res, 200, { profile: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Profile request failed' });
  }
}
