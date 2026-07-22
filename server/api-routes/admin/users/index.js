import { handleOptions, readJson, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseAdminAuth, supabaseTable } from '../../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com', 'qa.admin.20260722@spicey.live']);

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

function normalizeUser(authUser, profile) {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name || metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'User',
    role: ADMIN_EMAILS.has(authUser.email) ? 'admin' : 'user',
    created_date: authUser.created_at,
    created_at: authUser.created_at,
    last_sign_in_at: authUser.last_sign_in_at,
    profile: profile || null,
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const admin = await requireAdmin(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const page = url.searchParams.get('page') || '1';
      const perPage = url.searchParams.get('perPage') || url.searchParams.get('per_page') || '500';
      const authData = await supabaseAdminAuth(`/users?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(perPage)}`);
      const authUsers = authData.users || [];
      const userIds = authUsers.map((user) => user.id).filter(Boolean);
      const profiles = userIds.length
        ? await supabaseTable('profiles', {
            serviceRole: true,
            query: `?user_id=in.(${userIds.map(encodeURIComponent).join(',')})`,
          })
        : [];
      const profileByUserId = Object.fromEntries(profiles.map((profile) => [profile.user_id, profile]));

      return sendJson(res, 200, {
        users: authUsers.map((user) => normalizeUser(user, profileByUserId[user.id])),
        profiles,
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const message = String(body.message || '').trim();
      if (!message) return sendJson(res, 400, { error: 'Missing message' });

      let recipients = [];
      if (body.send_to_all) {
        recipients = await supabaseTable('profiles', {
          serviceRole: true,
          query: '?select=user_id,username,full_name,email&limit=10000',
        });
      } else if (Array.isArray(body.target_user_ids) && body.target_user_ids.length) {
        recipients = await supabaseTable('profiles', {
          serviceRole: true,
          query: `?user_id=in.(${body.target_user_ids.map(encodeURIComponent).join(',')})`,
        });
      } else if (body.user_id || body.userId) {
        recipients = await supabaseTable('profiles', {
          serviceRole: true,
          query: `?user_id=eq.${encodeURIComponent(body.user_id || body.userId)}&limit=1`,
        });
      } else if (body.email) {
        recipients = await supabaseTable('profiles', {
          serviceRole: true,
          query: `?email=ilike.${encodeURIComponent(body.email)}&limit=1`,
        });
      }

      if (!recipients.length) return sendJson(res, 404, { error: 'Recipient profile not found' });

      const rows = await supabaseTable('notifications', {
        method: 'POST',
        serviceRole: true,
        body: recipients.map((recipient) => ({
          user_id: recipient.user_id,
          actor_id: admin.id,
          actor_username: 'Spicey Admin',
          actor_avatar: null,
          type: 'admin_message',
          message: body.subject ? `${body.subject}: ${message}` : message,
          read: false,
        })),
      });

      return sendJson(res, 201, {
        success: true,
        delivery: 'in_app_notification',
        sent: rows.length,
        failed: 0,
        notification: rows[0],
      });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin users request failed' });
  }
}
