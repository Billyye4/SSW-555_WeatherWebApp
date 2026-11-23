// Owns the app state, calls services, and tells views to render.
export class App {
  #views;
  #statusEl;
  #geocoding;
  #weather;
  #prefs;
  #favorites;

  #unit = 'F';
  #location = null;
  #report = null;
  #loadId = 0;

  constructor({ views, statusEl, geocoding, weather, prefs, favorites }) {
    this.#views = views;
    this.#statusEl = statusEl;
    this.#geocoding = geocoding;
    this.#weather = weather;
    this.#prefs = prefs;
    this.#favorites = favorites;
  }

  init() {
    this.#unit = this.#prefs.getUnit();
    this.#renderFavorites();
  }

  async search(name) {
    const loadId = ++this.#loadId;
    this.#setStatus('Loading…');
    try {
      const location = await this.#geocoding.search(name);
      if (loadId === this.#loadId) await this.loadLocation(location);
    } catch (err) {
      if (loadId === this.#loadId) this.#setStatus(err.message);
    }
  }

  async loadLocation(location) {
    // If the user starts another search while this one is loading, only the newest one renders.
    const loadId = ++this.#loadId;
    this.#setStatus('Loading…');
    try {
      const report = await this.#weather.getReport(location);
      if (loadId !== this.#loadId) return;
      this.#location = location;
      this.#report = report;
      this.#render();
      this.#renderFavorites();
      this.#setStatus('');
    } catch (err) {
      if (loadId === this.#loadId) this.#setStatus(err.message);
    }
  }

  // US-06: save or unsave the location on screen.
  toggleFavorite() {
    if (!this.#location) return;
    const { id } = this.#location;
    if (this.#favorites.has(id)) this.#favorites.remove(id);
    else this.#favorites.add(this.#location);
    this.#render();
    this.#renderFavorites();
  }

  // US-06: remove from the favorites list.
  removeFavorite(id) {
    this.#favorites.remove(id);
    this.#render();
    this.#renderFavorites();
  }

  #render() {
    if (!this.#report) return;
    const report = this.#report;
    const isFavorite = this.#favorites.has(this.#location.id);
    this.#views.current.render({ location: this.#location, current: report.current, isFavorite }, this.#unit);
    this.#views.rainChance.render(report);
    this.#views.history.render(
      { history: report.history(), week: report.week(), trend: report.trendVsLastWeek() },
      this.#unit,
    );
  }

  #renderFavorites() {
    this.#views.favorites.render(this.#favorites.list(), this.#location?.id ?? null);
  }

  #setStatus(message) {
    this.#statusEl.textContent = message;
  }
}
