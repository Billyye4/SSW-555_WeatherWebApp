// Owns the app state, calls services, and tells views to render.
export class App {
  static ALERT_POLL_MS = 15 * 60 * 1000;

  #views;
  #status;
  #geocoding;
  #weather;
  #prefs;
  #favorites;
  #alerts;
  #notifier;
  #airQuality;
  #theme;
  #locator;
  #defaultLocation;

  #unit = 'F';
  #location = null;
  #report = null;
  #currentAlerts = [];
  #favoriteAlerts = new Map();
  #pollen; // PollenReport, null where there's no data, or undefined while it loads
  #matches = []; // US-05: every place the last search matched
  #loadId = 0;

  constructor({
    views, status, geocoding, weather, prefs, favorites, alerts, notifier, airQuality, theme,
    locator, defaultLocation,
  }) {
    this.#views = views;
    this.#status = status;
    this.#geocoding = geocoding;
    this.#weather = weather;
    this.#prefs = prefs;
    this.#favorites = favorites;
    this.#alerts = alerts;
    this.#notifier = notifier;
    this.#airQuality = airQuality;
    this.#theme = theme;
    this.#locator = locator;
    this.#defaultLocation = defaultLocation;
  }

  init() {
    this.#unit = this.#prefs.getUnit();
    this.#views.unitToggle.render(this.#unit);
    this.#renderFavorites();
    // On load the banner already shows current alerts, so don't also pop notifications for them.
    this.refreshFavoriteAlerts({ silent: true });
    setInterval(() => this.refreshFavoriteAlerts(), App.ALERT_POLL_MS);
    this.#loadStartLocation();
  }

  // US-04: show weather without a search. A location detected on an earlier visit loads
  // straight away without asking again (#11); otherwise ask the browser (#9), and fall back to
  // the default location with a notice if that fails (#10).
  async #loadStartLocation() {
    const saved = this.#prefs.getLastLocation();
    if (saved) await this.loadLocation(saved);
    else await this.useMyLocation({ fallbackToDefault: true });
  }

  // US-04: the "Use my location" button, and the first visit.
  async useMyLocation({ fallbackToDefault = false } = {}) {
    const loadId = ++this.#loadId;
    this.#views.search.setBusy(true);
    this.#status.loading('Finding your location…');
    let here;
    try {
      here = await this.#locator.getCurrentPosition();
    } catch (err) {
      // The user searched for something else while we waited, so stay out of the way.
      if (loadId !== this.#loadId) return;
      if (!fallbackToDefault) {
        this.#status.error(`${err.message} Search for a city instead.`);
        this.#views.search.setBusy(false);
        return;
      }
      const fallback = this.#defaultLocation;
      if (await this.loadLocation(fallback)) {
        this.#status.notice(`${err.message} Showing ${fallback.name} instead. Search for a city, `
          + 'or press "Use my location" to try again.');
      }
      return;
    }
    if (loadId !== this.#loadId) return;
    this.#prefs.setLastLocation(here);
    await this.loadLocation(here);
  }

  // US-05: load the best match and keep the others so the user can switch to them.
  async search(name) {
    const loadId = ++this.#loadId;
    this.#views.search.setBusy(true);
    this.#status.loading('Searching…');
    try {
      const matches = await this.#geocoding.searchMany(name);
      if (loadId !== this.#loadId) return;
      this.#matches = matches;
      await this.loadLocation(matches[0]);
    } catch (err) {
      if (loadId !== this.#loadId) return;
      this.#status.error(err.message);
      this.#views.search.setBusy(false);
    }
  }

  // US-05: suggestions while typing. Failures just mean no suggestions.
  async suggest(query) {
    try {
      return await this.#geocoding.searchMany(query);
    } catch {
      return [];
    }
  }

  // Resolves to true once the weather is on screen, false if it failed or a newer load replaced it.
  async loadLocation(location) {
    // If the user starts another search while this one is loading, only the newest one renders.
    const loadId = ++this.#loadId;
    // Keep the "other matches" list only while the user is moving between those matches.
    if (!this.#matches.some((place) => place.id === location.id)) this.#matches = [];
    this.#views.search.setBusy(true);
    this.#status.loading();
    try {
      const report = await this.#weather.getReport(location);
      if (loadId !== this.#loadId) return false;
      this.#location = location;
      this.#report = report;
      this.#currentAlerts = [];
      this.#pollen = undefined;
      this.#render();
      this.#renderFavorites();
      this.#renderAlerts();
      this.#views.matches.render(this.#matches, location.id);
      this.#status.clear();
    } catch (err) {
      if (loadId === this.#loadId) this.#status.error(err.message);
      return false;
    } finally {
      if (loadId === this.#loadId) this.#views.search.setBusy(false);
    }

    // Alerts and pollen (US-11) load after the weather so they never hold it up.
    // If pollen fails, its card says the data isn't available.
    const [alerts, pollen] = await Promise.all([
      this.#alerts.getAlerts(location, this.#report).catch(() => []),
      this.#airQuality.getPollen(location).catch(() => null),
    ]);
    // The weather is on screen either way, so report success even if a newer load took over.
    if (loadId !== this.#loadId) return true;
    this.#currentAlerts = alerts;
    this.#pollen = pollen;
    this.#renderAlerts();
    this.#views.pollen.render(pollen);
    return true;
  }

  // US-01: switch between °F and °C. Re-renders from the cached report without fetching again.
  setUnit(unit) {
    this.#prefs.setUnit(unit);
    this.#unit = unit;
    this.#views.unitToggle.render(unit);
    this.#render();
  }

  // US-06: save or unsave the location on screen.
  toggleFavorite() {
    if (!this.#location) return;
    const { id } = this.#location;
    if (this.#favorites.has(id)) this.#favorites.remove(id);
    else this.#favorites.add(this.#location);
    this.#render();
    this.#renderFavorites();
    // The new favorite's alerts are already on screen, so don't also notify about them.
    this.refreshFavoriteAlerts({ silent: true });
  }

  // US-06: remove from the favorites list.
  removeFavorite(id) {
    this.#favorites.remove(id);
    this.#favoriteAlerts.delete(id);
    this.#render();
    this.#renderFavorites();
    this.#renderAlerts();
  }

  // US-07: check every saved location, show the results, and notify about new ones.
  async refreshFavoriteAlerts({ silent = false } = {}) {
    const favorites = this.#favorites.list();
    this.#favoriteAlerts = await this.#alerts.checkFavorites(favorites);
    this.#renderAlerts();
    const entries = favorites.map((location) => ({ location, alerts: this.#favoriteAlerts.get(location.id) ?? [] }));
    this.#notifier.notify(entries, { silent });
  }

  #render() {
    if (!this.#report) return;
    const report = this.#report;
    const isFavorite = this.#favorites.has(this.#location.id);
    this.#views.current.render({ location: this.#location, current: report.current, isFavorite }, this.#unit);
    this.#views.hourly.render(report.nextHours(24), this.#unit);
    this.#views.weekly.render(report.week(), this.#unit);
    this.#views.rainChance.render(report);
    this.#views.history.render(
      { history: report.history(), week: report.week(), trend: report.trendVsLastWeek() },
      this.#unit,
    );
    this.#views.sun.render({
      sun: report.sunTimesOn(),
      daylightMinutes: report.daylightRemainingMinutes(),
    });
    this.#views.pollen.render(this.#pollen);
    this.#theme.apply(report.current);
  }

  #renderFavorites() {
    this.#views.favorites.render(this.#favorites.list(), this.#location?.id ?? null);
  }

  // The location on screen first, then each saved location (without repeating the current one).
  #renderAlerts() {
    const currentId = this.#location?.id ?? null;
    const entries = [];
    if (this.#location) entries.push({ location: this.#location, alerts: this.#currentAlerts, isCurrent: true });
    for (const location of this.#favorites.list()) {
      if (location.id === currentId) continue;
      entries.push({ location, alerts: this.#favoriteAlerts.get(location.id) ?? [], isCurrent: false });
    }
    this.#views.alerts.render(entries);
  }
}
