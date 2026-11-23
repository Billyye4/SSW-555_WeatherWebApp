import { describe, formatTemperature, formatWindSpeed, geocode, getCurrent } from './weather.js';

const form = document.querySelector('#search');
const status = document.querySelector('#status');
const current = document.querySelector('#current');
const unitToggle = document.querySelector('#unit-toggle');
const $ = (id) => document.getElementById(id);
let unit = 'F';
let currentPlace = null;
let currentWeather = null;

try {
  const savedUnit = globalThis.localStorage.getItem('weather:unit');
  if (savedUnit === 'C' || savedUnit === 'F') unit = savedUnit;
} catch {
  status.textContent = 'Temperature preference could not be loaded.';
}
unitToggle.querySelector(`input[value="${unit}"]`).checked = true;

unitToggle.addEventListener('change', (event) => {
  if (event.target.name !== 'unit' || !event.target.checked) return;
  unit = event.target.value;
  if (currentWeather) render(currentPlace, currentWeather);
  try {
    globalThis.localStorage.setItem('weather:unit', unit);
    status.textContent = '';
  } catch {
    status.textContent = 'Temperature preference could not be saved.';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = form.city.value.trim();
  if (!city) return;

  status.textContent = 'Loading…';
  current.hidden = true;
  currentPlace = null;
  currentWeather = null;
  try {
    const place = await geocode(city);
    const w = await getCurrent(place.latitude, place.longitude);
    currentPlace = place;
    currentWeather = w;
    render(place, w);
    status.textContent = '';
  } catch (err) {
    status.textContent = err.message;
  }
});

function render(place, w) {
  const [desc, icon] = describe(w.weather_code);
  const u = w.units;
  $('place').textContent = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
  $('icon').textContent = icon;
  $('temp').textContent = formatTemperature(w.temperature_2m, unit);
  $('desc').textContent = desc;
  $('feels').textContent = formatTemperature(w.apparent_temperature, unit);
  $('humidity').textContent = `${w.relative_humidity_2m}${u.relative_humidity_2m}`;
  $('wind').textContent = formatWindSpeed(w.wind_speed_10m, unit);
  current.hidden = false;
}
