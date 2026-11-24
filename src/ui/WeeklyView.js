import { Dates } from '../util/Dates.js';
import { Units } from '../util/Units.js';
import { WeatherCodes } from '../util/WeatherCodes.js';

// Seven-day forecast as a row of day cards (US-03).
export class WeeklyView {
  #root;
  #list;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#list = rootEl.querySelector('[data-field="list"]');
  }

  render(days, unit) {
    this.#list.replaceChildren(...days.map((day) => this.#card(day, unit)));
    this.#root.hidden = days.length === 0;
  }

  #card(day, unit) {
    const { label, icon } = WeatherCodes.describe(day.weatherCode);
    const card = this.#el('article', 'forecast-day');

    const date = this.#el('time', null, Dates.formatDay(day.date));
    date.dateTime = day.date;

    const iconEl = this.#el('span', 'forecast-icon', icon);
    iconEl.setAttribute('aria-hidden', 'true');

    const temp = (c) => (c == null ? '–' : Units.formatTemp(c, unit));
    card.append(
      date,
      iconEl,
      this.#el('span', 'forecast-description', label),
      this.#el('span', 'forecast-temperatures', `${temp(day.highC)} / ${temp(day.lowC)}`),
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
