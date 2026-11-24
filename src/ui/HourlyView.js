import { Units } from '../util/Units.js';
import { WeatherCodes } from '../util/WeatherCodes.js';

// The next 24 hours as a row of small cards that scrolls sideways (US-02).
export class HourlyView {
  #root;
  #list;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#list = rootEl.querySelector('[data-field="list"]');
  }

  render(hours, unit) {
    this.#list.replaceChildren(...hours.map((hour) => this.#card(hour, unit)));
    this.#root.hidden = hours.length === 0;
  }

  // '2026-11-23T18:00' → '6 PM'
  static formatHour(isoDateTime) {
    const hour = Number(isoDateTime.slice(11, 13));
    return `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  #card(hour, unit) {
    const { label, icon } = WeatherCodes.describe(hour.weatherCode);
    const card = this.#el('article', 'hourly-item');

    const time = this.#el('time', null, HourlyView.formatHour(hour.time));
    time.dateTime = hour.time;
    time.setAttribute('aria-label', `${hour.time.replace('T', ' ')}, ${label}`);

    const iconEl = this.#el('span', 'hourly-icon', icon);
    iconEl.setAttribute('aria-hidden', 'true');

    const temperature = hour.temperatureC == null ? '–' : Units.formatTemp(hour.temperatureC, unit);
    card.append(
      time,
      iconEl,
      this.#el('span', 'hourly-description', label),
      this.#el('span', 'hourly-temperature', temperature),
    );
    return card;
  }

  #el(tag, className, text) {
    const el = this.#root.ownerDocument.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }
}
