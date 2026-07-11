import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseAdminAuth, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com']);

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

async function listAuthUsers() {
  const users = [];
  let page = 1;
  const perPage = 1000;

  while (page <= 10) {
    const data = await supabaseAdminAuth(`/users?page=${page}&per_page=${perPage}`);
    const batch = data.users || [];
    users.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await requireAdmin(req);

    const [authUsers, profiles, posts, messages, chats] = await Promise.all([
      listAuthUsers(),
      supabaseTable('profiles', { serviceRole: true, query: '?select=id,user_id,email,username,created_at&limit=10000' }).catch(() => []),
      supabaseTable('posts', { serviceRole: true, query: '?select=id,author_id&limit=10000' }).catch(() => []),
      supabaseTable('messages', { serviceRole: true, query: '?select=id,sender_id&limit=10000' }).catch(() => []),
      supabaseTable('chats', { serviceRole: true, query: '?select=id,participant_ids&limit=10000' }).catch(() => []),
    ]);

    const profileByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));
    const authUserIds = new Set(authUsers.map((user) => user.id));
    const usersMissingProfiles = authUsers
      .filter((user) => !profileByUserId.has(user.id))
      .map((user) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      }));

    const referencedUserIds = new Set();
    posts.forEach((post) => { if (post.author_id) referencedUserIds.add(post.author_id); });
    messages.forEach((message) => { if (message.sender_id) referencedUserIds.add(message.sender_id); });
    chats.forEach((chat) => {
      (chat.participant_ids || []).forEach((id) => { if (id) referencedUserIds.add(id); });
    });

    const referencedUsersMissingAuth = [...referencedUserIds].filter((id) => !authUserIds.has(id));

    const status = {
      checked_at: new Date().toISOString(),
      auth_users: authUsers.length,
      profiles: profiles.length,
      users_missing_profiles: usersMissingProfiles.length,
      users_missing_profiles_sample: usersMissingProfiles.slice(0, 10),
      referenced_users_missing_auth: referencedUsersMissingAuth.length,
      referenced_users_missing_auth_sample: referencedUsersMissingAuth.slice(0, 10),
      content_counts: {
        posts: posts.length,
        messages: messages.length,
        chats: chats.length,
      },
      base44_requirements: [
        'Base44 auth users export with original user IDs and emails',
        'UserProfile export JSON from Base44',
        'ID mapping file if Supabase creates new auth UUIDs',
        'Password reset email flow for users because hashed passwords usually cannot be migrated directly',
      ],
      next_safe_steps: [
        'Ask Base44 support for auth users export before importing old user-owned records',
        'Create or import Supabase Auth users first',
        'Import profiles after auth users exist',
        'Import posts, chats, messages, reactions, follows, and subscriptions after user IDs are mapped',
      ],
    };

    return sendJson(res, 200, { status });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Migration status request failed' });
  }
}
