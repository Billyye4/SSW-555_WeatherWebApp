import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStore } from './LocalStore.js';
import { PreferencesStore } from './PreferencesStore.js';
import { fakeStorage } from '../testing/fakeStorage.js';

test('unit defaults to F and remembers C', () => {
  const prefs = new PreferencesStore(new LocalStore(fakeStorage()));
  assert.equal(prefs.getUnit(), 'F');
  prefs.setUnit('C');
  assert.equal(prefs.getUnit(), 'C');
});

test('setUnit rejects anything other than C or F', () => {
  const prefs = new PreferencesStore(new LocalStore(fakeStorage()));
  assert.throws(() => prefs.setUnit('K'), /Unknown unit/);
});
