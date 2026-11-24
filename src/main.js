// Entry point: the one place that creates every object and wires them together.
import { App } from './app/App.js';
import { HttpClient } from './services/HttpClient.js';
import { GeocodingService } from './services/GeocodingService.js';
import { WeatherService } from './services/WeatherService.js';
import { AirQualityService } from './services/AirQualityService.js';
import { LocalStore } from './storage/LocalStore.js';
import { PreferencesStore } from './storage/PreferencesStore.js';
import { FavoritesStore } from './storage/FavoritesStore.js';
import { SearchBar } from './ui/SearchBar.js';
import { UnitToggle } from './ui/UnitToggle.js';
import { CurrentWeatherView } from './ui/CurrentWeatherView.js';
import { HourlyView } from './ui/HourlyView.js';
import { WeeklyView } from './ui/WeeklyView.js';
import { RainChanceView } from './ui/RainChanceView.js';
import { HistoryView } from './ui/HistoryView.js';
import { SunView } from './ui/SunView.js';
import { PollenView } from './ui/PollenView.js';
import { Theme } from './ui/Theme.js';
import { FavoritesView } from './ui/FavoritesView.js';
import { AlertService } from './services/AlertService.js';
import { NwsAlertProvider } from './services/NwsAlertProvider.js';
import { RuleAlertProvider } from './services/RuleAlertProvider.js';
import { AlertBanner } from './ui/AlertBanner.js';
import { AlertNotifier } from './ui/AlertNotifier.js';

const $ = (selector) => document.querySelector(selector);

const http = new HttpClient();
const theme = new Theme();
const store = new LocalStore();
const weather = new WeatherService(http);
const notifier = new AlertNotifier(store);
notifier.attach($('#notify-button'));

// Views call back into the app, which is created right after them.
let app;
const views = {
  search: new SearchBar($('#search'), { onSearch: (name) => app.search(name) }),
  unitToggle: new UnitToggle($('#unit-toggle'), { onChange: (unit) => app.setUnit(unit) }),
  current: new CurrentWeatherView($('#current-weather'), { onToggleFavorite: () => app.toggleFavorite() }),
  hourly: new HourlyView($('#hourly')),
  weekly: new WeeklyView($('#weekly')),
  rainChance: new RainChanceView($('#rain-chance')),
  history: new HistoryView($('#history')),
  sun: new SunView($('#sun')),
  pollen: new PollenView($('#pollen')),
  favorites: new FavoritesView($('#favorites'), {
    onSelect: (location) => app.loadLocation(location),
    onRemove: (id) => app.removeFavorite(id),
  }),
  alerts: new AlertBanner($('#alerts'), { onSelectLocation: (location) => app.loadLocation(location) }),
};

app = new App({
  views,
  statusEl: $('#status'),
  geocoding: new GeocodingService(http),
  weather,
  prefs: new PreferencesStore(store),
  favorites: new FavoritesStore(store),
  alerts: new AlertService(new NwsAlertProvider(http), new RuleAlertProvider(), weather),
  notifier,
  airQuality: new AirQualityService(http),
  theme,
});
app.init();

// US-13: animated clouds, rain, and snow in the weather band. It loads after the forecast so it never delays it.
// It's skipped for people who prefer reduced motion, and on devices without WebGL2 (which Three.js needs),
// so those never download the library. The plain gradient stays in both cases.
const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true;
if (!reduceMotion && document.createElement('canvas').getContext('webgl2')) {
  import('./ui/WeatherScene.js')
    .then(({ WeatherScene }) => theme.attachScene(new WeatherScene($('.band'))))
    .catch(() => {});
}
