import { Location } from '../models/Location.js';

// Where the user is, from the browser's Geolocation API (US-04).
export class LocationService {
  static TIMEOUT_MS = 10_000;
  // Reuse a position the browser found in the last 10 minutes instead of asking for a new fix.
  static MAX_AGE_MS = 10 * 60 * 1000;
  static NAME = 'Your location';

  #geolocation;

  constructor(geolocation = globalThis.navigator?.geolocation) {
    this.#geolocation = geolocation;
  }

  // Resolves to a Location named "Your location" (Open-Meteo has no reverse geocoding, and the
  // country is unknown). Rejects with an Error whose message a user can read and whose `code`
  // is 'denied', 'unavailable', 'timeout', or 'unsupported'.
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!this.#geolocation?.getCurrentPosition) {
        reject(LocationService.#error('unsupported'));
        return;
      }
      this.#geolocation.getCurrentPosition(
        ({ coords }) => resolve(new Location({
          name: LocationService.NAME,
          latitude: coords.latitude,
          longitude: coords.longitude,
        })),
        (err) => reject(LocationService.#error({ 1: 'denied', 2: 'unavailable', 3: 'timeout' }[err?.code] ?? 'unavailable')),
        { timeout: LocationService.TIMEOUT_MS, maximumAge: LocationService.MAX_AGE_MS },
      );
    });
  }

  static #error(code) {
    const messages = {
      denied: 'Location access was denied.',
      unavailable: "Your location isn't available right now.",
      timeout: 'Finding your location took too long.',
      unsupported: "This browser can't share your location.",
    };
    const err = new Error(messages[code]);
    err.code = code;
    return err;
  }
}
