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
