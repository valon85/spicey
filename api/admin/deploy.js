import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com']);

function getDeployErrorMessage(data, status) {
  const value = data?.message || data?.error;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return value.message || value.code || JSON.stringify(value);
  }
  return `Deploy hook failed (${status})`;
}

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(String(user.email || '').toLowerCase())) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    await requireAdmin(req);

    if (req.method === 'GET') {
      return sendJson(res, 200, {
        deploy_hook_configured: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL),
        ios_download_configured: Boolean(process.env.SPICEY_IOS_DOWNLOAD_URL),
        android_download_configured: Boolean(process.env.SPICEY_ANDROID_DOWNLOAD_URL),
        ios_download_url: process.env.SPICEY_IOS_DOWNLOAD_URL || '',
        android_download_url: process.env.SPICEY_ANDROID_DOWNLOAD_URL || '',
      });
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const body = await readJson(req);
    if (body.action !== 'publish_web') {
      return sendJson(res, 400, { error: 'Unsupported release action' });
    }

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hookUrl) {
      return sendJson(res, 409, {
        error: 'VERCEL_DEPLOY_HOOK_URL is not configured',
        message: 'Add a Vercel Deploy Hook URL in server environment variables to publish from this panel.',
      });
    }

    const response = await fetch(hookUrl, { method: 'POST' });
    const text = await response.text().catch(() => '');
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }

    if (!response.ok) {
      return sendJson(res, response.status, {
        error: getDeployErrorMessage(data, response.status),
        details: data,
      });
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Vercel deploy started. The live site updates after Vercel finishes building.',
      details: data,
    });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message || 'Release action failed' });
  }
}
