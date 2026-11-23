// Owns the app state, calls services, and tells views to render.
export class App {
  #views;
  #statusEl;
  #geocoding;
  #weather;
  #prefs;

  #unit = 'F';
  #location = null;
  #report = null;
  #loadId = 0;

  constructor({ views, statusEl, geocoding, weather, prefs }) {
    this.#views = views;
    this.#statusEl = statusEl;
    this.#geocoding = geocoding;
    this.#weather = weather;
    this.#prefs = prefs;
  }

  init() {
    this.#unit = this.#prefs.getUnit();
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
      this.#setStatus('');
    } catch (err) {
      if (loadId === this.#loadId) this.#setStatus(err.message);
    }
  }

  #render() {
    if (!this.#report) return;
    const report = this.#report;
    this.#views.current.render({ location: this.#location, current: report.current }, this.#unit);
    this.#views.rainChance.render(report);
    this.#views.history.render(
      { history: report.history(), week: report.week(), trend: report.trendVsLastWeek() },
      this.#unit,
    );
  }

  #setStatus(message) {
    this.#statusEl.textContent = message;
  }
}
