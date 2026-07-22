import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { apiErrorStatus, getSupabaseUser, requireSupabaseEnv } from '../_lib/supabaseRest.js';
import { readMultipartFile } from '../_lib/multipart.js';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function safeName(name) {
  return String(name || 'upload')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'upload';
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    requireSupabaseEnv({ serviceRole: true });
    const { user } = await getSupabaseUser(req);
    const { file, fields } = await readMultipartFile(req);

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'spicey-media';
    const folder = safeName(fields.folder || 'uploads');
    const objectPath = `${user.id}/${folder}/${Date.now()}-${safeName(file.filename)}`;

    const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': file.mimeType,
        'x-upsert': 'false',
      },
      body: file.buffer,
    });

    const text = await upload.text();
    const data = text ? JSON.parse(text) : {};
    if (!upload.ok) {
      return sendJson(res, upload.status, { error: data.message || data.error || 'Upload failed' });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
    return sendJson(res, 200, {
      path: objectPath,
      bucket,
      url: publicUrl,
      file_url: publicUrl,
    });
  } catch (error) {
    return sendJson(res, apiErrorStatus(error), {
      error: error.message || 'Upload failed',
      code: error.code || 'UPLOAD_FAILED',
    });
  }
}
