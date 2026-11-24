import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HourlyView } from './HourlyView.js';

test('formatHour shows the hour in 12-hour time', () => {
  assert.equal(HourlyView.formatHour('2026-11-23T00:00'), '12 AM');
  assert.equal(HourlyView.formatHour('2026-11-23T09:00'), '9 AM');
  assert.equal(HourlyView.formatHour('2026-11-23T12:00'), '12 PM');
  assert.equal(HourlyView.formatHour('2026-11-23T18:00'), '6 PM');
});
