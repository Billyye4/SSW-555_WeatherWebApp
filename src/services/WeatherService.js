import { WeatherReport } from '../models/WeatherReport.js';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Fields requested in the single forecast call. Add a field here when a story needs it.
export const CURRENT_FIELDS = [
  'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
  'wind_speed_10m', 'wind_direction_10m', 'weather_code', 'is_day',
];
export const HOURLY_FIELDS = ['temperature_2m', 'precipitation_probability', 'weather_code'];
export const DAILY_FIELDS = [
  'temperature_2m_max', 'temperature_2m_min', 'weather_code', 'sunrise', 'sunset',
  'precipitation_probability_max',
];

// Open-Meteo's maximum. US-09 lets users pick any date in this window.
export const FORECAST_DAYS = 16;

// Fetches one WeatherReport per location with a single request.
export class WeatherService {
  #http;

  constructor(http) {
    this.#http = http;
  }

  static reportUrl(location) {
    const params = [
      `latitude=${location.latitude}`,
      `longitude=${location.longitude}`,
      'timezone=auto',
      `forecast_days=${FORECAST_DAYS}`,
      `current=${CURRENT_FIELDS.join(',')}`,
      `hourly=${HOURLY_FIELDS.join(',')}`,
      `daily=${DAILY_FIELDS.join(',')}`,
    ];
    return `${BASE_URL}?${params.join('&')}`;
  }

  async getReport(location) {
    const json = await this.#http.getJSON(WeatherService.reportUrl(location));
    return WeatherReport.fromApi(location, json);
  }
}
