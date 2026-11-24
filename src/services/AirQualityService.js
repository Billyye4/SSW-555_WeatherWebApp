import { PollenReport } from '../models/PollenReport.js';

const BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Fetches current pollen counts (US-11). Open-Meteo only has pollen data for Europe.
export class AirQualityService {
  #http;

  constructor(http) {
    this.#http = http;
  }

  static pollenUrl(location) {
    const params = [
      `latitude=${location.latitude}`,
      `longitude=${location.longitude}`,
      'timezone=auto',
      `current=${PollenReport.TYPES.map((type) => `${type}_pollen`).join(',')}`,
    ];
    return `${BASE_URL}?${params.join('&')}`;
  }

  // Returns a PollenReport, or null outside Europe.
  async getPollen(location) {
    const json = await this.#http.getJSON(AirQualityService.pollenUrl(location));
    return PollenReport.fromApi(json);
  }
}
