import { Alert } from '../models/Alert.js';

// Official watches, warnings, and advisories from the US National Weather Service (US-07).
// Only covers the US: other points get HTTP 400, which HttpClient turns into an error.
export class NwsAlertProvider {
  #http;

  constructor(http) {
    this.#http = http;
  }

  static url(lat, lon) {
    return `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`;
  }

  async fetchAlerts(lat, lon) {
    const data = await this.#http.getJSON(NwsAlertProvider.url(lat, lon), { Accept: 'application/geo+json' });
    return (data.features ?? []).map((f) => NwsAlertProvider.toAlert(f)).sort(Alert.compare);
  }

  // Maps one GeoJSON feature from /alerts/active to an Alert.
  static toAlert(feature) {
    const p = feature.properties ?? {};
    return new Alert({
      id: p.id ?? feature.id,
      title: p.event ?? 'Weather alert',
      severity: p.severity,
      headline: p.headline ?? '',
      description: p.description ?? '',
      starts: p.onset ?? p.effective ?? null,
      ends: p.ends ?? p.expires ?? null,
      source: 'NWS',
    });
  }
}
