import { Dates } from '../util/Dates.js';

// Chance of rain for a date the user picks (US-09).
export class RainChanceView {
  static BACKUP_THRESHOLD = 50;

  #root;
  #dateInput;
  #result;
  #report = null;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#dateInput = rootEl.querySelector('[data-field="date"]');
    this.#result = rootEl.querySelector('[data-field="result"]');
    this.#dateInput.addEventListener('change', () => this.#show());
  }

  render(report) {
    this.#report = report;
    const { min, max } = report.forecastRange();
    this.#dateInput.min = min;
    this.#dateInput.max = max;
    // Keep the user's pick when switching places, unless it's now out of range.
    const value = this.#dateInput.value;
    if (!value || value < min || value > max) this.#dateInput.value = min;
    this.#show();
    this.#root.hidden = false;
  }

  #show() {
    if (!this.#report) return;
    const date = this.#dateInput.value;
    const chance = date ? this.#report.rainChanceOn(date) : null;
    this.#result.replaceChildren();

    if (chance == null) {
      const { min, max } = this.#report.forecastRange();
      this.#result.textContent = `Pick a date between ${Dates.formatDay(min)} and ${Dates.formatDay(max)}.`;
      return;
    }

    const headline = document.createElement('strong');
    headline.textContent = `${chance}% chance of rain`;
    const advice = chance >= RainChanceView.BACKUP_THRESHOLD
      ? 'Consider booking an indoor backup.'
      : 'Outdoor plans look OK.';
    this.#result.append(headline, ` on ${Dates.formatDay(date)}. ${advice}`);
  }
}
