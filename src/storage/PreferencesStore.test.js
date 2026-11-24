import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStore } from './LocalStore.js';
import { PreferencesStore } from './PreferencesStore.js';
import { fakeStorage } from '../testing/fakeStorage.js';
import { Location } from '../models/Location.js';

test('unit defaults to F and remembers C', () => {
  const prefs = new PreferencesStore(new LocalStore(fakeStorage()));
  assert.equal(prefs.getUnit(), 'F');
  prefs.setUnit('C');
  assert.equal(prefs.getUnit(), 'C');
});

test('last location is null until one is saved, then survives a reload (US-04)', () => {
  const storage = fakeStorage();
  const prefs = new PreferencesStore(new LocalStore(storage));
  assert.equal(prefs.getLastLocation(), null);
  prefs.setLastLocation(new Location({ name: 'Your location', latitude: 40.744, longitude: -74.032 }));
  const reloaded = new PreferencesStore(new LocalStore(storage)).getLastLocation();
  assert.ok(reloaded instanceof Location);
  assert.equal(reloaded.id, '40.74,-74.03');
  assert.equal(reloaded.label(), 'Your location');
});

test('a corrupt saved last location reads as null (US-04)', () => {
  const corrupt = new PreferencesStore(new LocalStore(fakeStorage({ 'weather:lastLocation': '{"name":"x"}' })));
  assert.equal(corrupt.getLastLocation(), null);
  const broken = new PreferencesStore(new LocalStore(fakeStorage({ 'weather:lastLocation': '{oops' })));
  assert.equal(broken.getLastLocation(), null);
});

test('setUnit rejects anything other than C or F', () => {
  const prefs = new PreferencesStore(new LocalStore(fakeStorage()));
  assert.throws(() => prefs.setUnit('K'), /Unknown unit/);
});
