import { Location } from '../models/Location.js';

// Turns a city name into a Location (US-05).
export class GeocodingService {
  #http;

  constructor(http) {
    this.#http = http;
  }

  async search(name) {
    const url = 'https://geocoding-api.open-meteo.com/v1/search?count=1&language=en'
      + `&name=${encodeURIComponent(name)}`;
    const data = await this.#http.getJSON(url);
    if (!data.results?.length) throw new Error(`No city found for "${name}".`);
    return Location.fromGeocoding(data.results[0]);
  }
}
