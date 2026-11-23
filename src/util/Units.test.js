import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Units } from './Units.js';

test('cToF converts Celsius to Fahrenheit', () => {
  assert.equal(Units.cToF(0), 32);
  assert.equal(Units.cToF(20), 68);
  assert.equal(Units.cToF(-40), -40);
});

test('kmhToMph converts speed', () => {
  assert.equal(Math.round(Units.kmhToMph(16.09)), 10);
});

test('formatTemp rounds and adds the unit', () => {
  assert.equal(Units.formatTemp(13.7, 'C'), '14°C');
  assert.equal(Units.formatTemp(13.7, 'F'), '57°F');
});

test('formatTemp never shows -0', () => {
  assert.equal(Units.formatTemp(-0.3, 'C'), '0°C');
});

test('formatSpeed uses km/h for C and mph for F', () => {
  assert.equal(Units.formatSpeed(18.8, 'C'), '19 km/h');
  assert.equal(Units.formatSpeed(18.8, 'F'), '12 mph');
});
