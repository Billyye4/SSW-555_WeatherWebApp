import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Theme } from './Theme.js';

test('themeFor combines the weather category with day or night', () => {
  assert.equal(Theme.themeFor(63, true), 'rain-day');
  assert.equal(Theme.themeFor(63, false), 'rain-night');
});

test('themeFor covers all six categories', () => {
  assert.equal(Theme.themeFor(0, true), 'clear-day');
  assert.equal(Theme.themeFor(3, true), 'cloudy-day');
  assert.equal(Theme.themeFor(45, false), 'fog-night');
  assert.equal(Theme.themeFor(81, true), 'rain-day');
  assert.equal(Theme.themeFor(75, false), 'snow-night');
  assert.equal(Theme.themeFor(95, true), 'storm-day');
});

test('themeFor falls back to cloudy for an unknown code', () => {
  assert.equal(Theme.themeFor(999, false), 'cloudy-night');
});

test('apply sets data-theme on the root element', () => {
  const root = { dataset: {} };
  new Theme(root).apply({ weatherCode: 71, isDay: true });
  assert.equal(root.dataset.theme, 'snow-day');
});

test('an attached scene gets the conditions already showing, then every update', () => {
  const seen = [];
  const theme = new Theme({ dataset: {} });
  theme.apply({ weatherCode: 63, isDay: true });
  theme.attachScene({ update: (c) => seen.push(c.weatherCode) });
  theme.apply({ weatherCode: 71, isDay: false });
  assert.deepEqual(seen, [63, 71]);
});

test('attaching a scene before any weather loads sends nothing yet', () => {
  const seen = [];
  new Theme({ dataset: {} }).attachScene({ update: (c) => seen.push(c) });
  assert.deepEqual(seen, []);
});
