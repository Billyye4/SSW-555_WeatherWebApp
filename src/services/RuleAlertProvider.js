import { Alert } from '../models/Alert.js';
import { Dates } from '../util/Dates.js';

// The team can tune these. Temperatures are °C, speeds km/h.
export const THRESHOLDS = {
  daysAhead: 3,
  stormCodes: [95, 96, 99],
  heavySnowCodes: [75, 86],
  gustKmh: 75,
  heatC: 35,
  coldC: -15,
};

const RULES = [
  {
    key: 'storm',
    title: 'Thunderstorm expected',
    severity: 'Severe',
    test: (d, t) => t.stormCodes.includes(d.weatherCode),
    headline: (d) => `Thunderstorms are forecast for ${Dates.formatDay(d.date)}.`,
  },
  {
    key: 'wind',
    title: 'High wind expected',
    severity: 'Severe',
    test: (d, t) => d.gustMaxKmh != null && d.gustMaxKmh >= t.gustKmh,
    headline: (d) => `Gusts up to ${Math.round(d.gustMaxKmh)} km/h are forecast for ${Dates.formatDay(d.date)}.`,
  },
  {
    key: 'heat',
    title: 'Extreme heat expected',
    severity: 'Severe',
    test: (d, t) => d.highC != null && d.highC >= t.heatC,
    headline: (d) => `A high of ${Math.round(d.highC)}°C is forecast for ${Dates.formatDay(d.date)}.`,
  },
  {
    key: 'cold',
    title: 'Extreme cold expected',
    severity: 'Severe',
    test: (d, t) => d.lowC != null && d.lowC <= t.coldC,
    headline: (d) => `A low of ${Math.round(d.lowC)}°C is forecast for ${Dates.formatDay(d.date)}.`,
  },
  {
    key: 'snow',
    title: 'Heavy snow expected',
    severity: 'Moderate',
    test: (d, t) => t.heavySnowCodes.includes(d.weatherCode),
    headline: (d) => `Heavy snow is forecast for ${Dates.formatDay(d.date)}.`,
  },
];

// Fallback outside the US: flags dangerous conditions in the next few days of the forecast.
// These are not official warnings, so they're marked source 'forecast'.
export class RuleAlertProvider {
  #thresholds;

  constructor(thresholds = THRESHOLDS) {
    this.#thresholds = thresholds;
  }

  evaluate(report) {
    const today = report.today();
    const upcoming = report.daily.filter((d) => d.date >= today).slice(0, this.#thresholds.daysAhead);
    const alerts = [];
    for (const rule of RULES) {
      // One alert per rule: the first day it applies.
      const day = upcoming.find((d) => rule.test(d, this.#thresholds));
      if (!day) continue;
      alerts.push(new Alert({
        id: `forecast:${report.location.id}:${rule.key}:${day.date}`,
        title: rule.title,
        severity: rule.severity,
        headline: rule.headline(day),
        description: 'Based on the forecast, not an official warning. Check local authorities for official alerts.',
        starts: day.date,
        ends: day.date,
        source: 'forecast',
      }));
    }
    return alerts.sort(Alert.compare);
  }
}
