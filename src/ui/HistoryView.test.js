// Tests the pure helpers only; the chart itself is checked in the browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HistoryView } from './HistoryView.js';

test('trendText says warmer, colder, or the same in the chosen unit', () => {
  const trend = (now, before) => ({ avgHighThisWeekC: now, avgHighLastWeekC: before, differenceC: now - before });
  assert.equal(HistoryView.trendText(trend(13, 10), 'C'), 'This week averages 3°C warmer than last week (13°C vs. 10°C).');
  assert.equal(HistoryView.trendText(trend(10, 13), 'F'), 'This week averages 5°F colder than last week (50°F vs. 55°F).');
  assert.equal(HistoryView.trendText(trend(10, 10.2), 'C'), "This week's highs match last week's (average 10°C).");
  assert.equal(HistoryView.trendText(null, 'C'), 'Not enough data to compare with last week.');
});

test('niceTicks covers the range with round steps', () => {
  assert.deepEqual(HistoryView.niceTicks(41, 58), [40, 45, 50, 55, 60]);
  assert.deepEqual(HistoryView.niceTicks(3, 6), [3, 4, 5, 6]);
  assert.deepEqual(HistoryView.niceTicks(-12, 30), [-20, 0, 20, 40]);
  assert.deepEqual(HistoryView.niceTicks(50, 50), [49, 50, 51]);
});
