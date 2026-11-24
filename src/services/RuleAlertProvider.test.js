import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleAlertProvider } from './RuleAlertProvider.js';
import { WeatherReport } from '../models/WeatherReport.js';
import { Location } from '../models/Location.js';
import { forecastJson } from '../testing/forecastFixture.js';

const london = new Location({ name: 'London', countryCode: 'GB', latitude: 51.51, longitude: -0.13 });
const rules = new RuleAlertProvider();
// `daily` values are functions of (date, offsetFromToday); offset 0 is today.
const evaluate = (daily) => rules.evaluate(WeatherReport.fromApi(london, forecastJson({ today: '2026-11-23', daily })));
const titles = (alerts) => alerts.map((a) => a.title);

test('calm weather produces no alerts', () => {
  assert.deepEqual(evaluate({}), []);
});

test('each threshold triggers its alert', () => {
  assert.deepEqual(titles(evaluate({ weather_code: (d, o) => (o === 1 ? 95 : 0) })), ['Thunderstorm expected']);
  assert.deepEqual(titles(evaluate({ wind_gusts_10m_max: (d, o) => (o === 0 ? 75 : 30) })), ['High wind expected']);
  assert.deepEqual(titles(evaluate({ temperature_2m_max: (d, o) => (o === 2 ? 35 : 20) })), ['Extreme heat expected']);
  assert.deepEqual(titles(evaluate({ temperature_2m_min: (d, o) => (o === 0 ? -15 : 0) })), ['Extreme cold expected']);
  assert.deepEqual(titles(evaluate({ weather_code: (d, o) => (o === 0 ? 86 : 0) })), ['Heavy snow expected']);
});

test('values just under a threshold do not trigger', () => {
  assert.deepEqual(evaluate({
    wind_gusts_10m_max: () => 74.9,
    temperature_2m_max: () => 34.9,
    temperature_2m_min: () => -14.9,
    weather_code: () => 73,
  }), []);
});

test('only the next 3 days count, not history or later days', () => {
  assert.deepEqual(evaluate({ weather_code: (d, o) => (o === -1 || o === 3 ? 95 : 0) }), []);
});

test('one alert per rule, for the first day it applies, most severe first', () => {
  const alerts = evaluate({
    weather_code: (d, o) => (o === 0 ? 86 : o >= 1 ? 95 : 0),
  });
  assert.deepEqual(titles(alerts), ['Thunderstorm expected', 'Heavy snow expected']);
  assert.equal(alerts[0].starts, '2026-11-24');
  assert.equal(alerts[0].id, 'forecast:51.51,-0.13:storm:2026-11-24');
  assert.equal(alerts[0].source, 'forecast');
  assert.match(alerts[0].headline, /Tue, Nov 24/);
});
