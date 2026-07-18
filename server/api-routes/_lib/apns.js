import crypto from 'node:crypto';
import http2 from 'node:http2';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function normalizePrivateKey(value = '') {
  return value.replace(/\\n/g, '\n').trim();
}

function apnsConfig() {
  const keyId = process.env.APN_KEY_ID;
  const teamId = process.env.APN_TEAM_ID;
  const bundleId = process.env.APN_BUNDLE_ID || 'com.base69fe90d3bbe7ad47925e4a0a.app';
  const privateKey = normalizePrivateKey(process.env.APN_AUTH_KEY || '');
  const env = process.env.APN_ENV || 'production';

  if (!keyId || !teamId || !bundleId || !privateKey) {
    return { ready: false, missing: ['APN_KEY_ID', 'APN_TEAM_ID', 'APN_BUNDLE_ID', 'APN_AUTH_KEY'].filter((key) => !process.env[key]) };
  }

  return {
    ready: true,
    keyId,
    teamId,
    bundleId,
    privateKey,
    host: env === 'sandbox' ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com',
  };
}

let cachedJwt = null;
let cachedJwtIat = 0;

function apnsJwt(config) {
  const iat = Math.floor(Date.now() / 1000);
  if (cachedJwt && iat - cachedJwtIat < 45 * 60) return cachedJwt;

  const header = base64url(JSON.stringify({ alg: 'ES256', kid: config.keyId }));
  const claims = base64url(JSON.stringify({ iss: config.teamId, iat }));
  const signingInput = `${header}.${claims}`;
  const signature = crypto.sign('sha256', Buffer.from(signingInput), {
    key: config.privateKey,
    dsaEncoding: 'ieee-p1363',
  });

  cachedJwt = `${signingInput}.${base64url(signature)}`;
  cachedJwtIat = iat;
  return cachedJwt;
}

export function getApnsStatus() {
  const config = apnsConfig();
  return {
    ready: config.ready,
    missing: config.missing || [],
    environment: process.env.APN_ENV || 'production',
    bundle_id: process.env.APN_BUNDLE_ID || 'com.base69fe90d3bbe7ad47925e4a0a.app',
  };
}

export async function sendApns({ token, pushType = 'alert', topic, payload, priority = 10 } = {}) {
  const config = apnsConfig();
  if (!config.ready) return { sent: false, skipped: true, reason: `Missing APNs config: ${config.missing.join(', ')}` };
  if (!token) return { sent: false, skipped: true, reason: 'Missing device token' };

  const client = http2.connect(config.host);
  const body = JSON.stringify(payload || {});
  const headers = {
    ':method': 'POST',
    ':path': `/3/device/${token}`,
    authorization: `bearer ${apnsJwt(config)}`,
    'apns-topic': topic,
    'apns-push-type': pushType,
    'apns-priority': String(priority),
    'content-type': 'application/json',
  };

  return new Promise((resolve) => {
    const request = client.request(headers);
    let responseBody = '';
    let status = 0;

    request.setEncoding('utf8');
    request.on('response', (headers) => {
      status = Number(headers[':status'] || 0);
    });
    request.on('data', (chunk) => {
      responseBody += chunk;
    });
    request.on('error', (error) => {
      client.close();
      resolve({ sent: false, status, error: error.message });
    });
    request.on('end', () => {
      client.close();
      let data = {};
      try {
        data = responseBody ? JSON.parse(responseBody) : {};
      } catch (_) {}
      resolve({ sent: status >= 200 && status < 300, status, data });
    });

    request.end(body);
  });
}

export function sendRegularPush({ token, title, body, data = {} } = {}) {
  const config = apnsConfig();
  return sendApns({
    token,
    pushType: 'alert',
    topic: config.bundleId,
    priority: 10,
    payload: {
      aps: {
        alert: { title, body },
        sound: 'default',
        badge: 1,
      },
      ...data,
    },
  });
}

export function sendVoipPush({ token, callerName, callerId, callSessionId, callType = 'voice', callerAvatar = null } = {}) {
  const config = apnsConfig();
  return sendApns({
    token,
    pushType: 'voip',
    topic: `${config.bundleId}.voip`,
    priority: 10,
    payload: {
      aps: {},
      type: 'call',
      callerName,
      callerId,
      callerAvatar,
      callSessionId,
      callType,
      hasVideo: callType === 'video',
    },
  });
}
