import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WeeklyView } from './WeeklyView.js';

const day = (lowC, highC) => ({ lowC, highC });

test('rangeScale spans the coldest low to the warmest high of the week', () => {
  assert.deepEqual(WeeklyView.rangeScale([day(2, 9), day(-1, 6), day(4, 12)]), { min: -1, max: 12 });
});

test('rangeScale skips missing values and is null with no data', () => {
  assert.deepEqual(WeeklyView.rangeScale([day(null, 9), day(3, null)]), { min: 3, max: 9 });
  assert.equal(WeeklyView.rangeScale([day(null, null)]), null);
});

test('position places a temperature on the week scale as a percentage', () => {
  const scale = { min: 0, max: 20 };
  assert.equal(WeeklyView.position(0, scale), 0);
  assert.equal(WeeklyView.position(5, scale), 25);
  assert.equal(WeeklyView.position(20, scale), 100);
});

test('position stays on the bar for out-of-range values and a flat week', () => {
  assert.equal(WeeklyView.position(-5, { min: 0, max: 20 }), 0);
  assert.equal(WeeklyView.position(30, { min: 0, max: 20 }), 100);
  assert.equal(WeeklyView.position(7, { min: 7, max: 7 }), 50);
});
