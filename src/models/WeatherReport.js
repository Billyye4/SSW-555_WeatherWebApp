import { CurrentConditions } from './CurrentConditions.js';
import { HourlyForecast } from './HourlyForecast.js';
import { DailyForecast } from './DailyForecast.js';

// Everything from one forecast request for one location.
export class WeatherReport {
  constructor({ location, timezone, current, hourly, daily }) {
    this.location = location;
    this.timezone = timezone;
    this.current = current;
    this.hourly = hourly;
    this.daily = daily;
  }

  static fromApi(location, json) {
    const hourly = json.hourly?.time ?? [];
    const daily = json.daily?.time ?? [];
    return new WeatherReport({
      location,
      timezone: json.timezone,
      current: CurrentConditions.fromApi(json.current),
      hourly: hourly.map((_, i) => HourlyForecast.fromApi(json.hourly, i)),
      daily: daily.map((_, i) => DailyForecast.fromApi(json.daily, i)),
    });
  }

  // The location's current date, 'YYYY-MM-DD'.
  today() {
    return this.current.time.slice(0, 10);
  }

  // US-09: the dates a user can ask about, today through the last forecast day.
  forecastRange() {
    const last = this.daily.at(-1);
    return { min: this.today(), max: last ? last.date : this.today() };
  }

  // US-09: highest chance of precipitation (0–100) on a date, or null outside the forecast range.
  rainChanceOn(date) {
    const { min, max } = this.forecastRange();
    if (date < min || date > max) return null;
    return this.daily.find((d) => d.date === date)?.precipChanceMax ?? null;
  }
}
