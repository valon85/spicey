const API_BASE_URL = (import.meta.env.VITE_SPICEY_API_URL || '').replace(/\/$/, '');
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SESSION_KEY = 'spicey_session';
const NATIVE_PASSWORD_RESET_REDIRECT = 'spicey://localhost/auth/reset-password';

export const spiceySession = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (_) {
      return null;
    }
  },
  set(session) {
    if (!session) return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
  },
  token() {
    return this.get()?.access_token || null;
  },
};

function isNativeApp() {
  return typeof window !== 'undefined' && ['capacitor:', 'spicey:'].includes(window.location.protocol);
}

function passwordResetRedirect() {
  if (typeof window === 'undefined' || isNativeApp()) return NATIVE_PASSWORD_RESET_REDIRECT;
  return `${window.location.origin}/auth/reset-password`;
}

function isLocalPreview() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function isFetchFailure(error) {
  return /failed to fetch|networkerror|load failed/i.test(error?.message || '');
}

function toSession(data = {}) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at || (data.expires_in ? Math.floor(Date.now() / 1000) + Number(data.expires_in) : undefined),
    token_type: data.token_type || 'bearer',
  };
}

async function supabaseAuthRequest(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for iOS login.');
  }

  const token = options.token || spiceySession.token();
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: options.method || 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    throw new Error(`Supabase returned a non-JSON response (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.message || data.error || `Supabase auth error (${response.status})`);
  }

  return data;
}

async function refreshSupabaseSession() {
  const refreshToken = spiceySession.get()?.refresh_token;
  if (!refreshToken) throw new Error('Session expired. Please log in again.');

  const data = await supabaseAuthRequest('/token?grant_type=refresh_token', {
    method: 'POST',
    token: SUPABASE_ANON_KEY,
    body: { refresh_token: refreshToken },
  });
  const session = toSession(data);
  if (session.access_token) spiceySession.set(session);
  return { session, user: data.user };
}

function useDirectSupabase() {
  return !API_BASE_URL;
}

function useDirectSupabaseAuth() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function findSupabaseCodeVerifier() {
  if (typeof window === 'undefined') return '';
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i) || '';
      if (!/code.*verifier|verifier.*code/i.test(key)) continue;
      const value = storage.getItem(key);
      if (!value) continue;
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'string') return parsed;
        if (parsed?.code_verifier) return parsed.code_verifier;
      } catch (_) {
        return value;
      }
    }
  }
  return '';
}

async function supabaseRest(table, { method = 'GET', query = '', body, token, single = false } = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase URL or publishable key.');
  }

  const accessToken = token || spiceySession.token();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
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
    throw new Error(`Supabase returned a non-JSON response (${response.status}) from ${table}.`);
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error_description || data?.error || `Supabase request failed (${response.status})`);
  }

  return data;
}

function queryString(params = {}) {
  const clean = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') clean.set(key, String(value));
  });
  const str = clean.toString();
  return str ? `?${str}` : '';
}

async function currentSupabaseUser() {
  const user = await supabaseAuthRequest('/user');
  return user;
}

function profileFromUser(user = {}) {
  const meta = user.user_metadata || {};
  const email = user.email || '';
  return {
    user_id: user.id,
    email,
    username: meta.username || email.split('@')[0] || 'spicey',
    full_name: meta.full_name || meta.name || email.split('@')[0] || 'Spicey User',
    bio: meta.bio || '',
    avatar_url: meta.avatar_url || '',
  };
}

async function updateSupabaseUserMetadata(payload = {}, user = null) {
  const currentMeta = user?.user_metadata || {};
  const allowedKeys = ['username', 'full_name', 'name', 'avatar_url', 'bio'];
  const data = {};
  allowedKeys.forEach((key) => {
    if (payload[key] !== undefined) data[key] = payload[key];
  });
  if (!Object.keys(data).length) return user;
  return supabaseAuthRequest('/user', {
    method: 'PUT',
    body: { data: { ...currentMeta, ...data } },
  });
}

async function getOrCreateProfile(user = null) {
  const authUser = user || await currentSupabaseUser();
  const rows = await supabaseRest('profiles', {
    query: queryString({
      user_id: `eq.${authUser.id}`,
      limit: 1,
    }),
  });
  if (rows?.[0]) return rows[0];

  try {
    const created = await supabaseRest('profiles', {
      method: 'POST',
      body: profileFromUser(authUser),
    });
    return created?.[0] || profileFromUser(authUser);
  } catch (error) {
    console.warn('[Spicey] Could not create profile row, using auth metadata fallback:', error.message);
    return profileFromUser(authUser);
  }
}

async function profilesByUserIds(userIds = []) {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return {};
  const ids = unique.map((id) => `"${id}"`).join(',');
  const rows = await supabaseRest('profiles', {
    query: `?user_id=in.(${ids})`,
  }).catch(() => []);
  return rows.reduce((map, profile) => {
    map[profile.user_id] = profile;
    return map;
  }, {});
}

async function apiRequest(path, options = {}, retryAuth = true) {
  const token = spiceySession.token();
  if (!token) {
    throw new Error('No authenticated session token is available. Please log in again.');
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    const nativeHint = isNativeApp() && !API_BASE_URL
      ? ' Native iOS needs VITE_SPICEY_API_URL for app APIs, or direct Supabase support for this action.'
      : '';
    throw new Error(`Expected JSON from Spicey API but received HTML/text from ${path}.${nativeHint}`);
  }

  if (!response.ok && retryAuth && (response.status === 401 || response.status === 403) && spiceySession.get()?.refresh_token) {
    await refreshSupabaseSession();
    return apiRequest(path, options, false);
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Spicey API error (${response.status})`);
  }

  return data;
}

export const spiceyApi = {
  auth: {
    async me() {
      if (useDirectSupabaseAuth()) {
        let user;
        try {
          user = await supabaseAuthRequest('/user');
        } catch (error) {
          if (!/expired|invalid jwt/i.test(error.message || '')) throw error;
          const refreshed = await refreshSupabaseSession();
          user = refreshed.user || await supabaseAuthRequest('/user');
        }
        return { user };
      }
      return apiRequest('/api/auth/me');
    },
    async login({ email, password }) {
      if (useDirectSupabaseAuth()) {
        try {
          const data = await supabaseAuthRequest('/token?grant_type=password', {
            method: 'POST',
            body: { email: email.trim().toLowerCase(), password },
          });
          const session = toSession(data);
          const result = { session, user: data.user };
          if (session.access_token) spiceySession.set(session);
          return result;
        } catch (error) {
          if (!isLocalPreview() || !isFetchFailure(error)) throw error;
        }
      }
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.session) spiceySession.set(data.session);
      return data;
    },
    async signup({ email, password, fullName, username, legalAccepted, legalVersion }) {
      if (legalAccepted !== true) throw new Error('You must accept the legal policies to create an account.');
      if (useDirectSupabaseAuth()) {
        try {
          const cleanEmail = email.trim().toLowerCase();
          const data = await supabaseAuthRequest('/signup', {
            method: 'POST',
            body: {
              email: cleanEmail,
              password,
              data: {
                full_name: fullName || '',
                username: username || cleanEmail.split('@')[0],
                legal_accepted_at: new Date().toISOString(),
                legal_version: legalVersion || '3.0',
              },
            },
          });
          const session = data.access_token ? toSession(data) : null;
          const result = { session, user: data.user, needs_email_confirmation: !data.access_token };
          if (session?.access_token) spiceySession.set(session);
          return result;
        } catch (error) {
          if (!isLocalPreview() || !isFetchFailure(error)) throw error;
        }
      }
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName, username, legalAccepted, legalVersion }),
      });
      if (data.session) spiceySession.set(data.session);
      return data;
    },
    async forgotPassword({ email }) {
      const redirectTo = passwordResetRedirect();
      if (useDirectSupabaseAuth()) {
        try {
          await supabaseAuthRequest(`/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
            method: 'POST',
            body: { email: email.trim().toLowerCase() },
          });
          return { ok: true };
        } catch (error) {
          if (!isLocalPreview() || !isFetchFailure(error)) throw error;
        }
      }
      return apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email, redirectTo }),
      });
    },
    async exchangeRecoveryCode(code) {
      if (!code) throw new Error('Reset code is missing.');
      if (useDirectSupabaseAuth()) {
        const codeVerifier = findSupabaseCodeVerifier();
        const data = await supabaseAuthRequest('/token?grant_type=pkce', {
          method: 'POST',
          token: SUPABASE_ANON_KEY,
          body: {
            auth_code: code,
            ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
          },
        });
        const session = toSession(data);
        if (session.access_token) spiceySession.set(session);
        return { user: data.user, session };
      }
      throw new Error('Reset link is expired. Please request a new password email.');
    },
    async verifyRecoveryToken(tokenHash) {
      if (!tokenHash) throw new Error('Reset token is missing.');
      if (useDirectSupabaseAuth()) {
        const data = await supabaseAuthRequest('/verify', {
          method: 'POST',
          token: SUPABASE_ANON_KEY,
          body: { type: 'recovery', token_hash: tokenHash },
        });
        const session = toSession(data);
        if (session.access_token) spiceySession.set(session);
        return { user: data.user, session };
      }
      throw new Error('Reset link is expired. Please request a new password email.');
    },
    async updatePassword({ accessToken, refreshToken, password }) {
      try {
        const data = await supabaseAuthRequest('/user', {
          method: 'PUT',
          token: accessToken,
          body: { password },
        });
        const session = toSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (session.access_token) spiceySession.set(session);
        return { user: data, session };
      } catch (error) {
        if (!isLocalPreview() || !isFetchFailure(error)) throw error;
      }
      const data = await apiRequest('/api/auth/update-password', {
        method: 'POST',
        body: JSON.stringify({ accessToken, refreshToken, password }),
      });
      if (data.session) spiceySession.set(data.session);
      return data;
    },
    logout() {
      spiceySession.clear();
    },
  },
  ai: {
    getRealtimeSession({ voice = 'coral', language = 'en' } = {}) {
      return apiRequest('/api/openai/realtime-session', {
        method: 'POST',
        body: JSON.stringify({ voice, language }),
      });
    },
    text({ prompt, max_output_tokens } = {}) {
      return apiRequest('/api/openai/text', {
        method: 'POST',
        body: JSON.stringify({ prompt, max_output_tokens }),
      });
    },
    voiceChat(payload = {}) {
      return apiRequest('/api/openai/voice-chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    enhanceImage({ image_url, prompt } = {}) {
      return apiRequest('/api/openai/image-edit', {
        method: 'POST',
        body: JSON.stringify({ image_url, prompt }),
      });
    },
    generateImage({ prompt } = {}) {
      return apiRequest('/api/openai/image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
    },
  },
  posts: {
    async list(params = {}) {
      if (useDirectSupabase()) {
        const restParams = {
          order: 'created_at.desc',
          limit: params.limit || 50,
        };
        if (params.authorId || params.author_id) restParams.author_id = `eq.${params.authorId || params.author_id}`;
        if (params.postType || params.post_type) restParams.post_type = `eq.${params.postType || params.post_type}`;
        if (params.location) restParams.location = `ilike.*${params.location}*`;
        const posts = await supabaseRest('posts', { query: queryString(restParams) });
        return { posts };
      }
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/posts${query ? `?${query}` : ''}`);
    },
    async create(payload) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const profile = await getOrCreateProfile(user);
        const created = await supabaseRest('posts', {
          method: 'POST',
          body: {
            author_id: user.id,
            author_name: profile.full_name || user.email?.split('@')[0] || 'User',
            author_username: profile.username || user.email?.split('@')[0] || 'user',
            author_avatar: profile.avatar_url || '',
            caption: payload.caption || '',
            post_type: payload.post_type || 'feed',
            visibility: payload.visibility || 'public',
            image_url: payload.image_url || null,
            image_urls: payload.image_urls || [],
            video_url: payload.video_url || null,
            video_link: payload.video_link || null,
            location: payload.location || null,
            hashtags: payload.hashtags || [],
            tags: payload.tags || null,
            music_title: payload.music_title || null,
            music_artist: payload.music_artist || null,
            music_preview_url: payload.music_preview_url || null,
            music_artwork_url: payload.music_artwork_url || null,
          },
        });
        return { post: created?.[0] };
      }
      return apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async update(id, payload) {
      if (useDirectSupabase()) {
        const updated = await supabaseRest('posts', {
          method: 'PATCH',
          query: queryString({ id: `eq.${id}` }),
          body: { ...payload, updated_at: new Date().toISOString() },
        });
        return { post: updated?.[0] };
      }
      return apiRequest(`/api/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    async delete(id) {
      if (useDirectSupabase()) {
        await supabaseRest('posts', { method: 'DELETE', query: queryString({ id: `eq.${id}` }) });
        return { ok: true };
      }
      return apiRequest(`/api/posts/${id}`, { method: 'DELETE' });
    },
  },
  reactions: {
    async list(postId) {
      if (useDirectSupabase()) {
        const reactions = await supabaseRest('reactions', {
          query: queryString({ post_id: `eq.${postId}`, order: 'created_at.desc', limit: 200 }),
        });
        const profiles = await profilesByUserIds(reactions.map((reaction) => reaction.user_id));
        return { reactions: reactions.map((reaction) => ({ ...reaction, profile: profiles[reaction.user_id] || null })) };
      }
      return apiRequest(`/api/reactions?postId=${encodeURIComponent(postId)}`);
    },
    async create(payload) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const type = payload.type || 'like';
        const postId = payload.post_id;
        const existing = await supabaseRest('reactions', {
          query: queryString({ post_id: `eq.${postId}`, user_id: `eq.${user.id}`, type: `eq.${type}`, limit: 1 }),
        });
        if (existing?.[0]) {
          await supabaseRest('reactions', { method: 'DELETE', query: queryString({ id: `eq.${existing[0].id}` }) });
          return { action: 'removed', newCount: null };
        }
        const created = await supabaseRest('reactions', {
          method: 'POST',
          body: { post_id: postId, user_id: user.id, type },
        });
        return { action: 'added', reaction: created?.[0], newCount: null };
      }
      return apiRequest('/api/reactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async delete(id) {
      if (useDirectSupabase()) {
        await supabaseRest('reactions', { method: 'DELETE', query: queryString({ id: `eq.${id}` }) });
        return { ok: true };
      }
      return apiRequest(`/api/reactions/${id}`, { method: 'DELETE' });
    },
  },
  comments: {
    async list(postId) {
      if (useDirectSupabase()) {
        const comments = await supabaseRest('comments', {
          query: queryString({ post_id: `eq.${postId}`, order: 'created_at.desc', limit: 100 }),
        });
        return { comments };
      }
      return apiRequest(`/api/comments?postId=${encodeURIComponent(postId)}`);
    },
    async create(payload) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const profile = await getOrCreateProfile(user);
        const created = await supabaseRest('comments', {
          method: 'POST',
          body: {
            post_id: payload.post_id,
            author_id: user.id,
            text: payload.text,
            author_name: profile.full_name || user.email?.split('@')[0] || 'User',
            author_username: profile.username || user.email?.split('@')[0] || 'user',
            author_avatar: profile.avatar_url || '',
          },
        });
        return { comment: created?.[0] };
      }
      return apiRequest('/api/comments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async delete(id) {
      if (useDirectSupabase()) {
        await supabaseRest('comments', { method: 'DELETE', query: queryString({ id: `eq.${id}` }) });
        return { ok: true };
      }
      return apiRequest(`/api/comments/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  commentReactions: {
    toggle(commentId, type = 'like') {
      return apiRequest('/api/comment-reactions', {
        method: 'POST',
        body: JSON.stringify({ comment_id: commentId, type }),
      });
    },
  },
  follows: {
    status(targetUserId) {
      return apiRequest(`/api/follows?targetUserId=${encodeURIComponent(targetUserId)}`);
    },
    toggle(targetUserId) {
      return apiRequest('/api/follows', {
        method: 'POST',
        body: JSON.stringify({ target_user_id: targetUserId }),
      });
    },
    list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/follows${query ? `?${query}` : ''}`);
    },
  },
  followRequests: {
    list() {
      return apiRequest('/api/follow-requests');
    },
    update(id, action) {
      return apiRequest(`/api/follow-requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
    },
  },
  stories: {
    async list(params = {}) {
      if (useDirectSupabase()) {
        const stories = await supabaseRest('stories', {
          query: queryString({ order: 'created_at.desc', limit: params.limit || 30 }),
        });
        return { stories };
      }
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/stories${query ? `?${query}` : ''}`);
    },
    create(payload) {
      return apiRequest('/api/stories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return apiRequest(`/api/stories/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    delete(id) {
      return apiRequest(`/api/stories/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  reels: {
    async list() {
      if (useDirectSupabase()) {
        const reels = await supabaseRest('posts', {
          query: queryString({ post_type: 'eq.reel', order: 'created_at.desc', limit: 50 }),
        });
        return { reels };
      }
      return apiRequest('/api/reels');
    },
  },
  youtube: {
    reels({ query = 'funny short videos', limit = 12 } = {}) {
      const params = new URLSearchParams({ query, limit: String(limit), fresh: String(Date.now()) });
      return apiRequest(`/api/youtube/reels?${params}`);
    },
  },
  music: {
    search({ query = 'top hits pop', limit = 20 } = {}) {
      const params = new URLSearchParams({ query, limit: String(limit) });
      return apiRequest(`/api/music/search?${params}`);
    },
  },
  banuba: {
    token() {
      return apiRequest('/api/banuba/token', { method: 'POST' });
    },
  },
  profile: {
    async me() {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const profile = await getOrCreateProfile(user);
        return { profile, user };
      }
      return apiRequest('/api/profile/me');
    },
    async get(userId) {
      if (useDirectSupabase()) {
        const rows = await supabaseRest('profiles', {
          query: queryString({ user_id: `eq.${userId}`, limit: 1 }),
        });
        return { profile: rows?.[0] || null };
      }
      return apiRequest(`/api/profile/${encodeURIComponent(userId)}`);
    },
    async update(payload) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const authUser = await updateSupabaseUserMetadata(payload, user).catch((error) => {
          console.warn('[Spicey] Could not update auth metadata:', error.message);
          return user;
        });
        const fallbackProfile = { ...profileFromUser(authUser || user), ...payload, user_id: user.id, email: user.email };
        const existingProfile = await getOrCreateProfile(authUser || user);
        try {
          const updated = await supabaseRest('profiles', {
            method: 'PATCH',
            query: queryString({ user_id: `eq.${user.id}` }),
            body: { ...payload, updated_at: new Date().toISOString() },
          });
          return { profile: updated?.[0] || fallbackProfile };
        } catch (error) {
          console.warn('[Spicey] Could not update profile row, using auth metadata fallback:', error.message);
          return { profile: { ...existingProfile, ...fallbackProfile } };
        }
      }
      return apiRequest('/api/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    applyBadge(badgeType) {
      return apiRequest('/api/profile/badge', {
        method: 'POST',
        body: JSON.stringify({ badgeType }),
      });
    },
  },
  users: {
    async search({ query, limit = 8 }) {
      if (useDirectSupabase()) {
        const q = query?.trim();
        const profiles = await supabaseRest('profiles', {
          query: q
            ? `?or=(username.ilike.*${encodeURIComponent(q)}*,full_name.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*)&limit=${encodeURIComponent(limit)}`
            : `?limit=${encodeURIComponent(limit)}`,
        });
        return { users: profiles, profiles };
      }
      const params = new URLSearchParams({ query, limit: String(limit) });
      return apiRequest(`/api/users/search?${params}`);
    },
  },
  presetAvatars: {
    list() {
      return apiRequest('/api/preset-avatars');
    },
  },
  admin: {
    users(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/admin/users${query ? `?${query}` : ''}`);
    },
    messageUser(payload) {
      return apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    content(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/admin/content${query ? `?${query}` : ''}`);
    },
    deleteContent({ type, id }) {
      const query = new URLSearchParams({ type, id }).toString();
      return apiRequest(`/api/admin/content?${query}`, { method: 'DELETE' });
    },
    cleanupContent(payload = {}) {
      return apiRequest('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    analytics() {
      return apiRequest('/api/admin/analytics');
    },
    migrationStatus() {
      return apiRequest('/api/admin/migration-status');
    },
    reports(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/admin/reports${query ? `?${query}` : ''}`);
    },
    moderation(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/admin/moderation${query ? `?${query}` : ''}`);
    },
    moderateUser(payload) {
      return apiRequest('/api/admin/moderation', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    aiHealth() {
      return apiRequest('/api/admin/ai');
    },
    aiAction(payload) {
      return apiRequest('/api/admin/ai', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    curatedReels() {
      return apiRequest('/api/admin/reels');
    },
    addCuratedReel(payload) {
      return apiRequest('/api/admin/reels', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updateCuratedReel(payload) {
      return apiRequest('/api/admin/reels', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    deleteCuratedReel(id) {
      return apiRequest(`/api/admin/reels?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
    presetAvatars() {
      return apiRequest('/api/admin/preset-avatars');
    },
    createPresetAvatar(payload) {
      return apiRequest('/api/admin/preset-avatars', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updatePresetAvatar(payload) {
      return apiRequest('/api/admin/preset-avatars', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    deletePresetAvatar(id) {
      return apiRequest(`/api/admin/preset-avatars?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  legal: {
    latestConsent() {
      return apiRequest('/api/legal/consents');
    },
    createConsent(payload) {
      return apiRequest('/api/legal/consents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
  subscriptions: {
    async status() {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const rows = await supabaseRest('subscriptions', {
          query: queryString({
            user_id: `eq.${user.id}`,
            status: 'eq.active',
            limit: 1,
          }),
        }).catch(() => []);
        const subscription = rows?.[0] || null;
        const planType = subscription?.plan_type || subscription?.plan || null;
        return {
          hasSubscription: !!subscription,
          planType,
          subscription: subscription ? { ...subscription, plan_type: planType } : null,
        };
      }
      return apiRequest('/api/subscriptions/status');
    },
    adminList() {
      return apiRequest('/api/subscriptions/admin');
    },
    adminUpdate(id, payload) {
      return apiRequest(`/api/subscriptions/admin/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    gift(payload) {
      return apiRequest('/api/subscriptions/gift', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
  blocks: {
    list() {
      return apiRequest('/api/blocks');
    },
    create(payload) {
      return apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    delete(id) {
      return apiRequest(`/api/blocks/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  profileCategories: {
    list(userId) {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return apiRequest(`/api/profile-categories${query}`);
    },
    create(payload) {
      return apiRequest('/api/profile-categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return apiRequest(`/api/profile-categories/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    delete(id) {
      return apiRequest(`/api/profile-categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  adCampaigns: {
    list() {
      return apiRequest('/api/ad-campaigns');
    },
    create(payload) {
      return apiRequest('/api/ad-campaigns', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
  reports: {
    list() {
      return apiRequest('/api/reports');
    },
    create(payload) {
      return apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
  map: {
    profiles() {
      return apiRequest('/api/map/profiles');
    },
    updateLocation(payload) {
      return apiRequest('/api/map/location', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
  liveSessions: {
    list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/live-sessions${query ? `?${query}` : ''}`);
    },
    get(id) {
      return apiRequest(`/api/live-sessions/${encodeURIComponent(id)}`);
    },
    create(payload) {
      return apiRequest('/api/live-sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return apiRequest(`/api/live-sessions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    delete(id) {
      return apiRequest(`/api/live-sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  callSessions: {
    async list(params = {}) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const restParams = {
          order: 'created_at.desc',
          limit: params.limit || 20,
        };
        if (params.status) restParams.status = `eq.${params.status}`;
        if (params.receiverId || params.receiver_id) restParams.receiver_id = `eq.${params.receiverId || params.receiver_id}`;
        else restParams.or = `(caller_id.eq.${user.id},receiver_id.eq.${user.id})`;
        const sessions = await supabaseRest('call_sessions', { query: queryString(restParams) });
        return { sessions };
      }
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/call-sessions${query ? `?${query}` : ''}`);
    },
    async get(id) {
      if (useDirectSupabase()) {
        const rows = await supabaseRest('call_sessions', { query: queryString({ id: `eq.${id}`, limit: 1 }) });
        return { call_session: rows?.[0] || null, session: rows?.[0] || null };
      }
      return apiRequest(`/api/call-sessions/${encodeURIComponent(id)}`);
    },
    async create(payload) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const profile = await getOrCreateProfile(user);
        const created = await supabaseRest('call_sessions', {
          method: 'POST',
          body: {
            caller_id: user.id,
            receiver_id: payload.receiver_id,
            type: payload.type === 'video' ? 'video' : 'voice',
            status: 'ringing',
            caller_name: profile.full_name || user.email?.split('@')[0] || 'User',
            caller_avatar: profile.avatar_url || null,
            receiver_name: payload.receiver_name || null,
            receiver_avatar: payload.receiver_avatar || null,
          },
        });
        const callSession = created?.[0];
        return { call_session: callSession, session: callSession, voip: { sent: false, needs_backend: true } };
      }
      return apiRequest('/api/call-sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async update(id, payload) {
      if (useDirectSupabase()) {
        const updated = await supabaseRest('call_sessions', {
          method: 'PATCH',
          query: queryString({ id: `eq.${id}` }),
          body: { ...payload, updated_at: new Date().toISOString() },
        });
        return { call_session: updated?.[0], session: updated?.[0] };
      }
      return apiRequest(`/api/call-sessions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  },
  missedCalls: {
    list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/missed-calls${query ? `?${query}` : ''}`);
    },
    create(payload) {
      return apiRequest('/api/missed-calls', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return apiRequest(`/api/missed-calls/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  },
  notifications: {
    list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/api/notifications${query ? `?${query}` : ''}`);
    },
    create(payload) {
      return apiRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update(id, payload) {
      return apiRequest(`/api/notifications/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  },
  push: {
    diagnostics() {
      return apiRequest('/api/push/diagnostics');
    },
  },
  account: {
    delete() {
      return apiRequest('/api/account/delete', {
        method: 'POST',
        body: JSON.stringify({ confirm: 'DELETE' }),
      });
    },
  },
  chats: {
    async list() {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const chats = await supabaseRest('chats', {
          query: `?participant_ids=cs.{${encodeURIComponent(user.id)}}&order=last_message_time.desc.nullslast&limit=100`,
        });
        const otherIds = chats.map((chat) => (chat.participant_ids || []).find((id) => id !== user.id)).filter(Boolean);
        const profileMap = await profilesByUserIds(otherIds);
        const chatIds = chats.map((chat) => chat.id).filter(Boolean);
        const chatMessages = chatIds.length ? await supabaseRest('messages', {
          query: `?select=chat_id,sender_id,read_by&chat_id=in.(${chatIds.map((id) => `"${id}"`).join(',')})&limit=5000`,
        }).catch(() => []) : [];
        const unreadByChat = chatMessages.reduce((counts, message) => {
          if (message.sender_id !== user.id && !(message.read_by || []).includes(user.id)) {
            counts[message.chat_id] = (counts[message.chat_id] || 0) + 1;
          }
          return counts;
        }, {});
        return {
          chats: chats.map((chat) => ({
            ...chat,
            unread_count: unreadByChat[chat.id] || 0,
            other_profile: profileMap[(chat.participant_ids || []).find((id) => id !== user.id)] || null,
          })),
        };
      }
      return apiRequest('/api/chats');
    },
    async create(payload) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const otherUserId = payload.other_user_id || payload.otherUserId;
        const participantIds = payload.participant_ids || [user.id, otherUserId].filter(Boolean);
        const existing = await supabaseRest('chats', {
          query: `?participant_ids=cs.{${participantIds.map(encodeURIComponent).join(',')}}&limit=1`,
        });
        if (existing?.[0]) return { chat: existing[0] };
        const profileMap = await profilesByUserIds(participantIds);
        const created = await supabaseRest('chats', {
          method: 'POST',
          body: {
            participant_ids: participantIds,
            participant_usernames: participantIds.map((id) => profileMap[id]?.username || ''),
            last_message_time: new Date().toISOString(),
            is_group: payload.is_group === true,
            group_name: payload.group_name || null,
            group_avatar: payload.group_avatar || null,
          },
        });
        return { chat: created?.[0] };
      }
      return apiRequest('/api/chats', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async delete(id) {
      if (useDirectSupabase()) {
        await supabaseRest('chats', { method: 'DELETE', query: queryString({ id: `eq.${id}` }) });
        return { ok: true };
      }
      return apiRequest(`/api/chats/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  messages: {
    async list(chatId) {
      if (useDirectSupabase()) {
        const messages = await supabaseRest('messages', {
          query: queryString({ chat_id: `eq.${chatId}`, order: 'created_at.asc', limit: 200 }),
        });
        return { messages };
      }
      return apiRequest(`/api/chats/${encodeURIComponent(chatId)}/messages`);
    },
    async create(chatId, payload) {
      if (useDirectSupabase()) {
        const user = await currentSupabaseUser();
        const profile = await getOrCreateProfile(user);
        const created = await supabaseRest('messages', {
          method: 'POST',
          body: {
            chat_id: chatId,
            sender_id: user.id,
            sender_username: profile.username || user.email?.split('@')[0] || 'user',
            sender_avatar: profile.avatar_url || '',
            text: payload.text || '',
            image_url: payload.image_url || payload.imageUrl || null,
            video_url: payload.video_url || payload.videoUrl || null,
            read_by: [user.id],
          },
        });
        await supabaseRest('chats', {
          method: 'PATCH',
          query: queryString({ id: `eq.${chatId}` }),
          body: {
            last_message: payload.text || (payload.image_url || payload.imageUrl ? 'Image' : 'Video'),
            last_message_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }).catch(() => {});
        return { message: created?.[0] };
      }
      return apiRequest(`/api/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async delete(id) {
      if (useDirectSupabase()) {
        await supabaseRest('messages', { method: 'DELETE', query: queryString({ id: `eq.${id}` }) });
        return { ok: true };
      }
      return apiRequest(`/api/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  },
  media: {
    async upload(file, options = {}) {
      if (useDirectSupabase()) {
        if (!file) throw new Error('No file selected.');
        const user = await currentSupabaseUser();
        const token = spiceySession.token();
        const folder = String(options.folder || 'uploads').replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9/_-]/g, '-');
        const ext = (file.name?.split('.').pop() || (file.type?.split('/')[1]) || 'bin').replace(/[^a-zA-Z0-9]/g, '') || 'bin';
        const objectPath = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const uploadResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/spicey-media/${objectPath}`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
            'Content-Type': file.type || 'application/octet-stream',
            'x-upsert': 'true',
          },
          body: file,
        });
        const text = await uploadResponse.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (_) {}
        if (!uploadResponse.ok) {
          throw new Error(data.message || data.error || `Upload failed (${uploadResponse.status})`);
        }
        const file_url = `${SUPABASE_URL}/storage/v1/object/public/spicey-media/${objectPath}`;
        return { file_url, file_uri: objectPath, path: objectPath, bucket: 'spicey-media' };
      }
      const token = spiceySession.token();
      const form = new FormData();
      form.append('file', file);
      Object.entries(options).forEach(([key, value]) => form.append(key, value));

      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      return data;
    },
  },
};
