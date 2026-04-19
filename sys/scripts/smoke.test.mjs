import assert from 'node:assert/strict';
import test from 'node:test';

const frontendUrl = process.env.TEST_FRONTEND_URL ?? 'http://localhost:3000';
const backendUrl = process.env.TEST_BACKEND_URL ?? 'http://localhost:8080';

async function fetchJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} should return HTTP 200`);
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  assert.equal(response.status, 200, `${url} should return HTTP 200`);
  return response.text();
}

function extractCookie(setCookieHeader) {
  assert.ok(setCookieHeader, 'handover should set a session cookie');
  return setCookieHeader.split(';', 1)[0];
}

test('backend health endpoint responds with ok status', async () => {
  const health = await fetchJson(`${backendUrl}/api/health`);

  assert.equal(health.status, 'ok');
  assert.equal(health.services.api, 'ok');
  assert.equal(health.services.database, 'ok');
});

test('frontend landing page renders the foundation title', async () => {
  const html = await fetchText(frontendUrl);

  assert.match(html, /FERMS Auth Foundation/);
  assert.match(html, /認証引き継ぎを実行/);
});

test('frontend health proxy returns backend health payload', async () => {
  const health = await fetchJson(`${frontendUrl}/api/health`);

  assert.equal(health.status, 'ok');
  assert.equal(health.services.database, 'ok');
});

test('backend handover issues a local session and auth me resolves the mock user', async () => {
  const handoverResponse = await fetch(
    `${backendUrl}/api/auth/handover?returnTo=${encodeURIComponent(`${frontendUrl}/dashboard`)}`,
    {
      redirect: 'manual',
    },
  );

  assert.equal(handoverResponse.status, 302);
  assert.equal(handoverResponse.headers.get('location'), `${frontendUrl}/dashboard`);

  const sessionCookie = extractCookie(handoverResponse.headers.get('set-cookie'));
  const meResponse = await fetch(`${backendUrl}/api/auth/me`, {
    headers: {
      cookie: sessionCookie,
    },
  });

  assert.equal(meResponse.status, 200);
  const mePayload = await meResponse.json();
  assert.equal(mePayload.data.authenticated, true);
  assert.equal(mePayload.data.user.email, 'demo02.user@local.test');
});

test('frontend dashboard renders the authenticated user after handover', async () => {
  const handoverResponse = await fetch(
    `${backendUrl}/api/auth/handover?returnTo=${encodeURIComponent(`${frontendUrl}/dashboard`)}`,
    {
      redirect: 'manual',
    },
  );
  const sessionCookie = extractCookie(handoverResponse.headers.get('set-cookie'));

  const html = await fetchText(`${frontendUrl}/dashboard`, {
    headers: {
      cookie: sessionCookie,
    },
  });

  assert.match(html, /Authenticated dashboard skeleton/);
  assert.match(html, /Demo02 Local User/);
});
