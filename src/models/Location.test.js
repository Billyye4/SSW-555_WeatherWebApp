import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Location } from './Location.js';

const hoboken = Location.fromGeocoding({
  name: 'Hoboken', admin1: 'New Jersey', country: 'United States', country_code: 'US',
  latitude: 40.74399, longitude: -74.03236,
});

test('fromGeocoding maps the Open-Meteo fields', () => {
  assert.equal(hoboken.region, 'New Jersey');
  assert.equal(hoboken.countryCode, 'US');
});

test('id is the coordinates rounded to 2 decimals', () => {
  assert.equal(hoboken.id, '40.74,-74.03');
});

test('label skips empty parts', () => {
  assert.equal(hoboken.label(), 'Hoboken, New Jersey, United States');
  assert.equal(new Location({ name: 'Your location', latitude: 1, longitude: 2 }).label(), 'Your location');
});

test('survives a JSON round trip', () => {
  const copy = Location.fromJSON(JSON.parse(JSON.stringify(hoboken)));
  assert.equal(copy.id, hoboken.id);
  assert.equal(copy.label(), hoboken.label());
});
