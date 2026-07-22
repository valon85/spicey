// Supabase URL and publishable key are intentionally public client values.
// The fallback keeps a native release usable if CI omits a Vite variable.
export const PUBLIC_SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL ||
  'https://smcrtqceuraouvvpxksg.supabase.co'
).replace(/\/$/, '');

export const PUBLIC_SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_uL6MVjc8N50geJKQlcuLVg_ACTBrgUJ';

