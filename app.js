import { describe, geocode, getCurrent } from './weather.js';

const form = document.querySelector('#search');
const status = document.querySelector('#status');
const current = document.querySelector('#current');
const $ = (id) => document.getElementById(id);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = form.city.value.trim();
  if (!city) return;

  status.textContent = 'Loading…';
  current.hidden = true;
  try {
    const place = await geocode(city);
    const w = await getCurrent(place.latitude, place.longitude);
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
  $('temp').textContent = `${Math.round(w.temperature_2m)}${u.temperature_2m}`;
  $('desc').textContent = desc;
  $('feels').textContent = `${Math.round(w.apparent_temperature)}${u.apparent_temperature}`;
  $('humidity').textContent = `${w.relative_humidity_2m}${u.relative_humidity_2m}`;
  $('wind').textContent = `${w.wind_speed_10m} ${u.wind_speed_10m}`;
  current.hidden = false;
}
