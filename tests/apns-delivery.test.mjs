import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import http2 from 'node:http2';
import test from 'node:test';

const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
process.env.APN_KEY_ID = 'TESTKEY123';
process.env.APN_TEAM_ID = 'TESTTEAM12';
process.env.APN_BUNDLE_ID = 'com.base69fe90d3bbe7ad47925e4a0a.app';
process.env.APN_AUTH_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' });

const originalConnect = http2.connect;
const connections = [];
const queuedResponses = [];

http2.connect = (host) => {
  const client = new EventEmitter();
  client.close = () => {};
  client.request = (headers) => {
    const connection = { host, headers, body: null };
    const request = new EventEmitter();
    request.setEncoding = () => {};
    request.end = (body) => {
      connection.body = body;
      const response = queuedResponses.shift();
      queueMicrotask(() => {
        request.emit('response', {
          ':status': response.status,
          'apns-id': response.apnsId,
        });
        if (response.body) request.emit('data', JSON.stringify(response.body));
        request.emit('end');
      });
    };
    connections.push(connection);
    return request;
  };
  return client;
};

const {
  normalizeApnsEnvironment,
  sendRegularPush,
  sendVoipPush,
  summarizeApnsResult,
} = await import('../server/api-routes/_lib/apns.js');

test.after(() => {
  http2.connect = originalConnect;
});

test('selects sandbox for development APNs tokens', async () => {
  queuedResponses.push({ status: 200, apnsId: 'sandbox-success' });
  const result = await sendRegularPush({
    token: 'development-device-token',
    title: 'Message',
    body: 'Hello',
    environment: 'development',
  });

  assert.equal(connections.at(-1).host, 'https://api.sandbox.push.apple.com');
  assert.equal(connections.at(-1).headers['apns-topic'], process.env.APN_BUNDLE_ID);
  assert.deepEqual(summarizeApnsResult(result), {
    sent: true,
    status: 200,
    environment: 'development',
    reason: null,
    apns_id: 'sandbox-success',
  });
});

test('selects production for production VoIP tokens and reports Apple reason safely', async () => {
  queuedResponses.push({
    status: 400,
    apnsId: 'production-failure',
    body: { reason: 'BadDeviceToken' },
  });
  const sensitiveToken = 'production-sensitive-device-token';
  const result = await sendVoipPush({
    token: sensitiveToken,
    callerName: 'Caller',
    callerId: 'caller-id',
    callSessionId: '4ef76ac8-bfed-4988-b6de-6f772572f2a9',
    environment: 'production',
  });
  const summary = summarizeApnsResult(result);

  assert.equal(connections.at(-1).host, 'https://api.push.apple.com');
  assert.equal(connections.at(-1).headers['apns-topic'], `${process.env.APN_BUNDLE_ID}.voip`);
  assert.equal(summary.reason, 'BadDeviceToken');
  assert.equal(JSON.stringify(summary).includes(sensitiveToken), false);
});

test('sends terminal VoIP events so the receiving device can stop CallKit', async () => {
  queuedResponses.push({ status: 200, apnsId: 'ended-success' });
  await sendVoipPush({
    token: 'voip-device-token',
    callerName: 'Caller',
    callerId: 'caller-id',
    callSessionId: '4ef76ac8-bfed-4988-b6de-6f772572f2a9',
    event: 'ended',
    environment: 'development',
  });

  assert.equal(JSON.parse(connections.at(-1).body).event, 'ended');
});

test('preserves other APNs rejection reasons without exposing tokens', async () => {
  for (const reason of ['DeviceTokenNotForTopic', 'InvalidProviderToken']) {
    queuedResponses.push({ status: 403, apnsId: `${reason}-id`, body: { reason } });
    const token = `sensitive-${reason}-token`;
    const result = await sendRegularPush({
      token,
      title: 'Message',
      body: 'Hello',
      environment: 'production',
    });
    const summary = summarizeApnsResult(result);
    assert.equal(summary.reason, reason);
    assert.equal(JSON.stringify(summary).includes(token), false);
  }
});

test('normalizes persisted APNs environments', () => {
  assert.equal(normalizeApnsEnvironment('sandbox'), 'development');
  assert.equal(normalizeApnsEnvironment('development'), 'development');
  assert.equal(normalizeApnsEnvironment('production'), 'production');
  assert.equal(normalizeApnsEnvironment('unexpected'), 'production');
});
