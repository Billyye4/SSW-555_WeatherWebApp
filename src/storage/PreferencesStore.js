// The user's display preferences (US-01).
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
}
