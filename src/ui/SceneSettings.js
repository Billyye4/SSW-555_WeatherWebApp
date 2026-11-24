import { Icons } from './Icons.js';

// How hard it rains or snows for each WMO code, from 0 (none) to 1 (heaviest).
const RAIN = { 51: 0.2, 53: 0.3, 55: 0.4, 56: 0.3, 57: 0.4, 61: 0.45, 63: 0.7, 65: 1, 66: 0.5, 67: 0.8, 80: 0.5, 81: 0.75, 82: 1, 95: 0.9, 96: 0.9, 99: 1 };
const SNOW = { 71: 0.4, 73: 0.7, 75: 1, 77: 0.3, 85: 0.6, 86: 1 };

// How much of the sky clouds cover, per icon family.
const CLOUDS = { clear: 0.05, 'mostly-clear': 0.25, 'partly-cloudy': 0.5, overcast: 1, fog: 0.6, drizzle: 0.85, rain: 1, snow: 0.9, storm: 1 };

// Wind at or above this speed (km/h) moves clouds and rain at full speed.
const STRONG_WIND_KMH = 40;

// What the animated weather band shows for the current conditions (US-13). No Three.js here, so it's testable.
export class SceneSettings {
  // Everything the scene draws, each from 0 to 1, plus `night` and `wind`, from -1 (blowing left) to 1 (blowing right).
  static for({ weatherCode, isDay, windKmh = 0, windDirectionDeg = null }) {
    const kind = Icons.kindFor(weatherCode);
    const clear = kind === 'clear' || kind === 'mostly-clear' || kind === 'partly-cloudy';
    return {
      clouds: CLOUDS[kind],
      cloudShade: kind === 'storm' ? 'dark' : kind === 'overcast' || kind === 'rain' || kind === 'snow' ? 'gray' : 'light',
      rain: RAIN[weatherCode] ?? 0,
      snow: SNOW[weatherCode] ?? 0,
      fog: kind === 'fog' ? 1 : 0,
      sun: isDay && clear ? (kind === 'partly-cloudy' ? 0.6 : 1) : 0,
      stars: !isDay && clear ? (kind === 'partly-cloudy' ? 0.5 : 1) : 0,
      lightning: kind === 'storm',
      night: !isDay,
      wind: SceneSettings.windDrift(windKmh, windDirectionDeg),
    };
  }

  // The gentle default before any city is loaded: a few light clouds.
  static idle() {
    return { clouds: 0.3, cloudShade: 'light', rain: 0, snow: 0, fog: 0, sun: 0, stars: 0, lightning: false, night: false, wind: 0.3 };
  }

  // Sideways drift from the wind. Meteorological direction is where wind comes FROM, so a west wind (270°) blows right.
  static windDrift(windKmh, windDirectionDeg) {
    if (windDirectionDeg == null || !windKmh) return 0;
    const towardRight = Math.sin(((windDirectionDeg + 180) * Math.PI) / 180);
    const strength = Math.min(windKmh / STRONG_WIND_KMH, 1);
    return Math.round(towardRight * strength * 100) / 100;
  }
}
