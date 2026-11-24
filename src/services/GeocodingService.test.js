import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpClient } from './HttpClient.js';
import { GeocodingService } from './GeocodingService.js';

const geocoding = new GeocodingService(new HttpClient());
const respond = (t, results) => {
  const urls = [];
  t.mock.method(globalThis, 'fetch', async (url) => { urls.push(url); return { ok: true, json: async () => ({ results }) }; });
  return urls;
};
const portlandOR = { name: 'Portland', admin1: 'Oregon', country: 'United States', country_code: 'US', latitude: 45.52, longitude: -122.68 };
const portlandME = { name: 'Portland', admin1: 'Maine', country: 'United States', country_code: 'US', latitude: 43.66, longitude: -70.26 };

test('search returns the first match as a Location', async (t) => {
  const urls = respond(t, [{ name: 'Hoboken', country_code: 'US', latitude: 40.74, longitude: -74.03 }]);
  const place = await geocoding.search('Hoboken');
  assert.equal(place.name, 'Hoboken');
  assert.equal(place.id, '40.74,-74.03');
  assert.match(urls[0], /count=1&/);
});

test('search rejects when no city matches', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({}) }));
  await assert.rejects(geocoding.search('Nowhereville'), /No city found for "Nowhereville"/);
});

test('search rejects with a friendly message on network failure', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(geocoding.search('Hoboken'), /Network error/);
});

test('searchMany returns every match in order, asking for up to 5', async (t) => {
  const urls = respond(t, [portlandOR, portlandME]);
  const places = await geocoding.searchMany('Portland');
  assert.deepEqual(places.map((p) => p.label()), ['Portland, Oregon, United States', 'Portland, Maine, United States']);
  assert.match(urls[0], /count=5&/);
});

test('searchMany trims the name and rejects an empty one without calling the API', async (t) => {
  const urls = respond(t, [portlandOR]);
  await geocoding.searchMany('  Portland  ');
  assert.match(urls[0], /name=portland$/);
  await assert.rejects(geocoding.searchMany('   '), /Type a city name/);
  assert.equal(urls.length, 1);
});

test('searchMany skips results without valid coordinates', async (t) => {
  respond(t, [{ name: 'Broken', latitude: null, longitude: 5 }, portlandME]);
  assert.deepEqual((await geocoding.searchMany('Portland')).map((p) => p.region), ['Maine']);
});

test('searchMany rejects when every result has invalid coordinates', async (t) => {
  respond(t, [{ name: 'Broken', latitude: 'abc', longitude: 5 }]);
  await assert.rejects(geocoding.searchMany('Broken'), /No city found/);
});

test('searchMany understands "City, State, Country" and puts that place first', async (t) => {
  const urls = respond(t, [portlandOR, portlandME]);
  const places = await geocoding.searchMany('Portland, Maine, United States');
  assert.equal(places[0].region, 'Maine');
  assert.equal(places.length, 2);
  assert.match(urls[0], /count=10&.*name=portland$/);
});

test('searchMany matches qualifiers by country code or the start of a name', async (t) => {
  const parisFR = { name: 'Paris', admin1: 'Île-de-France', country: 'France', country_code: 'FR', latitude: 48.85, longitude: 2.35 };
  const parisTX = { name: 'Paris', admin1: 'Texas', country: 'United States', country_code: 'US', latitude: 33.66, longitude: -95.56 };
  respond(t, [parisFR, parisTX]);
  assert.equal((await geocoding.searchMany('Paris, US')).at(0).region, 'Texas');
  assert.equal((await geocoding.searchMany('paris, tex')).at(0).region, 'Texas');
  assert.equal((await geocoding.searchMany('Paris, Nowhere')).at(0).region, 'Île-de-France'); // no match keeps API order
});

test('searchMany still returns at most `count` places when narrowing', async (t) => {
  respond(t, Array.from({ length: 8 }, (_, i) => ({ ...portlandOR, latitude: 40 + i })));
  assert.equal((await geocoding.searchMany('Portland, Oregon', 3)).length, 3);
});

test('searchMany lists places with the same id once', async (t) => {
  respond(t, [portlandOR, { ...portlandOR, name: 'Portland (duplicate)', latitude: 45.521 }]);
  assert.equal((await geocoding.searchMany('Portland')).length, 1);
});
