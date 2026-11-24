import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpClient } from './HttpClient.js';
import { WeatherService } from './WeatherService.js';
import { Location } from '../models/Location.js';
import { forecastJson } from '../testing/forecastFixture.js';

const place = new Location({ name: 'Hoboken', latitude: 40.74, longitude: -74.03 });

test('reportUrl asks for current, hourly, and daily data in the location time zone', () => {
  const url = new URL(WeatherService.reportUrl(place));
  assert.equal(url.searchParams.get('latitude'), '40.74');
  assert.equal(url.searchParams.get('longitude'), '-74.03');
  assert.equal(url.searchParams.get('timezone'), 'auto');
  assert.match(url.searchParams.get('current'), /temperature_2m/);
  assert.match(url.searchParams.get('current'), /wind_speed_10m,wind_direction_10m/); // US-08
  assert.match(url.searchParams.get('hourly'), /precipitation_probability/);
  assert.match(url.searchParams.get('daily'), /temperature_2m_max/);
  assert.match(url.searchParams.get('daily'), /precipitation_probability_max/); // US-09
  assert.equal(url.searchParams.get('forecast_days'), '16'); // US-09
});

test('getReport makes one request and returns a WeatherReport', async () => {
  let calls = 0;
  const http = new HttpClient(async () => { calls++; return { ok: true, json: async () => forecastJson() }; });
  const report = await new WeatherService(http).getReport(place);
  assert.equal(calls, 1);
  assert.equal(report.location, place);
  assert.equal(report.current.temperatureC, 10);
});
