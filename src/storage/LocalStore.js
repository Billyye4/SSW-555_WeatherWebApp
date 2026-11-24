// JSON wrapper around localStorage. Keys get a 'weather:' prefix.
// Reads never throw: missing or corrupt values return the fallback.
export class LocalStore {
  #storage;
  #prefix;

  constructor(storage = globalThis.localStorage, prefix = 'weather:') {
    this.#storage = storage;
    this.#prefix = prefix;
  }

  get(key, fallback) {
    try {
      const raw = this.#storage?.getItem(this.#prefix + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  set(key, value) {
    try {
      this.#storage?.setItem(this.#prefix + key, JSON.stringify(value));
    } catch {
      // Storage is full or blocked (for example, private browsing). The app keeps working without saving.
    }
  }
}
