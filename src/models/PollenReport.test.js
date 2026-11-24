import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, PollenReport } from './PollenReport.js';

function apiJson(values) {
  const current = { time: '2026-05-04T10:00' };
  for (const type of PollenReport.TYPES) current[`${type}_pollen`] = values[type] ?? null;
  return { current };
}

function reportWith(levels) {
  return new PollenReport({
    time: '2026-05-04T10:00',
    levels: { alder: 0, birch: 0, grass: 0, mugwort: 0, olive: 0, ragweed: 0, ...levels },
  });
}

test('fromApi returns null when every value is null (outside Europe)', () => {
  assert.equal(PollenReport.fromApi(apiJson({})), null);
});

test('fromApi returns null when the response has no current block', () => {
  assert.equal(PollenReport.fromApi({}), null);
});

test('fromApi keeps the time and every pollen type', () => {
  const report = PollenReport.fromApi(apiJson({ birch: 120.5, grass: 3 }));
  assert.equal(report.time, '2026-05-04T10:00');
  assert.deepEqual(report.levels, { alder: null, birch: 120.5, grass: 3, mugwort: null, olive: null, ragweed: null });
});

test('fromApi keeps zeros, so a quiet winter day in Europe is still a report', () => {
  const zeros = Object.fromEntries(PollenReport.TYPES.map((type) => [type, 0]));
  assert.ok(PollenReport.fromApi(apiJson(zeros)) instanceof PollenReport);
});

test('overallLevel is Low below the moderate threshold', () => {
  assert.equal(reportWith({}).overallLevel(), 'Low');
  assert.equal(reportWith({ grass: LEVELS.moderate - 0.1 }).overallLevel(), 'Low');
});

test('overallLevel is Moderate from the moderate threshold up to the high one', () => {
  assert.equal(reportWith({ grass: LEVELS.moderate }).overallLevel(), 'Moderate');
  assert.equal(reportWith({ grass: LEVELS.high - 0.1 }).overallLevel(), 'Moderate');
});

test('overallLevel is High at and above the high threshold', () => {
  assert.equal(reportWith({ birch: LEVELS.high }).overallLevel(), 'High');
  assert.equal(reportWith({ birch: 900 }).overallLevel(), 'High');
});

test('overallLevel uses the highest value, not the average', () => {
  assert.equal(reportWith({ alder: 1, birch: 2, ragweed: 60 }).overallLevel(), 'High');
});

test('topAllergen names the pollen type with the highest value', () => {
  assert.equal(reportWith({ alder: 4, birch: 25, grass: 12 }).topAllergen(), 'birch');
});

test('topAllergen skips types with no data', () => {
  const report = new PollenReport({
    time: null,
    levels: { alder: null, birch: null, grass: 7, mugwort: null, olive: null, ragweed: null },
  });
  assert.equal(report.topAllergen(), 'grass');
  assert.equal(report.overallLevel(), 'Low');
});

test('topAllergen is null when there is no pollen in the air', () => {
  assert.equal(reportWith({}).topAllergen(), null);
});
