import { WeatherCodes } from '../util/WeatherCodes.js';

// Weather background (US-13). Sets <body data-theme="rain-day"> and the like; styles/themes.css has each gradient.
// An optional animated scene (WeatherScene) can be attached to draw clouds, rain, and so on over it.
export class Theme {
  #root;
  #scene = null;
  #last = null;

  static themeFor(weatherCode, isDay) {
    return `${WeatherCodes.describe(weatherCode).category}-${isDay ? 'day' : 'night'}`;
  }

  constructor(root = document.body) {
    this.#root = root;
  }

  apply(conditions) {
    this.#root.dataset.theme = Theme.themeFor(conditions.weatherCode, conditions.isDay);
    this.#last = conditions;
    this.#scene?.update(conditions);
  }

  // The scene loads after the page, so it gets whatever conditions are already showing.
  attachScene(scene) {
    this.#scene = scene;
    if (this.#last) scene.update(this.#last);
  }
}
