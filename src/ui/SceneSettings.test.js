import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SceneSettings } from './SceneSettings.js';

const at = (weatherCode, isDay = true, wind = {}) => SceneSettings.for({ weatherCode, isDay, ...wind });

test('clear days show the sun and clear nights show stars', () => {
  assert.equal(at(0, true).sun, 1);
  assert.equal(at(0, true).stars, 0);
  assert.equal(at(0, false).sun, 0);
  assert.equal(at(0, false).stars, 1);
});

test('cloud cover grows from clear to overcast', () => {
  const cover = [0, 1, 2, 3].map((code) => at(code).clouds);
  assert.deepEqual(cover, [...cover].sort((a, b) => a - b));
  assert.equal(at(3).clouds, 1);
  assert.equal(at(3).sun, 0);
});

test('rain and snow scale with intensity', () => {
  assert.ok(at(61).rain < at(63).rain && at(63).rain < at(65).rain);
  assert.ok(at(51).rain < at(61).rain); // drizzle is lighter than rain
  assert.ok(at(71).snow < at(75).snow);
  assert.equal(at(63).snow, 0);
  assert.equal(at(73).rain, 0);
});

test('storms bring dark clouds, rain, and lightning', () => {
  const storm = at(95);
  assert.equal(storm.cloudShade, 'dark');
  assert.ok(storm.rain > 0);
  assert.equal(storm.lightning, true);
  assert.equal(at(63).lightning, false);
});

test('fog shows fog banks', () => {
  assert.equal(at(45).fog, 1);
  assert.equal(at(3).fog, 0);
});

test('windDrift pushes right for a west wind and left for an east wind', () => {
  assert.equal(SceneSettings.windDrift(40, 270), 1);
  assert.equal(SceneSettings.windDrift(40, 90), -1);
  assert.equal(SceneSettings.windDrift(20, 270), 0.5);
});

test('windDrift is 0 for calm air, a north wind, or an unknown direction', () => {
  assert.equal(SceneSettings.windDrift(0, 270), 0);
  assert.equal(SceneSettings.windDrift(30, 0), 0);
  assert.equal(SceneSettings.windDrift(30, null), 0);
});

test('for passes the wind through as drift', () => {
  assert.equal(at(3, true, { windKmh: 40, windDirectionDeg: 270 }).wind, 1);
});

test('night is set after dark, so clouds can be drawn darker', () => {
  assert.equal(at(3, false).night, true);
  assert.equal(at(3, true).night, false);
});
