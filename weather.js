// WMO weather codes used by Open-Meteo: https://open-meteo.com/en/docs
const CODES = {
  0: ['Clear sky', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'],
  56: ['Freezing drizzle', '🌧️'],
  57: ['Freezing drizzle', '🌧️'],
  61: ['Light rain', '🌦️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'],
  67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  77: ['Snow grains', '🌨️'],
  80: ['Rain showers', '🌦️'],
  81: ['Rain showers', '🌧️'],
  82: ['Violent rain showers', '⛈️'],
  85: ['Snow showers', '🌨️'],
  86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm with hail', '⛈️'],
  99: ['Thunderstorm with hail', '⛈️'],
};

export function describe(code) {
  return CODES[code] ?? ['Unknown', '❓'];
}

async function getJSON(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('Network error. Check your connection and try again.');
  }
  if (!res.ok) throw new Error('Weather service is unavailable. Try again later.');
  return res.json();
}

export async function geocode(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&name=${encodeURIComponent(name)}`;
  const data = await getJSON(url);
  if (!data.results?.length) throw new Error(`No city found for "${name}".`);
  return data.results[0];
}

export async function getCurrent(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast?timezone=auto'
    + `&latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code';
  const data = await getJSON(url);
  return { ...data.current, units: data.current_units };
}
