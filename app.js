import { describe, geocode, getCurrent } from './weather.js';

const form = document.querySelector('#search');
const status = document.querySelector('#status');
const current = document.querySelector('#current');
const hourly = document.querySelector('#hourly');
const hourlyList = document.querySelector('#hourly-list');
const $ = (id) => document.getElementById(id);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = form.city.value.trim();
  if (!city) return;

  status.textContent = 'Loading…';
  current.hidden = true;
  hourly.hidden = true;
  hourlyList.replaceChildren();
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

  hourlyList.replaceChildren();
  w.hours.forEach((hour) => {
    const [description, weatherIcon] = describe(hour.weather_code);
    const hourOfDay = Number(hour.time.slice(11, 13));
    const period = hourOfDay >= 12 ? 'PM' : 'AM';
    const displayHour = hourOfDay % 12 || 12;
    const card = document.createElement('article');
    card.className = 'hourly-item';

    const time = document.createElement('time');
    time.dateTime = hour.time;
    time.textContent = `${displayHour} ${period}`;
    time.setAttribute('aria-label', `${hour.time.replace('T', ' ')}, ${description}`);

    const icon = document.createElement('span');
    icon.className = 'hourly-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = weatherIcon;

    const condition = document.createElement('span');
    condition.className = 'hourly-description';
    condition.textContent = description;

    const temperature = document.createElement('span');
    temperature.className = 'hourly-temperature';
    temperature.textContent = `${Math.round(hour.temperature_2m)}${w.hourlyUnits.temperature_2m}`;

    card.append(time, icon, condition, temperature);
    hourlyList.append(card);
  });
  hourly.hidden = false;
}
