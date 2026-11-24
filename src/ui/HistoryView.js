import { Units } from '../util/Units.js';
import { Dates } from '../util/Dates.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 340;
const H = 190;
const PAD = { top: 30, right: 14, bottom: 26, left: 34 };

// Last week's daily highs next to this week's forecast, plus a one-line trend (US-10).
export class HistoryView {
  #root;
  #trend;
  #chart;
  #tooltip;
  #table;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#trend = rootEl.querySelector('[data-field="trend"]');
    this.#chart = rootEl.querySelector('[data-field="chart"]');
    this.#tooltip = rootEl.querySelector('[data-field="tooltip"]');
    this.#table = rootEl.querySelector('[data-field="table"]');
  }

  render({ history, week, trend }, unit) {
    const days = [...history, ...week];
    this.#root.hidden = days.length === 0;
    if (!days.length) return;
    this.#trend.textContent = HistoryView.trendText(trend, unit);
    this.#drawChart(days, history.length, unit);
    this.#fillTable(days, history.length, unit);
  }

  // 'This week averages 3°F warmer than last week (55°F vs. 52°F).'
  static trendText(trend, unit) {
    if (!trend) return 'Not enough data to compare with last week.';
    const now = Units.temp(trend.avgHighThisWeekC, unit);
    const before = Units.temp(trend.avgHighLastWeekC, unit);
    const diff = now - before;
    if (diff === 0) return `This week's highs match last week's (average ${now}°${unit}).`;
    const direction = diff > 0 ? 'warmer' : 'colder';
    return `This week averages ${Math.abs(diff)}°${unit} ${direction} than last week `
      + `(${now}°${unit} vs. ${before}°${unit}).`;
  }

  // Round tick values covering [min, max], at most ~5 of them.
  static niceTicks(min, max) {
    if (min === max) { min -= 1; max += 1; }
    const span = max - min;
    const step = [1, 2, 5, 10, 20, 50].find((s) => span / s <= 4) ?? 100;
    const ticks = [];
    for (let v = Math.floor(min / step) * step; v <= Math.ceil(max / step) * step; v += step) ticks.push(v);
    return ticks;
  }

  #drawChart(days, todayIndex, unit) {
    const temps = days.map((d) => (d.highC == null ? null : Units.temp(d.highC, unit)));
    const known = temps.filter((t) => t != null);
    const ticks = HistoryView.niceTicks(Math.min(...known), Math.max(...known));
    const [lo, hi] = [ticks[0], ticks.at(-1)];
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const x = (i) => PAD.left + (days.length === 1 ? plotW / 2 : (i * plotW) / (days.length - 1));
    const y = (t) => PAD.top + (1 - (t - lo) / (hi - lo)) * plotH;

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'history-chart', 'aria-hidden': 'true' });

    for (const t of ticks) {
      svg.append(el('line', { x1: PAD.left, x2: W - PAD.right, y1: y(t), y2: y(t), class: 'grid' }));
      svg.append(text(`${t}°`, { x: PAD.left - 6, y: y(t) + 4, class: 'axis', 'text-anchor': 'end' }));
    }

    // Today divider, with the two halves named above the plot.
    if (todayIndex > 0) {
      const xt = x(todayIndex);
      svg.append(el('line', { x1: xt, x2: xt, y1: PAD.top - 6, y2: H - PAD.bottom, class: 'today' }));
      svg.append(text('Last week', { x: (PAD.left + xt) / 2, y: 14, class: 'axis', 'text-anchor': 'middle' }));
      svg.append(text('This week', { x: (xt + W - PAD.right) / 2, y: 14, class: 'axis', 'text-anchor': 'middle' }));
    }

    // X labels: first day, today, last day.
    for (const i of new Set([0, todayIndex, days.length - 1])) {
      const label = i === todayIndex ? 'Today' : Dates.formatMonthDay(days[i].date);
      const anchor = i === 0 ? 'start' : i === days.length - 1 ? 'end' : 'middle';
      svg.append(text(label, { x: x(i), y: H - 8, class: 'axis', 'text-anchor': anchor }));
    }

    // The line breaks wherever a day has no value.
    let d = '';
    temps.forEach((t, i) => {
      if (t == null) return;
      d += `${i > 0 && temps[i - 1] != null ? 'L' : 'M'}${x(i)},${y(t)}`;
    });
    svg.append(el('path', { d, class: 'series' }));

    const crosshair = el('line', { y1: PAD.top, y2: H - PAD.bottom, class: 'crosshair', visibility: 'hidden' });
    svg.append(crosshair);
    temps.forEach((t, i) => {
      if (t != null) svg.append(el('circle', { cx: x(i), cy: y(t), r: 4, class: 'marker' }));
    });

    // Hover layer: snap to the nearest day and show its value.
    const hit = el('rect', { x: PAD.left - 8, y: 0, width: plotW + 16, height: H, class: 'hit' });
    svg.append(hit);
    hit.addEventListener('pointermove', (e) => {
      const box = svg.getBoundingClientRect();
      const px = ((e.clientX - box.left) / box.width) * W;
      const i = Math.max(0, Math.min(days.length - 1, Math.round(((px - PAD.left) / plotW) * (days.length - 1))));
      crosshair.setAttribute('x1', x(i));
      crosshair.setAttribute('x2', x(i));
      crosshair.setAttribute('visibility', 'visible');
      this.#showTooltip(days[i], temps[i], i >= todayIndex, unit, (x(i) / W) * box.width, box.width);
    });
    hit.addEventListener('pointerleave', () => {
      crosshair.setAttribute('visibility', 'hidden');
      this.#tooltip.hidden = true;
    });

    this.#chart.replaceChildren(svg);
  }

  #showTooltip(day, temp, isForecast, unit, left, width) {
    const tip = this.#tooltip;
    const date = document.createElement('strong');
    date.textContent = Dates.formatDay(day.date);
    const value = temp == null ? 'No data' : `High ${temp}°${unit}${isForecast ? ' (forecast)' : ''}`;
    tip.replaceChildren(date, document.createElement('br'), value);
    tip.hidden = false;
    // Keep the tooltip inside the card near the edges.
    tip.style.left = `${Math.max(60, Math.min(width - 60, left))}px`;
  }

  #fillTable(days, todayIndex, unit) {
    const rows = days.map((day, i) => {
      const tr = document.createElement('tr');
      const when = document.createElement('td');
      when.textContent = `${Dates.formatDay(day.date)}${i === todayIndex ? ' (today)' : ''}`;
      const high = document.createElement('td');
      high.textContent = day.highC == null ? '—' : Units.formatTemp(day.highC, unit);
      tr.append(when, high);
      return tr;
    });
    this.#table.replaceChildren(...rows);
  }
}

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function text(content, attrs) {
  const node = el('text', attrs);
  node.textContent = content;
  return node;
}
