// Tests notify(); the button is checked in the browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AlertNotifier } from './AlertNotifier.js';
import { LocalStore } from '../storage/LocalStore.js';
import { fakeStorage } from '../testing/fakeStorage.js';

function fakeNotification(permission) {
  const shown = [];
  class FakeNotification {
    static permission = permission;
    static async requestPermission() { return permission; }
    constructor(title, options) { shown.push({ title, ...options }); }
  }
  return { FakeNotification, shown };
}

const london = { name: 'London' };
const alert = (id) => ({ id, title: 'High wind expected', headline: `Gusts (${id})` });

test('shows a notification for each new alert', () => {
  const { FakeNotification, shown } = fakeNotification('granted');
  const notifier = new AlertNotifier(new LocalStore(fakeStorage()), FakeNotification);
  notifier.notify([{ location: london, alerts: [alert('a'), alert('b')] }]);
  assert.deepEqual(shown.map((n) => n.title), ['High wind expected: London', 'High wind expected: London']);
  assert.equal(shown[0].tag, 'a');
});

test('does not repeat alerts it has already seen, even after a reload', () => {
  const storage = fakeStorage();
  const first = fakeNotification('granted');
  new AlertNotifier(new LocalStore(storage), first.FakeNotification).notify([{ location: london, alerts: [alert('a')] }]);
  const second = fakeNotification('granted');
  new AlertNotifier(new LocalStore(storage), second.FakeNotification)
    .notify([{ location: london, alerts: [alert('a'), alert('b')] }]);
  assert.deepEqual(second.shown.map((n) => n.tag), ['b']);
});

test('silent mode marks alerts as seen without showing them', () => {
  const { FakeNotification, shown } = fakeNotification('granted');
  const notifier = new AlertNotifier(new LocalStore(fakeStorage()), FakeNotification);
  notifier.notify([{ location: london, alerts: [alert('a')] }], { silent: true });
  notifier.notify([{ location: london, alerts: [alert('a')] }]);
  assert.equal(shown.length, 0);
});

test('shows nothing without permission or browser support', () => {
  const denied = fakeNotification('denied');
  new AlertNotifier(new LocalStore(fakeStorage()), denied.FakeNotification)
    .notify([{ location: london, alerts: [alert('a')] }]);
  assert.equal(denied.shown.length, 0);
  const unsupported = new AlertNotifier(new LocalStore(fakeStorage()), undefined);
  assert.equal(unsupported.supported, false);
  assert.doesNotThrow(() => unsupported.notify([{ location: london, alerts: [alert('a')] }]));
});

test('keeps at most MAX_SEEN alert ids in storage', () => {
  const storage = fakeStorage();
  const store = new LocalStore(storage);
  const notifier = new AlertNotifier(store, fakeNotification('denied').FakeNotification);
  const many = Array.from({ length: AlertNotifier.MAX_SEEN + 5 }, (_, i) => alert(`id-${i}`));
  notifier.notify([{ location: london, alerts: many }]);
  assert.equal(store.get(AlertNotifier.SEEN_KEY, []).length, AlertNotifier.MAX_SEEN);
});
