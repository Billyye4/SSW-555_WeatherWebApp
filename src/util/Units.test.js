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

test('degreesToCompass names all 16 points and wraps around', () => {
  assert.equal(Units.degreesToCompass(0), 'N');
  assert.equal(Units.degreesToCompass(22.5), 'NNE');
  assert.equal(Units.degreesToCompass(90), 'E');
  assert.equal(Units.degreesToCompass(331), 'NNW');
  assert.equal(Units.degreesToCompass(350), 'N');
  assert.equal(Units.degreesToCompass(360), 'N');
  assert.equal(Units.degreesToCompass(-90), 'W');
});

test('formatWind adds the compass direction', () => {
  assert.equal(Units.formatWind(18.8, 331, 'F'), '12 mph NNW');
  assert.equal(Units.formatWind(18.8, 180, 'C'), '19 km/h S');
  assert.equal(Units.formatWind(18.8, null, 'C'), '19 km/h');
});

test('formatSpeed uses km/h for C and mph for F', () => {
  assert.equal(Units.formatSpeed(18.8, 'C'), '19 km/h');
  assert.equal(Units.formatSpeed(18.8, 'F'), '12 mph');
});

test('formats the values the °F/°C toggle switches between (US-01)', () => {
  assert.equal(Units.formatTemp(20, 'C'), '20°C');
  assert.equal(Units.formatTemp(20, 'F'), '68°F');
  assert.equal(Units.formatTemp(-40, 'F'), '-40°F');
  assert.equal(Units.formatSpeed(16.09344, 'C'), '16 km/h');
  assert.equal(Units.formatSpeed(16.09344, 'F'), '10 mph');
});
