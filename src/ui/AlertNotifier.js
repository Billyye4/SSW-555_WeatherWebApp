// Browser notifications for new alerts on saved locations (US-07, #21).
// Works only while the app is open in a tab; there is no backend to push when it's closed.
export class AlertNotifier {
  static SEEN_KEY = 'seenAlerts';
  static MAX_SEEN = 200;

  #store;
  #Notification;
  #button = null;

  constructor(store, NotificationApi = globalThis.Notification) {
    this.#store = store;
    this.#Notification = NotificationApi;
  }

  get supported() {
    return typeof this.#Notification === 'function';
  }

  get enabled() {
    return this.supported && this.#Notification.permission === 'granted';
  }

  // Wires the "turn on notifications" button. Permission is only asked for on a click.
  attach(buttonEl) {
    this.#button = buttonEl;
    buttonEl.addEventListener('click', async () => {
      if (!this.supported) return;
      await this.#Notification.requestPermission();
      this.#updateButton();
    });
    this.#updateButton();
  }

  // entries: [{ location, alerts }]. Shows one notification per alert not seen before.
  // With { silent: true } the alerts are only marked as seen (used on page load, when the
  // banner already shows them).
  notify(entries, { silent = false } = {}) {
    const seen = new Set(this.#store.get(AlertNotifier.SEEN_KEY, []));
    const shown = [];
    for (const { location, alerts } of entries) {
      for (const alert of alerts) {
        if (seen.has(alert.id)) continue;
        seen.add(alert.id);
        if (silent || !this.enabled) continue;
        new this.#Notification(`${alert.title}: ${location.name}`, { body: alert.headline, tag: alert.id });
        shown.push(alert.id);
      }
    }
    this.#store.set(AlertNotifier.SEEN_KEY, [...seen].slice(-AlertNotifier.MAX_SEEN));
    return shown;
  }

  #updateButton() {
    const button = this.#button;
    if (!button) return;
    const permission = this.supported ? this.#Notification.permission : 'unsupported';
    button.hidden = permission === 'unsupported';
    button.disabled = permission !== 'default';
    button.textContent = {
      default: '🔔 Notify me about new alerts',
      granted: '🔔 Alert notifications are on',
      denied: '🔕 Notifications are blocked in your browser settings',
    }[permission] ?? '';
  }
}
