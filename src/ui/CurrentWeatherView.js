import { Icons } from './Icons.js';
import { Dates } from '../util/Dates.js';
import { Units } from '../util/Units.js';
import { WeatherCodes } from '../util/WeatherCodes.js';

// The hero: current conditions (US-01, US-08), today's high and low, and a save-to-favorites button (US-06).
export class CurrentWeatherView {
  #root;
  #fields;

  constructor(rootEl, { onToggleFavorite } = {}) {
    this.#root = rootEl;
    this.#fields = Object.fromEntries(
      [...rootEl.querySelectorAll('[data-field]')].map((el) => [el.dataset.field, el]),
    );
    this.#fields.favorite?.addEventListener('click', () => onToggleFavorite?.());
  }

  // today is today's DailyForecast, for the high and low. It may be missing.
  render({ location, current, today = null, isFavorite = false }, unit) {
    const f = this.#fields;
    const degrees = (c) => (c == null ? '–' : `${Units.temp(c, unit)}°`);

    f.place.textContent = location.name;
    f.region.textContent = [location.region, location.country].filter(Boolean).join(', ');
    f.region.hidden = !f.region.textContent;
    f.asOf.textContent = `As of ${Dates.formatTime(current.time)} local time`;

    // Icons.svg returns fixed markup with no API data in it.
    f.icon.innerHTML = Icons.svg(current.weatherCode, current.isDay);
    f.temp.textContent = degrees(current.temperatureC);
    f.unit.textContent = unit === 'F' ? 'Fahrenheit' : 'Celsius';
    f.desc.textContent = WeatherCodes.describe(current.weatherCode).label;
    f.high.textContent = degrees(today?.highC);
    f.low.textContent = degrees(today?.lowC);

    f.feels.textContent = degrees(current.feelsLikeC);
    f.humidity.textContent = `${current.humidity}%`;
    this.#renderWind(current, unit);
    this.#renderFavorite(location, isFavorite);
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

  #renderFavorite(location, isFavorite) {
    const button = this.#fields.favorite;
    if (!button) return;
    button.textContent = isFavorite ? '★' : '☆';
    button.setAttribute('aria-pressed', String(isFavorite));
    button.setAttribute('aria-label', isFavorite
      ? `Remove ${location.name} from favorites`
      : `Save ${location.name} to favorites`);
    button.title = isFavorite ? 'Saved to favorites' : 'Save to favorites';
  }
}
