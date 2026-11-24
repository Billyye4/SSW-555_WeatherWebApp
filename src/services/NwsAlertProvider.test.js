import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpClient } from './HttpClient.js';
import { NwsAlertProvider } from './NwsAlertProvider.js';

const feature = (props) => ({ id: 'https://api.weather.gov/alerts/x', properties: props });

test('url rounds the point to 4 decimals', () => {
  assert.equal(NwsAlertProvider.url(40.743991, -74.032364),
    'https://api.weather.gov/alerts/active?point=40.7440,-74.0324');
});

test('toAlert maps the NWS fields', () => {
  const alert = NwsAlertProvider.toAlert(feature({
    id: 'urn:oid:1', event: 'Winter Storm Warning', severity: 'Severe',
    headline: 'Winter Storm Warning until 6 PM', description: 'Heavy snow expected.',
    onset: '2026-11-24T13:00:00-05:00', ends: '2026-11-25T22:00:00-05:00', expires: '2026-11-24T02:30:00-05:00',
  }));
  assert.equal(alert.id, 'urn:oid:1');
  assert.equal(alert.title, 'Winter Storm Warning');
  assert.equal(alert.severity, 'Severe');
  assert.equal(alert.starts, '2026-11-24T13:00:00-05:00');
  assert.equal(alert.ends, '2026-11-25T22:00:00-05:00');
  assert.equal(alert.source, 'NWS');
});

test('toAlert falls back for missing end time and unknown severity', () => {
  const alert = NwsAlertProvider.toAlert(feature({ event: 'Special Weather Statement', severity: 'Unknown', expires: 'later' }));
  assert.equal(alert.id, 'https://api.weather.gov/alerts/x');
  assert.equal(alert.severity, 'Minor');
  assert.equal(alert.ends, 'later');
});

test('fetchAlerts asks for GeoJSON and sorts the most severe first', async () => {
  let headers;
  const http = new HttpClient(async (url, init) => {
    headers = init.headers;
    return {
      ok: true,
      json: async () => ({
        features: [
          feature({ id: 'a', event: 'Small Craft Advisory', severity: 'Minor' }),
          feature({ id: 'b', event: 'Tornado Warning', severity: 'Extreme' }),
        ],
      }),
    };
  });
  const alerts = await new NwsAlertProvider(http).fetchAlerts(40.74, -74.03);
  assert.equal(headers.Accept, 'application/geo+json');
  assert.deepEqual(alerts.map((a) => a.title), ['Tornado Warning', 'Small Craft Advisory']);
});

test('fetchAlerts rejects for points outside the US (HTTP 400)', async () => {
  const http = new HttpClient(async () => ({ ok: false, status: 400 }));
  await assert.rejects(new NwsAlertProvider(http).fetchAlerts(51.5, -0.13));
});
