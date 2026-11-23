// Builds fake Open-Meteo forecast responses for tests.
// (This folder is named `testing`, not `test`, so `node --test` doesn't run it as a test file.)
import { Dates } from '../util/Dates.js';

// pastDays/forecastDays match Open-Meteo's params: the daily block runs from
// today - pastDays to today + forecastDays - 1. `daily` values may be arrays or
// functions of (date, offsetFromToday).
export function forecastJson({
  today = '2026-11-23', pastDays = 7, forecastDays = 16, current = {}, daily = {},
} = {}) {
  const dates = [];
  for (let offset = -pastDays; offset < forecastDays; offset++) dates.push(Dates.addDays(today, offset));
  const column = (key, fallback) => {
    const value = daily[key] ?? fallback;
    return typeof value === 'function' ? dates.map((date, i) => value(date, i - pastDays)) : value;
  };
  const hours = Array.from({ length: 24 }, (_, h) => `${today}T${String(h).padStart(2, '0')}:00`);

  return {
    timezone: 'America/New_York',
    current: {
      time: `${today}T14:00`,
      temperature_2m: 10,
      apparent_temperature: 8,
      relative_humidity_2m: 60,
      wind_speed_10m: 16.1,
      wind_direction_10m: 270,
      weather_code: 0,
      is_day: 1,
      ...current,
    },
    hourly: {
      time: hours,
      temperature_2m: hours.map(() => 10),
      precipitation_probability: hours.map(() => 0),
      weather_code: hours.map(() => 0),
    },
    daily: {
      time: dates,
      temperature_2m_max: column('temperature_2m_max', () => 15),
      temperature_2m_min: column('temperature_2m_min', () => 5),
      weather_code: column('weather_code', () => 0),
      precipitation_probability_max: column('precipitation_probability_max', () => 10),
      sunrise: dates.map((d) => `${d}T06:50`),
      sunset: dates.map((d) => `${d}T16:30`),
      wind_gusts_10m_max: column('wind_gusts_10m_max', () => 30),
    },
  };
}
