// Entry point: the one place that creates every object and wires them together.
import { App } from './app/App.js';
import { HttpClient } from './services/HttpClient.js';
import { GeocodingService } from './services/GeocodingService.js';
import { WeatherService } from './services/WeatherService.js';
import { LocalStore } from './storage/LocalStore.js';
import { PreferencesStore } from './storage/PreferencesStore.js';
import { FavoritesStore } from './storage/FavoritesStore.js';
import { SearchBar } from './ui/SearchBar.js';
import { CurrentWeatherView } from './ui/CurrentWeatherView.js';
import { RainChanceView } from './ui/RainChanceView.js';
import { HistoryView } from './ui/HistoryView.js';
import { SunView } from './ui/SunView.js';
import { FavoritesView } from './ui/FavoritesView.js';
import { AlertService } from './services/AlertService.js';
import { NwsAlertProvider } from './services/NwsAlertProvider.js';
import { RuleAlertProvider } from './services/RuleAlertProvider.js';
import { AlertBanner } from './ui/AlertBanner.js';
import { AlertNotifier } from './ui/AlertNotifier.js';

const $ = (selector) => document.querySelector(selector);

const http = new HttpClient();
const store = new LocalStore();
const weather = new WeatherService(http);
const notifier = new AlertNotifier(store);
notifier.attach($('#notify-button'));

// Views call back into the app, which is created right after them.
let app;
const views = {
  search: new SearchBar($('#search'), { onSearch: (name) => app.search(name) }),
  current: new CurrentWeatherView($('#current-weather'), { onToggleFavorite: () => app.toggleFavorite() }),
  rainChance: new RainChanceView($('#rain-chance')),
  history: new HistoryView($('#history')),
  sun: new SunView($('#sun')),
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
});
app.init();
