import { Dates } from '../util/Dates.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
// The sun's path: a half circle from sunrise (left) to sunset (right) above a horizon line.
const ARC = { cx: 110, cy: 100, r: 90 };

// Sunrise, sunset, how much daylight is left, and where the sun is on its arc right now (US-12).
export class SunView {
  #root;
  #fields;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#fields = Object.fromEntries(
      [...rootEl.querySelectorAll('[data-field]')].map((el) => [el.dataset.field, el]),
    );
  }

  // sun is report.sunTimesOn() and now is the location's current time. The card stays hidden if sun is null.
  render({ sun, daylightMinutes, now = null }) {
    if (!sun) {
      this.#root.hidden = true;
      return;
    }
    const f = this.#fields;
    f.sunrise.textContent = SunView.formatClock(sun.sunrise);
    f.sunset.textContent = SunView.formatClock(sun.sunset);
    f.daylight.textContent = SunView.statusText(sun, daylightMinutes, now);
    if (f.arc) this.#drawArc(now ? SunView.dayProgress(sun, now) : null);
    this.#root.hidden = false;
  }

  // '2026-11-23T16:32' → '4:32 PM'. Reads the string directly, so it stays in the location's time zone.
  static formatClock(isoDateTime) {
    return Dates.formatTime(isoDateTime);
  }

  // 137 → '2 h 17 min'
  static formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} min`;
    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
  }

  // How far through the day the sun is: 0 at sunrise and 1 at sunset. Below 0 before sunrise, above 1 after sunset.
  static dayProgress(sun, now) {
    const length = Dates.minutesBetween(sun.sunrise, sun.sunset);
    return length > 0 ? Dates.minutesBetween(sun.sunrise, now) / length : null;
  }

  // 'Sunrise in 1 h 5 min', '2 h 17 min of daylight left', or 'The sun has set'.
  static statusText(sun, daylightMinutes, now = null) {
    if (now && now < sun.sunrise) return `Sunrise in ${SunView.formatDuration(Dates.minutesBetween(now, sun.sunrise))}`;
    return daylightMinutes > 0 ? `${SunView.formatDuration(daylightMinutes)} of daylight left` : 'The sun has set';
  }

  #drawArc(progress) {
    const { cx, cy, r } = ARC;
    const start = `${cx - r} ${cy}`;
    const svg = svgEl('svg', { viewBox: '0 0 220 108', class: 'sun-arc-svg', 'aria-hidden': 'true' });
    svg.append(
      svgEl('line', { x1: 4, x2: 216, y1: cy, y2: cy, class: 'sun-horizon' }),
      svgEl('path', { d: `M${start}A${r} ${r} 0 0 1 ${cx + r} ${cy}`, class: 'sun-path' }),
    );
    if (progress != null && progress > 0) {
      const p = Math.min(progress, 1);
      const [x, y] = [cx - r * Math.cos(Math.PI * p), cy - r * Math.sin(Math.PI * p)];
      svg.append(svgEl('path', { d: `M${start}A${r} ${r} 0 0 1 ${round(x)} ${round(y)}`, class: 'sun-elapsed' }));
      if (progress <= 1) svg.append(svgEl('circle', { cx: round(x), cy: round(y), r: 7, class: 'sun-dot' }));
    }
    this.#fields.arc.replaceChildren(svg);
  }
}

function svgEl(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function round(n) {
  return Math.round(n * 10) / 10;
}
