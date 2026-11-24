import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SunView } from './SunView.js';

test('formatClock shows 12-hour local time', () => {
  assert.equal(SunView.formatClock('2026-11-23T06:52'), '6:52 AM');
  assert.equal(SunView.formatClock('2026-11-23T16:32'), '4:32 PM');
});

test('formatClock handles midnight and noon', () => {
  assert.equal(SunView.formatClock('2026-06-21T00:05'), '12:05 AM');
  assert.equal(SunView.formatClock('2026-06-21T12:00'), '12:00 PM');
});

test('formatDuration shows hours and minutes', () => {
  assert.equal(SunView.formatDuration(137), '2 h 17 min');
  assert.equal(SunView.formatDuration(45), '45 min');
  assert.equal(SunView.formatDuration(120), '2 h');
});
