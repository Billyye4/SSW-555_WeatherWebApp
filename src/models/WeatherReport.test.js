import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WeatherReport } from './WeatherReport.js';
import { Location } from './Location.js';
import { forecastJson } from '../testing/forecastFixture.js';

const place = new Location({ name: 'Hoboken', countryCode: 'US', latitude: 40.74, longitude: -74.03 });
const report = (opts) => WeatherReport.fromApi(place, forecastJson(opts));

test('fromApi parses current conditions into metric fields', () => {
  const r = report({ current: { temperature_2m: 13.7, wind_speed_10m: 18.8, is_day: 0 } });
  assert.equal(r.current.temperatureC, 13.7);
  assert.equal(r.current.windKmh, 18.8);
  assert.equal(r.current.isDay, false);
  assert.equal(r.location, place);
});

test('fromApi parses every hourly and daily entry', () => {
  const r = report({ pastDays: 7, forecastDays: 16 });
  assert.equal(r.hourly.length, 24);
  assert.equal(r.daily.length, 23);
  assert.equal(r.daily[0].date, '2026-11-16');
  assert.equal(r.daily[0].highC, 15);
});

test('today is the location-local date of the current conditions', () => {
  assert.equal(report({ today: '2026-12-31' }).today(), '2026-12-31');
});
