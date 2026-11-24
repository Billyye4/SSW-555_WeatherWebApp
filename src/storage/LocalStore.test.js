import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStore } from './LocalStore.js';
import { fakeStorage } from '../testing/fakeStorage.js';

test('set and get round-trip JSON under the weather: prefix', () => {
  const storage = fakeStorage();
  const store = new LocalStore(storage);
  store.set('unit', 'C');
  assert.equal(store.get('unit', 'F'), 'C');
  assert.equal(storage.dump()['weather:unit'], '"C"');
});

test('get returns the fallback for missing or corrupt values', () => {
  const store = new LocalStore(fakeStorage({ 'weather:bad': '{not json' }));
  assert.equal(store.get('missing', 'fallback'), 'fallback');
  assert.deepEqual(store.get('bad', []), []);
});

test('set does not throw when storage is full', () => {
  const store = new LocalStore({ getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } });
  assert.doesNotThrow(() => store.set('unit', 'C'));
});
