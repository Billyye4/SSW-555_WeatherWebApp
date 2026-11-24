import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStore } from './LocalStore.js';
import { FavoritesStore } from './FavoritesStore.js';
import { Location } from '../models/Location.js';
import { fakeStorage } from '../testing/fakeStorage.js';

const hoboken = new Location({ name: 'Hoboken', countryCode: 'US', latitude: 40.744, longitude: -74.032 });
const london = new Location({ name: 'London', countryCode: 'GB', latitude: 51.508, longitude: -0.126 });
const newStore = (initial) => new FavoritesStore(new LocalStore(fakeStorage(initial)));

test('starts empty', () => {
  assert.deepEqual(newStore().list(), []);
});

test('add keeps insertion order and returns Location objects', () => {
  const favorites = newStore();
  favorites.add(hoboken);
  favorites.add(london);
  const list = favorites.list();
  assert.deepEqual(list.map((l) => l.name), ['Hoboken', 'London']);
  assert.ok(list[0] instanceof Location);
  assert.equal(list[0].label(), 'Hoboken');
});

test('add ignores a location that is already saved', () => {
  const favorites = newStore();
  favorites.add(hoboken);
  favorites.add(new Location({ name: 'Hoboken again', latitude: 40.7441, longitude: -74.0319 }));
  assert.equal(favorites.list().length, 1);
});

test('has and remove work by id', () => {
  const favorites = newStore();
  favorites.add(hoboken);
  favorites.add(london);
  assert.equal(favorites.has(hoboken.id), true);
  favorites.remove(hoboken.id);
  assert.equal(favorites.has(hoboken.id), false);
  assert.deepEqual(favorites.list().map((l) => l.name), ['London']);
});

test('persists across store instances', () => {
  const storage = fakeStorage();
  new FavoritesStore(new LocalStore(storage)).add(london);
  assert.equal(new FavoritesStore(new LocalStore(storage)).list()[0].name, 'London');
});

test('ignores corrupt or malformed saved data', () => {
  assert.deepEqual(newStore({ 'weather:favorites': '{oops' }).list(), []);
  assert.deepEqual(newStore({ 'weather:favorites': '"not a list"' }).list(), []);
  const mixed = newStore({ 'weather:favorites': JSON.stringify([{ name: 'No coords' }, london.toJSON()]) });
  assert.deepEqual(mixed.list().map((l) => l.name), ['London']);
});
