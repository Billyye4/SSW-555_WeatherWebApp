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
});
