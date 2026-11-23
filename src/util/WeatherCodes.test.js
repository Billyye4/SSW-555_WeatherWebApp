import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WeatherCodes } from './WeatherCodes.js';

test('describe maps known codes to a label and icon', () => {
  assert.deepEqual(WeatherCodes.describe(0), { label: 'Clear sky', icon: '☀️', category: 'clear' });
  assert.equal(WeatherCodes.describe(63).label, 'Rain');
});

test('describe falls back for unknown codes', () => {
  assert.equal(WeatherCodes.describe(999).label, 'Unknown');
});

test('describe groups codes into categories', () => {
  const category = (code) => WeatherCodes.describe(code).category;
  assert.equal(category(2), 'cloudy');
  assert.equal(category(45), 'fog');
  assert.equal(category(61), 'rain');
  assert.equal(category(81), 'rain');
  assert.equal(category(75), 'snow');
  assert.equal(category(86), 'snow');
  assert.equal(category(95), 'storm');
});
