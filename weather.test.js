import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describe, geocode, getForecast } from './weather.js';

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

test('getForecast requests and returns daily conditions for seven days', async (t) => {
  let requestedUrl;
  const dates = Array.from({ length: 7 }, (_, index) => `2026-11-${String(index + 23).padStart(2, '0')}`);
  t.mock.method(globalThis, 'fetch', async (url) => {
    requestedUrl = url;
    return {
      ok: true,
      json: async () => ({
        daily: {
          time: dates,
          weather_code: [0, 1, 2, 3, 45, 61, 95],
          temperature_2m_max: [10, 11, 12, 13, 14, 15, 16],
          temperature_2m_min: [1, 2, 3, 4, 5, 6, 7],
        },
        daily_units: {
          temperature_2m_max: '°C',
          temperature_2m_min: '°C',
        },
      }),
    };
  });

  const forecast = await getForecast(40.74, -74.03);
  assert.match(requestedUrl, /forecast_days=7/);
  assert.match(requestedUrl, /latitude=40\.74&longitude=-74\.03/);
  assert.equal(forecast.days.length, 7);
  assert.deepEqual(forecast.days[0], {
    date: dates[0],
    weather_code: 0,
    temperature_2m_max: 10,
    temperature_2m_min: 1,
  });
  assert.equal(forecast.units.temperature_2m_max, '°C');
});
