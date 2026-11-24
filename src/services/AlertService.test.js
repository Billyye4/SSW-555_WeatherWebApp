import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AlertService } from './AlertService.js';
import { Location } from '../models/Location.js';

const hoboken = new Location({ name: 'Hoboken', countryCode: 'US', latitude: 40.74, longitude: -74.03 });
const london = new Location({ name: 'London', countryCode: 'GB', latitude: 51.51, longitude: -0.13 });
const here = new Location({ name: 'Your location', latitude: 35.0, longitude: -90.0 }); // country unknown

function setup({ nwsFails = false } = {}) {
  const calls = { nws: 0, rules: 0, reports: 0 };
  const nws = {
    async fetchAlerts() {
      calls.nws++;
      if (nwsFails) throw new Error('Weather service is unavailable.');
      return [{ id: 'nws-1', title: 'NWS alert' }];
    },
  };
  const rules = { evaluate: (report) => { calls.rules++; return [{ id: `rule-${report.name}`, title: 'Rule alert' }]; } };
  const weather = { getReport: async (location) => { calls.reports++; return { name: location.name }; } };
  return { service: new AlertService(nws, rules, weather), calls };
}

test('US locations use NWS', async () => {
  const { service, calls } = setup();
  assert.deepEqual((await service.getAlerts(hoboken)).map((a) => a.id), ['nws-1']);
  assert.deepEqual(calls, { nws: 1, rules: 0, reports: 0 });
});

test('locations with an unknown country try NWS first', async () => {
  const { service, calls } = setup();
  await service.getAlerts(here);
  assert.equal(calls.nws, 1);
});

test('non-US locations use the forecast rules without calling NWS', async () => {
  const { service, calls } = setup();
  assert.deepEqual((await service.getAlerts(london)).map((a) => a.id), ['rule-London']);
  assert.equal(calls.nws, 0);
});

test('falls back to the rules when NWS fails', async () => {
  const { service, calls } = setup({ nwsFails: true });
  assert.deepEqual((await service.getAlerts(here)).map((a) => a.id), ['rule-Your location']);
  assert.equal(calls.rules, 1);
});

test('reuses a report it was given instead of fetching one', async () => {
  const { service, calls } = setup();
  await service.getAlerts(london, { name: 'given' });
  assert.equal(calls.reports, 0);
});

test('checkFavorites returns alerts by location id and survives a failing location', async () => {
  const { service } = setup();
  const broken = new Location({ name: 'Broken', countryCode: 'GB', latitude: 1, longitude: 1 });
  const original = service.getAlerts.bind(service);
  service.getAlerts = (loc) => (loc === broken ? Promise.reject(new Error('down')) : original(loc));
  const result = await service.checkFavorites([hoboken, london, broken]);
  assert.deepEqual(result.get(hoboken.id).map((a) => a.id), ['nws-1']);
  assert.deepEqual(result.get(london.id).map((a) => a.id), ['rule-London']);
  assert.deepEqual(result.get(broken.id), []);
});
