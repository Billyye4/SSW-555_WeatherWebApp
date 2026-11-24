import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocationService } from './LocationService.js';

// A stand-in for navigator.geolocation that answers with a position or a GeolocationPositionError code.
function fakeGeolocation({ coords, errorCode }) {
  const calls = [];
  return {
    calls,
    getCurrentPosition(onSuccess, onError, options) {
      calls.push(options);
      if (errorCode) onError({ code: errorCode, message: 'browser message' });
      else onSuccess({ coords });
    },
  };
}

test('resolves to a Location named "Your location" with no country', async () => {
  const geo = fakeGeolocation({ coords: { latitude: 40.7440, longitude: -74.0324 } });
  const here = await new LocationService(geo).getCurrentPosition();
  assert.equal(here.name, 'Your location');
  assert.equal(here.countryCode, null);
  assert.equal(here.id, '40.74,-74.03');
});

test('asks the browser with a timeout and allows a recent cached position', async () => {
  const geo = fakeGeolocation({ coords: { latitude: 1, longitude: 2 } });
  await new LocationService(geo).getCurrentPosition();
  assert.deepEqual(geo.calls[0], { timeout: LocationService.TIMEOUT_MS, maximumAge: LocationService.MAX_AGE_MS });
});

test('maps each browser error to a readable message and a code', async () => {
  const cases = [
    [1, 'denied', /denied/],
    [2, 'unavailable', /isn't available/],
    [3, 'timeout', /took too long/],
  ];
  for (const [errorCode, code, message] of cases) {
    await assert.rejects(
      new LocationService(fakeGeolocation({ errorCode })).getCurrentPosition(),
      (err) => err.code === code && message.test(err.message),
    );
  }
});

test('rejects as unsupported when the browser has no geolocation', async () => {
  await assert.rejects(
    new LocationService(undefined).getCurrentPosition(),
    (err) => err.code === 'unsupported' && /can't share your location/.test(err.message),
  );
});
