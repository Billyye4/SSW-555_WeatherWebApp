// Sunrise, sunset, and daylight left (US-12).
export class SunView {
  #root;
  #fields;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#fields = Object.fromEntries(
      [...rootEl.querySelectorAll('[data-field]')].map((el) => [el.dataset.field, el]),
    );
  }

  // sun is report.sunTimesOn(). The card stays hidden if it's null.
  render({ sun, daylightMinutes }) {
    if (!sun) {
      this.#root.hidden = true;
      return;
    }
    const f = this.#fields;
    f.sunrise.textContent = SunView.formatClock(sun.sunrise);
    f.sunset.textContent = SunView.formatClock(sun.sunset);
    f.daylight.textContent = daylightMinutes > 0 ? SunView.formatDuration(daylightMinutes) : 'The sun has set';
    this.#root.hidden = false;
  }

  // '2026-11-23T16:32' → '4:32 PM'. Reads the string directly, so it stays in the location's time zone.
  static formatClock(isoDateTime) {
    const [hours, minutes] = isoDateTime.slice(11, 16).split(':').map(Number);
    const suffix = hours < 12 ? 'AM' : 'PM';
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
  }

  // 137 → '2 h 17 min'
  static formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} min`;
    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
  }
}
