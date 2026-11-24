import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpClient } from './HttpClient.js';

test('getJSON returns the parsed body', async () => {
  const http = new HttpClient(async () => ({ ok: true, json: async () => ({ a: 1 }) }));
  assert.deepEqual(await http.getJSON('https://example.test'), { a: 1 });
});

test('getJSON passes headers through', async () => {
  let seen;
  const http = new HttpClient(async (url, init) => { seen = init.headers; return { ok: true, json: async () => ({}) }; });
  await http.getJSON('https://example.test', { Accept: 'application/geo+json' });
  assert.equal(seen.Accept, 'application/geo+json');
});

test('getJSON rejects with a friendly message on network failure', async () => {
  const http = new HttpClient(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(http.getJSON('https://example.test'), /Network error/);
});

test('getJSON rejects with a friendly message on a non-2xx status', async () => {
  const http = new HttpClient(async () => ({ ok: false, status: 500 }));
  await assert.rejects(http.getJSON('https://example.test'), /unavailable/);
});
