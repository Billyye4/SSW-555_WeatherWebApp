import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describe, geocode, getCurrent } from './weather.js';

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

test('getCurrent returns the next 24 hourly temperatures and weather codes', async (t) => {
  let requestedUrl;
  const times = Array.from({ length: 48 }, (_, index) => {
    const hour = String(index % 24).padStart(2, '0');
    const day = index < 24 ? '2026-11-23' : '2026-11-24';
    return `${day}T${hour}:00`;
  });
  t.mock.method(globalThis, 'fetch', async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      json: async () => ({
        current: {
          time: '2026-11-23T18:00',
          temperature_2m: 10,
          apparent_temperature: 9,
          relative_humidity_2m: 70,
          wind_speed_10m: 8,
          weather_code: 3,
        },
        current_units: { temperature_2m: '°C' },
        hourly: {
          time: times,
          temperature_2m: times.map((_, index) => index),
          weather_code: times.map(() => 2),
        },
        hourly_units: { temperature_2m: '°C' },
      }),
    };
  });

  const current = await getCurrent(40.74, -74.03);
  assert.match(requestedUrl, /hourly=temperature_2m,weather_code/);
  assert.equal(current.hours.length, 24);
  assert.equal(current.hours[0].time, '2026-11-23T18:00');
  assert.equal(current.hours[0].temperature_2m, 18);
  assert.equal(current.hours.at(-1).time, '2026-11-24T17:00');
  assert.equal(current.hourlyUnits.temperature_2m, '°C');
});
