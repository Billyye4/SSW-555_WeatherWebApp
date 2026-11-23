import { describe, geocode, getCurrent, getForecast } from './weather.js';

const form = document.querySelector('#search');
const status = document.querySelector('#status');
const current = document.querySelector('#current');
const forecast = document.querySelector('#forecast');
const forecastDays = forecast.querySelector('.forecast');
const $ = (id) => document.getElementById(id);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = form.city.value.trim();
  if (!city) return;

  status.textContent = 'Loading…';
  current.hidden = true;
  forecastDays.replaceChildren();
  forecast.hidden = true;
  try {
    const place = await geocode(city);
    const [w, daily] = await Promise.all([
      getCurrent(place.latitude, place.longitude),
      getForecast(place.latitude, place.longitude),
    ]);
    render(place, w, daily);
    status.textContent = '';
  } catch (err) {
    status.textContent = err.message;
  }
});

function render(place, w, daily) {
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

  forecastDays.replaceChildren();
  daily.days.forEach((day) => {
    const [dayDescription, dayIcon] = describe(day.weather_code);
    const card = document.createElement('article');
    card.className = 'forecast-day';

    const date = document.createElement('time');
    date.dateTime = day.date;
    date.textContent = new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const icon = document.createElement('span');
    icon.className = 'forecast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = dayIcon;

    const description = document.createElement('span');
    description.className = 'forecast-description';
    description.textContent = dayDescription;

    const temperatures = document.createElement('span');
    temperatures.className = 'forecast-temperatures';
    temperatures.textContent = `${Math.round(day.temperature_2m_max)}${daily.units.temperature_2m_max} / ${Math.round(day.temperature_2m_min)}${daily.units.temperature_2m_min}`;

    card.append(date, icon, description, temperatures);
    forecastDays.append(card);
  });
  forecast.hidden = false;
}
