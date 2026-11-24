// Loading text and error alerts under the search bar (US-05).
// Loading goes in a polite live region; errors go in a role="alert" box so screen readers
// announce them right away.
export class StatusView {
  #statusEl;
  #errorEl;

  constructor(statusEl, errorEl) {
    this.#statusEl = statusEl;
    this.#errorEl = errorEl;
  }

  loading(message = 'Loading…') {
    this.#statusEl.textContent = message;
    this.#hideError();
  }

  error(message) {
    this.#statusEl.textContent = '';
    this.#errorEl.textContent = `⚠ ${message}`;
    this.#errorEl.hidden = false;
  }

  clear() {
    this.#statusEl.textContent = '';
    this.#hideError();
  }

  #hideError() {
    this.#errorEl.hidden = true;
    this.#errorEl.textContent = '';
  }
}
