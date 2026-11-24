import { Icons } from './Icons.js';
import { Dates } from '../util/Dates.js';
import { Units } from '../util/Units.js';
import { WeatherCodes } from '../util/WeatherCodes.js';

const PRECIP_SHOWN_FROM = 20;

// Seven-day forecast (US-03). Each day's low-to-high range is a bar on one scale shared by the whole week.
export class WeeklyView {
  #root;
  #list;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#list = rootEl.querySelector('[data-field="list"]');
  }

  // currentC, if given, marks the current temperature on today's bar.
  render(days, unit, { currentC = null } = {}) {
    const scale = WeeklyView.rangeScale(days);
    this.#list.replaceChildren(...days.map((day, i) => this.#row(day, i === 0, unit, scale, i === 0 ? currentC : null)));
    this.#root.hidden = days.length === 0;
  }

  // The coldest low and warmest high of the week, in °C. Null when no day has both.
  static rangeScale(days) {
    const lows = days.map((d) => d.lowC).filter((v) => v != null);
    const highs = days.map((d) => d.highC).filter((v) => v != null);
    if (!lows.length || !highs.length) return null;
    return { min: Math.min(...lows), max: Math.max(...highs) };
  }

  // Where a temperature sits on the week's scale, as a percentage from 0 to 100.
  static position(c, scale) {
    if (scale.max === scale.min) return 50;
    return Math.min(100, Math.max(0, ((c - scale.min) / (scale.max - scale.min)) * 100));
  }

  #row(day, isToday, unit, scale, currentC) {
    const li = this.#el('li', 'day');
    const degrees = (c) => (c == null ? '–' : `${Units.temp(c, unit)}°`);

    const name = this.#el('time', 'day-name', isToday ? 'Today' : Dates.formatWeekday(day.date));
    name.dateTime = day.date;
    name.title = Dates.formatDay(day.date);

    // Icons.svg returns fixed markup with no API data in it.
    const icon = this.#el('span', 'day-icon');
    icon.innerHTML = Icons.svg(day.weatherCode, true);
    const precip = this.#el('span', 'day-precip',
      day.precipChanceMax >= PRECIP_SHOWN_FROM ? `${day.precipChanceMax}%` : '');

    const low = this.#el('span', 'day-low');
    low.append(this.#el('span', 'visually-hidden', 'Low '), degrees(day.lowC));
    const high = this.#el('span', 'day-high');
    high.append(this.#el('span', 'visually-hidden', 'High '), degrees(day.highC));

    const cond = this.#el('span', 'day-cond');
    cond.append(icon, this.#el('span', 'visually-hidden', WeatherCodes.describe(day.weatherCode).label), precip);

    li.append(name, cond, low, this.#bar(day, scale, currentC), high);
    return li;
  }

  #bar(day, scale, currentC) {
    const track = this.#el('span', 'range');
    track.setAttribute('aria-hidden', 'true');
    if (!scale || day.lowC == null || day.highC == null) return track;

    const from = WeeklyView.position(day.lowC, scale);
    const to = WeeklyView.position(day.highC, scale);
    const fill = this.#el('span', 'range-fill');
    fill.style.left = `${from}%`;
    fill.style.width = `${Math.max(to - from, 2)}%`;
    track.append(fill);

    if (currentC != null) {
      const now = this.#el('span', 'range-now');
      now.style.left = `${WeeklyView.position(currentC, scale)}%`;
      track.append(now);
    }
    return track;
  }

  #el(tag, className, text) {
    const el = this.#root.ownerDocument.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }
}
