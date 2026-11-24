import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AirQualityService } from './AirQualityService.js';
import { Location } from '../models/Location.js';
import { PollenReport } from '../models/PollenReport.js';

const berlin = new Location({ name: 'Berlin', countryCode: 'DE', latitude: 52.52, longitude: 13.41 });

const fakeHttp = (current) => ({ getJSON: async () => ({ current }) });

test('pollenUrl asks for current values of all six pollen types', () => {
  const url = new URL(AirQualityService.pollenUrl(berlin));
  assert.equal(url.origin + url.pathname, 'https://air-quality-api.open-meteo.com/v1/air-quality');
  assert.equal(url.searchParams.get('latitude'), '52.52');
  assert.equal(url.searchParams.get('longitude'), '13.41');
  assert.equal(url.searchParams.get('timezone'), 'auto');
  assert.equal(
    url.searchParams.get('current'),
    'alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
  );
});

test('getPollen requests pollenUrl and returns a PollenReport when there is data', async () => {
  const urls = [];
  const http = {
    getJSON: async (url) => {
      urls.push(url);
      return { current: { time: '2026-05-04T10:00', birch_pollen: 80 } };
    },
  };
  const report = await new AirQualityService(http).getPollen(berlin);
  assert.deepEqual(urls, [AirQualityService.pollenUrl(berlin)]);
  assert.ok(report instanceof PollenReport);
  assert.equal(report.topAllergen(), 'birch');
});

test('getPollen returns null outside Europe, where every value is null', async () => {
  const nulls = { time: '2026-05-04T10:00', alder_pollen: null, birch_pollen: null, grass_pollen: null };
  assert.equal(await new AirQualityService(fakeHttp(nulls)).getPollen(berlin), null);
});
