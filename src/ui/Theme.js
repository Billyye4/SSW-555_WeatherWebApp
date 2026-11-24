import { WeatherCodes } from '../util/WeatherCodes.js';

// Weather background (US-13). Sets <body data-theme="rain-day"> and the like; styles/themes.css has each gradient.
export class Theme {
  #root;

  static themeFor(weatherCode, isDay) {
    return `${WeatherCodes.describe(weatherCode).category}-${isDay ? 'day' : 'night'}`;
  }

  constructor(root = document.body) {
    this.#root = root;
  }

  apply(conditions) {
    this.#root.dataset.theme = Theme.themeFor(conditions.weatherCode, conditions.isDay);
  }
}
