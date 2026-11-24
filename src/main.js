// Entry point: the one place that creates every object and wires them together.
import { App } from './app/App.js';
import { HttpClient } from './services/HttpClient.js';
import { GeocodingService } from './services/GeocodingService.js';
import { WeatherService } from './services/WeatherService.js';
import { LocalStore } from './storage/LocalStore.js';
import { PreferencesStore } from './storage/PreferencesStore.js';
import { SearchBar } from './ui/SearchBar.js';
import { CurrentWeatherView } from './ui/CurrentWeatherView.js';
import { RainChanceView } from './ui/RainChanceView.js';

const $ = (selector) => document.querySelector(selector);

const http = new HttpClient();
const store = new LocalStore();

// Views call back into the app, which is created right after them.
let app;
const views = {
  search: new SearchBar($('#search'), { onSearch: (name) => app.search(name) }),
  current: new CurrentWeatherView($('#current-weather')),
  rainChance: new RainChanceView($('#rain-chance')),
};

app = new App({
  views,
  statusEl: $('#status'),
  geocoding: new GeocodingService(http),
  weather: new WeatherService(http),
  prefs: new PreferencesStore(store),
});
app.init();
