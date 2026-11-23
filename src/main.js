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
import { FavoritesView } from './ui/FavoritesView.js';

const $ = (selector) => document.querySelector(selector);

const http = new HttpClient();
const store = new LocalStore();

// Views call back into the app, which is created right after them.
let app;
const views = {
  search: new SearchBar($('#search'), { onSearch: (name) => app.search(name) }),
  current: new CurrentWeatherView($('#current-weather'), { onToggleFavorite: () => app.toggleFavorite() }),
  rainChance: new RainChanceView($('#rain-chance')),
  history: new HistoryView($('#history')),
  favorites: new FavoritesView($('#favorites'), {
    onSelect: (location) => app.loadLocation(location),
    onRemove: (id) => app.removeFavorite(id),
  }),
};

app = new App({
  views,
  statusEl: $('#status'),
  geocoding: new GeocodingService(http),
  weather: new WeatherService(http),
  prefs: new PreferencesStore(store),
  favorites: new FavoritesStore(store),
});
app.init();
