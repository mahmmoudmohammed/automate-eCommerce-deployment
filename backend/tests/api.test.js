const test = require('node:test');
const assert = require('node:assert');

// We are running end-to-end tests against the running backend service.
// The backend is exposed on port 5000 inside the container.
const API_URL = 'http://127.0.0.1:5000';

test('GET / should return Hi', async (t) => {
  const response = await fetch(`${API_URL}/`);
  const text = await response.text();
  assert.strictEqual(response.status, 200, "Expected status code 200");
  assert.strictEqual(text, 'Hi', "Expected response to be 'Hi'");
});

test('GET /values/all should return an array of values', async (t) => {
  const response = await fetch(`${API_URL}/values/all`);
  const json = await response.json();
  assert.strictEqual(response.status, 200, "Expected status code 200");
  assert.ok(Array.isArray(json), "Expected response to be an array");
});

test('GET /values/current should return an object', async (t) => {
  const response = await fetch(`${API_URL}/values/current`);
  const json = await response.json();
  assert.strictEqual(response.status, 200, "Expected status code 200");
  assert.strictEqual(typeof json, 'object', "Expected response to be an object");
});

test('POST /values should reject index > 40', async (t) => {
  const response = await fetch(`${API_URL}/values`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index: 45 })
  });
  const json = await response.json();
  assert.strictEqual(response.status, 422, "Expected status code 422 for index > 40");
  assert.strictEqual(json.message, "Index too high.", "Expected error message");
});

test('POST /values should accept valid index', async (t) => {
  const response = await fetch(`${API_URL}/values`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index: 5 })
  });
  const json = await response.json();
  assert.strictEqual(response.status, 200, "Expected status code 200");
  assert.strictEqual(json.working, true, "Expected working: true");
});
