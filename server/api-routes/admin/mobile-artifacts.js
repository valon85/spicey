import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com']);
const ARTIFACTS = [
  { key: 'ipa', label: 'iOS IPA', artifactName: 'spicey-ios-ipa', fileName: 'Spicey.ipa' },
  { key: 'apk', label: 'Android APK', artifactName: 'spicey-signed-apk', fileName: 'Spicey-release.apk' },
  { key: 'aab', label: 'Android AAB', artifactName: 'spicey-signed-aab', fileName: 'Spicey-release.aab' },
];

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

async function githubJson(path) {
  const token = getGithubToken();
  const repository = getGithubRepository();
  if (!token) throw new Error('GITHUB_ARTIFACT_TOKEN is not configured in Vercel.');
  if (!repository || !repository.includes('/')) throw new Error('SPICEY_GITHUB_REPOSITORY is not configured. Use owner/repo.');

  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'spicey-release-center',
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || `GitHub request failed (${response.status})`);
  }
  return data;
}

async function listLatestArtifacts() {
  const data = await githubJson('/actions/artifacts?per_page=100');
  const artifacts = Array.isArray(data.artifacts) ? data.artifacts : [];
  return ARTIFACTS.map((target) => {
    const artifact = artifacts.find((item) => item.name === target.artifactName && !item.expired);
    return {
      ...target,
      available: Boolean(artifact),
      artifact_id: artifact?.id || '',
      size_in_bytes: artifact?.size_in_bytes || 0,
      created_at: artifact?.created_at || '',
      expires_at: artifact?.expires_at || '',
      download_url: artifact ? `/api/admin/mobile-artifacts/download?artifact=${encodeURIComponent(target.key)}` : '',
    };
  });
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await requireAdmin(req);
    const artifacts = await listLatestArtifacts();
    return sendJson(res, 200, {
      configured: Boolean(getGithubToken() && getGithubRepository()),
      repository: getGithubRepository(),
      artifacts,
    });
  } catch (error) {
    return sendJson(res, error.status || 500, {
      error: error.message || 'Could not load mobile artifacts.',
      configured: Boolean(getGithubToken() && getGithubRepository()),
      repository: getGithubRepository(),
      artifacts: ARTIFACTS.map((target) => ({ ...target, available: false, download_url: '' })),
    });
  }
}
