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

const sun = { sunrise: '2026-11-23T06:50', sunset: '2026-11-23T16:30' };

test('dayProgress is 0 at sunrise, 0.5 at midday, and 1 at sunset', () => {
  assert.equal(SunView.dayProgress(sun, '2026-11-23T06:50'), 0);
  assert.equal(SunView.dayProgress(sun, '2026-11-23T11:40'), 0.5);
  assert.equal(SunView.dayProgress(sun, '2026-11-23T16:30'), 1);
});

test('dayProgress is below 0 before sunrise and above 1 after sunset', () => {
  assert.ok(SunView.dayProgress(sun, '2026-11-23T05:00') < 0);
  assert.ok(SunView.dayProgress(sun, '2026-11-23T20:00') > 1);
});

test('statusText counts down to sunrise, then daylight, then says the sun has set', () => {
  assert.equal(SunView.statusText(sun, 580, '2026-11-23T05:45'), 'Sunrise in 1 h 5 min');
  assert.equal(SunView.statusText(sun, 137, '2026-11-23T14:13'), '2 h 17 min of daylight left');
  assert.equal(SunView.statusText(sun, 0, '2026-11-23T20:00'), 'The sun has set');
});
