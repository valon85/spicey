import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com']);
const RELEASE_SETTINGS_KEY = 'release_links';

function getEnvValue(name) {
  if (process.env[name]) return process.env[name];

  try {
    const envText = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
    const line = envText.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim() : '';
  } catch {
    return '';
  }
}

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

function normalizeReleaseSettings(value = {}) {
  return {
    ios_download_url: typeof value.ios_download_url === 'string' ? value.ios_download_url.trim() : '',
    android_download_url: typeof value.android_download_url === 'string' ? value.android_download_url.trim() : '',
    updated_at: value.updated_at || '',
    updated_by: value.updated_by || '',
  };
}

async function readReleaseSettings() {
  try {
    const rows = await supabaseTable('release_settings', {
      serviceRole: true,
      query: `?key=eq.${encodeURIComponent(RELEASE_SETTINGS_KEY)}&select=value&limit=1`,
    });
    return normalizeReleaseSettings(rows?.[0]?.value || {});
  } catch (error) {
    return {
      ...normalizeReleaseSettings(),
      settings_error: error.message || 'Release settings table is not available.',
    };
  }
}

async function saveReleaseSettings({ ios_download_url = '', android_download_url = '', updated_by = '' }) {
  const value = normalizeReleaseSettings({
    ios_download_url,
    android_download_url,
    updated_at: new Date().toISOString(),
    updated_by,
  });
  const rows = await supabaseTable('release_settings', {
    method: 'POST',
    serviceRole: true,
    query: '?on_conflict=key',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: {
      key: RELEASE_SETTINGS_KEY,
      value,
      updated_by,
    },
  });
  return normalizeReleaseSettings(rows?.[0]?.value || value);
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const admin = await requireAdmin(req);

    if (req.method === 'GET') {
      const savedSettings = await readReleaseSettings();
      const iosDownloadUrl = savedSettings.ios_download_url || process.env.SPICEY_IOS_DOWNLOAD_URL || '';
      const androidDownloadUrl = savedSettings.android_download_url || process.env.SPICEY_ANDROID_DOWNLOAD_URL || '';
      return sendJson(res, 200, {
        deploy_hook_configured: Boolean(getEnvValue('VERCEL_DEPLOY_HOOK_URL')),
        ios_download_configured: Boolean(iosDownloadUrl),
        android_download_configured: Boolean(androidDownloadUrl),
        ios_download_url: iosDownloadUrl,
        android_download_url: androidDownloadUrl,
        release_settings_saved: Boolean(savedSettings.updated_at),
        release_settings_updated_at: savedSettings.updated_at || '',
        release_settings_updated_by: savedSettings.updated_by || '',
        release_settings_error: savedSettings.settings_error || '',
      });
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const body = await readJson(req);
    if (body.action === 'save_mobile_links') {
      const savedSettings = await saveReleaseSettings({
        ios_download_url: body.ios_download_url || '',
        android_download_url: body.android_download_url || '',
        updated_by: admin.email || admin.id || 'admin',
      });
      return sendJson(res, 200, {
        success: true,
        message: 'Mobile download links saved for admin release panel.',
        ...savedSettings,
      });
    }

    if (body.action !== 'publish_web') {
      return sendJson(res, 400, { error: 'Unsupported release action' });
    }

    const hookUrl = getEnvValue('VERCEL_DEPLOY_HOOK_URL');
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
