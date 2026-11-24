import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Icons } from './Icons.js';

test('kindFor groups weather codes into icon families', () => {
  assert.equal(Icons.kindFor(0), 'clear');
  assert.equal(Icons.kindFor(1), 'mostly-clear');
  assert.equal(Icons.kindFor(2), 'partly-cloudy');
  assert.equal(Icons.kindFor(3), 'overcast');
  assert.equal(Icons.kindFor(48), 'fog');
  assert.equal(Icons.kindFor(55), 'drizzle');
  assert.equal(Icons.kindFor(81), 'rain');
  assert.equal(Icons.kindFor(86), 'snow');
  assert.equal(Icons.kindFor(99), 'storm');
});

test('kindFor draws unknown codes as overcast', () => {
  assert.equal(Icons.kindFor(999), 'overcast');
});

test('svg shows the sun by day and the moon at night for clear skies', () => {
  const day = Icons.svg(0, true);
  const night = Icons.svg(0, false);
  assert.match(day, /<circle[^>]*fill="#ffc83d"/);
  assert.doesNotMatch(night, /#ffc83d/);
  assert.match(night, /fill="#f3efd2"/);
});

test('svg is decorative, so screen readers skip it', () => {
  assert.match(Icons.svg(63), /^<svg [^>]*aria-hidden="true"/);
});
