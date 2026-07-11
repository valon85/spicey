import { spiceySession } from './spiceyApi';

const env = import.meta.env || {};
const SUPABASE_URL = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';

const TABLE_NAMES = {
  AdCampaign: 'ad_campaigns',
  Block: 'blocks',
  CallSession: 'call_sessions',
  Chat: 'chats',
  Comment: 'comments',
  CuratedReel: 'curated_reels',
  Follow: 'follows',
  FollowRequest: 'follow_requests',
  LegalConsent: 'legal_consents',
  LiveSession: 'live_sessions',
  Message: 'messages',
  MissedCall: 'missed_calls',
  Notification: 'notifications',
  Post: 'posts',
  PostBoost: 'post_boosts',
  PresetAvatar: 'preset_avatars',
  ProfileCategory: 'profile_categories',
  ProfilePhotoComment: 'profile_photo_comments',
  ProfilePhotoReaction: 'profile_photo_reactions',
  Reaction: 'reactions',
  Report: 'reports',
  StockVideo: 'stock_videos',
  Story: 'stories',
  Subscription: 'subscriptions',
  User: 'profiles',
  UserProfile: 'profiles',
};

const ENTITY_NAMES = Object.keys(TABLE_NAMES);

function requireSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  }
}

function tableFor(entityName) {
  const table = TABLE_NAMES[entityName];
  if (!table) throw new Error(`No Supabase table mapping for entity "${entityName}".`);
  return table;
}

function normalizeSort(sort) {
  if (!sort || typeof sort !== 'string') return null;
  const ascending = !sort.startsWith('-');
  const column = ascending ? sort : sort.slice(1);
  if (!column) return null;
  const mappedColumn = column === 'created_date' ? 'created_at' : column;
  return `${mappedColumn}.${ascending ? 'asc' : 'desc'}`;
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

async function rest(table, { method = 'GET', query = '', body, single = false } = {}) {
  requireSupabase();
  const token = spiceySession.token();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(method !== 'GET' ? { Prefer: 'return=representation' } : {}),
      ...(single ? { Accept: 'application/vnd.pgrst.object+json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    throw new Error(`Supabase returned non-JSON from ${table}.`);
  }
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase request failed (${response.status})`);
  return data;
}

function normalizeListArgs(sortOrOptions, limit) {
  if (typeof sortOrOptions === 'object' && sortOrOptions !== null) {
    return {
      sort: sortOrOptions.sort || sortOrOptions.orderBy || '',
      limit: sortOrOptions.limit,
    };
  }
  return { sort: sortOrOptions || '', limit };
}

function normalizeFilterKey(key) {
  if (key === 'created_date') return 'created_at';
  return key;
}

function makeEntity(entityName) {
  const table = tableFor(entityName);

  return {
    async list(sortOrOptions = '', limit) {
      const options = normalizeListArgs(sortOrOptions, limit);
      const order = normalizeSort(options.sort);
      return rest(table, {
        query: buildQuery({
          order,
          limit: options.limit,
        }),
      });
    },

    async filter(filters = {}, sortOrOptions = '', limit) {
      const options = normalizeListArgs(sortOrOptions, limit);
      const query = {};
      Object.entries(filters || {}).forEach(([key, value]) => {
        query[normalizeFilterKey(key)] = String(value).startsWith('eq.') ? value : `eq.${value}`;
      });
      const order = normalizeSort(options.sort);
      return rest(table, {
        query: buildQuery({
          ...query,
          order,
          limit: options.limit,
        }),
      });
    },

    async get(id) {
      return rest(table, { query: buildQuery({ id: `eq.${id}`, limit: 1 }), single: true });
    },

    async create(payload = {}) {
      const rows = await rest(table, { method: 'POST', body: payload });
      return Array.isArray(rows) ? rows[0] : rows;
    },

    async update(id, payload = {}) {
      const rows = await rest(table, {
        method: 'PATCH',
        query: buildQuery({ id: `eq.${id}` }),
        body: payload,
      });
      return Array.isArray(rows) ? rows[0] : rows;
    },

    async delete(id) {
      await rest(table, { method: 'DELETE', query: buildQuery({ id: `eq.${id}` }) });
      return { success: true };
    },

    subscribe() {
      return () => {};
    },
  };
}

const entities = Object.fromEntries(ENTITY_NAMES.map((entityName) => [entityName, makeEntity(entityName)]));

const auth = {
  async me() {
    requireSupabase();
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${spiceySession.token() || SUPABASE_ANON_KEY}`,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || 'Not authenticated');
    return data;
  },
  async getToken() {
    return spiceySession.token();
  },
  async setToken(token) {
    if (token) spiceySession.set({ access_token: token, token_type: 'bearer' });
  },
  async logout() {
    spiceySession.clear();
  },
  async updateMe(payload = {}) {
    const profileRows = await rest('profiles', {
      method: 'PATCH',
      query: buildQuery({ user_id: `eq.${(await auth.me()).id}` }),
      body: payload,
    });
    return profileRows?.[0] || payload;
  },
};

const functions = {
  async invoke(name) {
    throw new Error(`Function "${name}" must be handled by src/api/base44Client.js.`);
  },
};

const integrations = {
  Core: {
    async UploadFile() {
      throw new Error('UploadFile must be handled by src/api/base44Client.js.');
    },
  },
};

export const supabaseApi = {
  auth,
  entities,
  functions,
  integrations,
  asServiceRole: { entities },
  tableFor,
  ...entities,
};

export const User = { ...entities.User, me: auth.me, list: entities.User.list };
export const Post = entities.Post;
export const Chat = entities.Chat;
export const Message = entities.Message;
export const Reaction = entities.Reaction;
export const Comment = entities.Comment;

export default supabaseApi;
