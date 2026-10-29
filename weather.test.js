import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describe, geocode } from './weather.js';

test('describe maps known and unknown weather codes', () => {
  assert.deepEqual(describe(0), ['Clear sky', '☀️']);
  assert.equal(describe(63)[0], 'Rain');
  assert.equal(describe(999)[0], 'Unknown');
});

test('geocode returns the first match', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => ({ results: [{ name: 'Hoboken', latitude: 40.74, longitude: -74.03 }] }),
  }));
  assert.equal((await geocode('Hoboken')).name, 'Hoboken');
});

test('geocode rejects when no city matches', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({}) }));
  await assert.rejects(geocode('Nowhereville'), /No city found/);
});

test('geocode rejects with a friendly message on network failure', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(geocode('Hoboken'), /Network error/);
});
