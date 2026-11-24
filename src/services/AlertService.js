// Picks the alert source for a location (US-07).
// US or unknown country (e.g. geolocated): official NWS alerts.
// Elsewhere, or if NWS fails: rules applied to the forecast.
export class AlertService {
  #nws;
  #rules;
  #weather;

  constructor(nwsProvider, ruleProvider, weatherService) {
    this.#nws = nwsProvider;
    this.#rules = ruleProvider;
    this.#weather = weatherService;
  }

  // `report` is optional; it's fetched only if the rule fallback needs it.
  async getAlerts(location, report = null) {
    const byRules = async () => this.#rules.evaluate(report ?? await this.#weather.getReport(location));
    if (location.countryCode && location.countryCode !== 'US') return byRules();
    try {
      return await this.#nws.fetchAlerts(location.latitude, location.longitude);
    } catch {
      return byRules();
    }
  }

  // Alerts for every saved location, as a Map of location id -> Alert[].
  // A location whose check fails gets an empty list, so one bad request doesn't hide the rest.
  async checkFavorites(locations) {
    const entries = await Promise.all(locations.map(async (location) => {
      try {
        return [location.id, await this.getAlerts(location)];
      } catch {
        return [location.id, []];
      }
    }));
    return new Map(entries);
  }
}
