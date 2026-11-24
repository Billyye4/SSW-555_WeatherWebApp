import { Location } from '../models/Location.js';

// Turns a city name into Locations (US-05).
export class GeocodingService {
  static MAX_RESULTS = 5;
  #http;

  constructor(http) {
    this.#http = http;
  }

  static url(name, count) {
    return `https://geocoding-api.open-meteo.com/v1/search?count=${count}&language=en`
      + `&name=${encodeURIComponent(name)}`;
  }

  // Up to `count` matching places, best match first. Results without valid coordinates are
  // skipped, and places that round to the same id are listed once. Throws a message a user
  // can read when the name is empty or nothing matches.
  //
  // Open-Meteo only matches the place name, so "Portland, Maine" is searched as "Portland"
  // and the parts after the comma move matching states/countries to the front.
  async searchMany(name, count = GeocodingService.MAX_RESULTS) {
    const [city, ...qualifiers] = name.split(',').map((part) => part.trim().toLowerCase());
    if (!city) throw new Error('Type a city name to search.');
    // Ask for more results when narrowing by state/country, so the right one is likely included.
    const ask = qualifiers.some(Boolean) ? Math.max(count, 10) : count;
    const data = await this.#http.getJSON(GeocodingService.url(city, ask));
    const seen = new Set();
    let places = (data.results ?? [])
      .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
      .map((r) => Location.fromGeocoding(r))
      .filter((place) => !seen.has(place.id) && seen.add(place.id));
    places = GeocodingService.#rankByQualifiers(places, qualifiers.filter(Boolean)).slice(0, count);
    if (!places.length) throw new Error(`No city found for "${name.trim()}".`);
    return places;
  }

  // Stable sort: places matching more of the qualifiers (state, country, or country code) first.
  static #rankByQualifiers(places, qualifiers) {
    if (!qualifiers.length) return places;
    const score = (place) => {
      const fields = [place.region, place.country, place.countryCode].filter(Boolean).map((f) => f.toLowerCase());
      return qualifiers.filter((q) => fields.some((f) => f === q || f.startsWith(q))).length;
    };
    return places
      .map((place, i) => ({ place, i, s: score(place) }))
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .map(({ place }) => place);
  }

  // The best match only.
  async search(name) {
    const [best] = await this.searchMany(name, 1);
    return best;
  }
}
