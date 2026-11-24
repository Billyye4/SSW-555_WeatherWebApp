import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Dates } from './Dates.js';

test('addDays crosses month and year boundaries', () => {
  assert.equal(Dates.addDays('2026-11-23', 15), '2026-12-08');
  assert.equal(Dates.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(Dates.addDays('2026-03-01', -1), '2026-02-28');
});

test('formatDay and formatWeekday', () => {
  assert.equal(Dates.formatDay('2026-11-28'), 'Sat, Nov 28');
  assert.equal(Dates.formatWeekday('2026-11-28'), 'Sat');
  assert.equal(Dates.formatMonthDay('2026-11-28'), 'Nov 28');
});

test('minutesBetween subtracts local times without a time zone shift', () => {
  assert.equal(Dates.minutesBetween('2026-11-23T06:52', '2026-11-23T16:32'), 580);
  assert.equal(Dates.minutesBetween('2026-11-23T23:30', '2026-11-24T00:15'), 45);
  assert.equal(Dates.minutesBetween('2026-11-23T16:32', '2026-11-23T14:15'), -137);
});

test('formatTime shows 12-hour local time', () => {
  assert.equal(Dates.formatTime('2026-11-23T00:05'), '12:05 AM');
  assert.equal(Dates.formatTime('2026-11-23T12:00'), '12:00 PM');
  assert.equal(Dates.formatTime('2026-11-23T19:15'), '7:15 PM');
});
