import { Units } from '../util/Units.js';
import { WeatherCodes } from '../util/WeatherCodes.js';

// Current conditions card (US-01, US-08).
export class CurrentWeatherView {
  #root;
  #fields;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#fields = Object.fromEntries(
      [...rootEl.querySelectorAll('[data-field]')].map((el) => [el.dataset.field, el]),
    );
  }

  render({ location, current }, unit) {
    const f = this.#fields;
    const { label, icon } = WeatherCodes.describe(current.weatherCode);
    f.place.textContent = location.label();
    f.icon.textContent = icon;
    f.temp.textContent = Units.formatTemp(current.temperatureC, unit);
    f.desc.textContent = label;
    f.feels.textContent = Units.formatTemp(current.feelsLikeC, unit);
    f.humidity.textContent = `${current.humidity}%`;
    this.#renderWind(current, unit);
    this.#root.hidden = false;
  }

  // US-08: speed, compass direction, and an arrow pointing where the wind blows toward.
  #renderWind({ windKmh, windDirectionDeg }, unit) {
    const { wind, windArrow } = this.#fields;
    wind.textContent = Units.formatWind(windKmh, windDirectionDeg, unit);
    windArrow.hidden = windDirectionDeg == null;
    if (windDirectionDeg == null) return;
    // Meteorological direction is where the wind comes FROM, so the arrow is turned 180°.
    windArrow.style.transform = `rotate(${windDirectionDeg + 180}deg)`;
    windArrow.setAttribute('aria-label', `Wind from ${Units.degreesToCompass(windDirectionDeg)}`);
  }
}
