import { Location } from '../models/Location.js';

// Saved locations, in the order they were added (US-06).
export class FavoritesStore {
  static KEY = 'favorites';
  #store;

  constructor(store) {
    this.#store = store;
  }

  list() {
    const saved = this.#store.get(FavoritesStore.KEY, []);
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((obj) => Number.isFinite(obj?.latitude) && Number.isFinite(obj?.longitude))
      .map((obj) => Location.fromJSON(obj));
  }

  has(id) {
    return this.list().some((loc) => loc.id === id);
  }

  // Does nothing if the location is already saved.
  add(location) {
    if (this.has(location.id)) return;
    this.#save([...this.list(), location]);
  }

  remove(id) {
    this.#save(this.list().filter((loc) => loc.id !== id));
  }

  #save(locations) {
    this.#store.set(FavoritesStore.KEY, locations.map((loc) => loc.toJSON()));
  }
}
