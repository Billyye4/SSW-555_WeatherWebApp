import { Location } from '../models/Location.js';

// The user's display preferences (US-01) and last detected location (US-04).
export class PreferencesStore {
  #store;

  constructor(store) {
    this.#store = store;
  }

  getUnit() {
    return this.#store.get('unit', 'F') === 'C' ? 'C' : 'F';
  }

  setUnit(unit) {
    if (unit !== 'C' && unit !== 'F') throw new Error(`Unknown unit "${unit}".`);
    this.#store.set('unit', unit);
  }

  // US-04: where the browser last found the user, so the next visit can load it without asking.
  // Returns null when nothing (or nothing valid) is saved.
  getLastLocation() {
    const saved = this.#store.get('lastLocation', null);
    if (!Number.isFinite(saved?.latitude) || !Number.isFinite(saved?.longitude)) return null;
    return Location.fromJSON(saved);
  }

  setLastLocation(location) {
    this.#store.set('lastLocation', location.toJSON());
  }
}
