import { Icons } from './Icons.js';
import { Units } from '../util/Units.js';
import { WeatherCodes } from '../util/WeatherCodes.js';

// Show the chance of precipitation under an hour's icon only when it's worth noticing.
const PRECIP_SHOWN_FROM = 20;

// The next 24 hours as a row that scrolls sideways (US-02).
export class HourlyView {
  #root;
  #list;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#list = rootEl.querySelector('[data-field="list"]');
  }

  // isDay(time) picks the sun or moon icon for each hour.
  render(hours, unit, { isDay = () => true } = {}) {
    this.#list.replaceChildren(...hours.map((hour, i) => this.#item(hour, i === 0, unit, isDay(hour.time))));
    this.#root.hidden = hours.length === 0;
  }

  // '2026-11-23T18:00' → '6 PM'
  static formatHour(isoDateTime) {
    const hour = Number(isoDateTime.slice(11, 13));
    return `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  #item(hour, isNow, unit, isDay) {
    const li = this.#el('li', 'hour');

    const time = this.#el('time', 'hour-time', isNow ? 'Now' : HourlyView.formatHour(hour.time));
    time.dateTime = hour.time;

    // Icons.svg returns fixed markup with no API data in it.
    const icon = this.#el('span', 'hour-icon');
    icon.innerHTML = Icons.svg(hour.weatherCode, isDay);

    const precip = this.#el('span', 'hour-precip',
      hour.precipChance >= PRECIP_SHOWN_FROM ? `${hour.precipChance}%` : '');

    const temp = this.#el('span', 'hour-temp', hour.temperatureC == null ? '–' : `${Units.temp(hour.temperatureC, unit)}°`);

    li.append(time, icon, this.#el('span', 'visually-hidden', WeatherCodes.describe(hour.weatherCode).label), precip, temp);
    return li;
  }

  #el(tag, className, text) {
    const el = this.#root.ownerDocument.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }
}
