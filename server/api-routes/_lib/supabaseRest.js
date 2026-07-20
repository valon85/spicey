const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function apiError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function apiErrorStatus(error, fallback = 500) {
  const status = Number(error?.statusCode);
  return status >= 400 && status <= 599 ? status : fallback;
}

export function requireSupabaseEnv({ serviceRole = false } = {}) {
  if (!SUPABASE_URL) throw apiError('SUPABASE_URL is not configured', 500, 'SUPABASE_CONFIG');
  if (!SUPABASE_ANON_KEY) throw apiError('SUPABASE_ANON_KEY is not configured', 500, 'SUPABASE_CONFIG');
  if (serviceRole && !SUPABASE_SERVICE_ROLE_KEY) {
    throw apiError('SUPABASE_SERVICE_ROLE_KEY is not configured', 500, 'SUPABASE_CONFIG');
  }
}

export function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
}

export async function getSupabaseUser(req) {
  const token = getBearerToken(req);
  if (!token) throw apiError('Missing session token', 401, 'AUTH_REQUIRED');
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
    throw apiError(
      data.error_description || data.msg || data.error || `Supabase auth error (${response.status})`,
      response.status === 400 || response.status === 401 || response.status === 403 ? 401 : 502,
      'SUPABASE_AUTH',
    );
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
    throw apiError(
      data.error_description || data.msg || data.error || `Supabase admin auth error (${response.status})`,
      response.status === 401 || response.status === 403 ? response.status : 502,
      'SUPABASE_ADMIN_AUTH',
    );
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
    throw apiError(
      data.message || data.error || `Supabase table error (${response.status})`,
      [400, 401, 403, 404, 409, 422].includes(response.status) ? response.status : 502,
      'SUPABASE_TABLE',
    );
  }
  return data;
}
