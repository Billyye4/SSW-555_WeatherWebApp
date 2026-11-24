import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpClient } from './HttpClient.js';
import { GeocodingService } from './GeocodingService.js';

const geocoding = new GeocodingService(new HttpClient());

test('search returns the first match as a Location', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => ({ results: [{ name: 'Hoboken', country_code: 'US', latitude: 40.74, longitude: -74.03 }] }),
  }));
  const place = await geocoding.search('Hoboken');
  assert.equal(place.name, 'Hoboken');
  assert.equal(place.id, '40.74,-74.03');
});

test('search rejects when no city matches', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({}) }));
  await assert.rejects(geocoding.search('Nowhereville'), /No city found for "Nowhereville"/);
});

test('search rejects with a friendly message on network failure', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(geocoding.search('Hoboken'), /Network error/);
});
