// Loading text and alerts under the search bar (US-05, US-04).
// Loading goes in a polite live region; errors and notices go in a role="alert" box so
// screen readers announce them right away.
export class StatusView {
  #statusEl;
  #alertEl;

  constructor(statusEl, alertEl) {
    this.#statusEl = statusEl;
    this.#alertEl = alertEl;
  }

  loading(message = 'Loading…') {
    this.#statusEl.textContent = message;
    this.#hideAlert();
  }

  // Something failed (red).
  error(message) {
    this.#showAlert(`⚠ ${message}`, 'error');
  }

  // Something the user should know that isn't a failure, such as a fallback location (blue).
  notice(message) {
    this.#showAlert(`ℹ ${message}`, 'notice');
  }

  clear() {
    this.#statusEl.textContent = '';
    this.#hideAlert();
  }

  #showAlert(text, kind) {
    this.#statusEl.textContent = '';
    this.#alertEl.textContent = text;
    this.#alertEl.dataset.kind = kind;
    this.#alertEl.hidden = false;
  }

  #hideAlert() {
    this.#alertEl.hidden = true;
    this.#alertEl.textContent = '';
  }
}
