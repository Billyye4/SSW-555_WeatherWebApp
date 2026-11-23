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

test('forecastRange runs from today to the last forecast day (US-09)', () => {
  assert.deepEqual(report({ today: '2026-11-23', forecastDays: 16 }).forecastRange(),
    { min: '2026-11-23', max: '2026-12-08' });
});

test('rainChanceOn returns the chance for dates in range, including both ends (US-09)', () => {
  const r = report({
    today: '2026-11-23',
    daily: { precipitation_probability_max: (date, offset) => offset * 5 },
  });
  assert.equal(r.rainChanceOn('2026-11-23'), 0);
  assert.equal(r.rainChanceOn('2026-11-28'), 25);
  assert.equal(r.rainChanceOn('2026-12-08'), 75);
});

test('rainChanceOn returns null outside the forecast range (US-09)', () => {
  const r = report({ today: '2026-11-23' });
  assert.equal(r.rainChanceOn('2026-11-22'), null); // past days are history, not forecast
  assert.equal(r.rainChanceOn('2026-12-09'), null);
});

test('rainChanceOn returns null when the API has no value for that day (US-09)', () => {
  const r = report({ daily: { precipitation_probability_max: () => null } });
  assert.equal(r.rainChanceOn(r.today()), null);
});

test('history is the 7 days before today and week is the 7 days from today (US-10)', () => {
  const r = report({ today: '2026-11-23', pastDays: 7, forecastDays: 16 });
  assert.deepEqual(r.history().map((d) => d.date), [
    '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22',
  ]);
  assert.equal(r.week().length, 7);
  assert.equal(r.week()[0].date, '2026-11-23');
  assert.equal(r.week()[6].date, '2026-11-29');
});

test('trendVsLastWeek compares average highs (US-10)', () => {
  // Last week's highs are 10, this week's are 13: three degrees warmer.
  const r = report({ daily: { temperature_2m_max: (date, offset) => (offset < 0 ? 10 : 13) } });
  assert.deepEqual(r.trendVsLastWeek(), { avgHighThisWeekC: 13, avgHighLastWeekC: 10, differenceC: 3 });
});

test('trendVsLastWeek skips missing values and returns null without history (US-10)', () => {
  const gaps = report({ daily: { temperature_2m_max: (date, offset) => (offset === -1 ? null : 10) } });
  assert.equal(gaps.trendVsLastWeek().differenceC, 0);
  assert.equal(report({ pastDays: 0 }).trendVsLastWeek(), null);
});
