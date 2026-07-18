import { handleOptions, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser } from '../../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com']);
const ARTIFACTS = {
  ipa: { artifactName: 'spicey-ios-ipa', fileName: 'Spicey.ipa' },
  apk: { artifactName: 'spicey-signed-apk', fileName: 'Spicey-release.apk' },
  aab: { artifactName: 'spicey-signed-aab', fileName: 'Spicey-release.aab' },
};

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(String(user.email || '').toLowerCase())) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

function getGithubToken() {
  return process.env.GITHUB_ARTIFACT_TOKEN || process.env.SPICEY_GITHUB_TOKEN || '';
}

function getGithubRepository() {
  const explicitRepository = process.env.SPICEY_GITHUB_REPOSITORY || process.env.GITHUB_REPOSITORY || '';
  if (explicitRepository) return explicitRepository;

  const owner = process.env.VERCEL_GIT_REPO_OWNER || '';
  const slug = process.env.VERCEL_GIT_REPO_SLUG || '';
  return owner && slug ? `${owner}/${slug}` : '';
}

async function githubFetch(path, options = {}) {
  const token = getGithubToken();
  const repository = getGithubRepository();
  if (!token) throw new Error('GITHUB_ARTIFACT_TOKEN is not configured in Vercel.');
  if (!repository || !repository.includes('/')) throw new Error('SPICEY_GITHUB_REPOSITORY is not configured. Use owner/repo.');

  return fetch(`https://api.github.com/repos/${repository}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'spicey-release-center',
      ...(options.headers || {}),
    },
    redirect: 'manual',
  });
}

async function getLatestArtifact(target) {
  const response = await githubFetch('/actions/artifacts?per_page=100');
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.message || `GitHub request failed (${response.status})`);
  const artifact = (data.artifacts || []).find((item) => item.name === target.artifactName && !item.expired);
  if (!artifact) throw new Error(`${target.artifactName} is not available yet. Run the GitHub Action first.`);
  return artifact;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await requireAdmin(req);
    const url = new URL(req.url, 'https://spicey.local');
    const key = url.searchParams.get('artifact') || '';
    const target = ARTIFACTS[key];
    if (!target) return sendJson(res, 400, { error: 'Unknown artifact type' });

    const artifact = await getLatestArtifact(target);
    const response = await githubFetch(`/actions/artifacts/${artifact.id}/zip`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    const location = response.headers.get('location');
    if (!location) {
      const text = await response.text().catch(() => '');
      return sendJson(res, response.status || 502, { error: text || 'Could not create artifact download link' });
    }

    return sendJson(res, 200, {
      download_url: location,
      file_name: target.fileName,
      artifact_id: artifact.id,
      expires_at: artifact.expires_at || '',
    });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message || 'Could not download mobile artifact.' });
  }
}
