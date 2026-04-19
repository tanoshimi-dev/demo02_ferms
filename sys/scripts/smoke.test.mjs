import assert from 'node:assert/strict';
import test from 'node:test';

const frontendUrl = process.env.TEST_FRONTEND_URL ?? 'http://localhost:3000';
const backendUrl = process.env.TEST_BACKEND_URL ?? 'http://localhost:8080';

async function fetchJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} should return HTTP 200`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, `${url} should return HTTP 200`);
  return response.text();
}

test('backend health endpoint responds with ok status', async () => {
  const health = await fetchJson(`${backendUrl}/api/health`);

  assert.equal(health.status, 'ok');
  assert.equal(health.services.api, 'ok');
  assert.equal(health.services.database, 'ok');
});

test('frontend landing page renders the foundation title', async () => {
  const html = await fetchText(frontendUrl);

  assert.match(html, /FERMS Foundation/);
});

test('frontend health proxy returns backend health payload', async () => {
  const health = await fetchJson(`${frontendUrl}/api/health`);

  assert.equal(health.status, 'ok');
  assert.equal(health.services.database, 'ok');
});
