const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = supabaseConfigured
  ? {
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
    }
  : null;

export async function testSupabaseConnection() {
  if (!supabaseConfigured) {
    return { ok: false, error: 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set.' };
  }

  const start = Date.now();
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const latencyMs = Date.now() - start;
    if (response.ok) return { ok: true, latencyMs };
    const data = await response.json().catch(() => ({}));
    return { ok: false, latencyMs, error: data.message || data.error || `HTTP ${response.status}` };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: e.message };
  }
}
