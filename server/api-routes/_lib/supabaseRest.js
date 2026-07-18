const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function requireSupabaseEnv({ serviceRole = false } = {}) {
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL is not configured');
  if (!SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY is not configured');
  if (serviceRole && !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
}

export function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
}

export async function getSupabaseUser(req) {
  const token = getBearerToken(req);
  if (!token) throw new Error('Missing session token');
  const user = await supabaseAuth('/user', { token });
  return { token, user };
}

export async function supabaseAuth(path, { method = 'GET', body, token } = {}) {
  requireSupabaseEnv();
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.error || `Supabase auth error (${response.status})`);
  }
  return data;
}

export async function supabaseAdminAuth(path, { method = 'GET', body } = {}) {
  requireSupabaseEnv({ serviceRole: true });
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.error || `Supabase admin auth error (${response.status})`);
  }
  return data;
}

export async function supabaseTable(table, { method = 'GET', query = '', body, token, serviceRole = false, headers = {} } = {}) {
  requireSupabaseEnv({ serviceRole });
  const key = serviceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  const authToken = serviceRole ? SUPABASE_SERVICE_ROLE_KEY : token;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${authToken || key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || data.error || `Supabase table error (${response.status})`);
  }
  return data;
}
