// Converts the metric values stored in models into the user's chosen unit.
// Unit is 'C' (°C, km/h) or 'F' (°F, mph).
export class Units {
  static cToF(c) {
    return c * 9 / 5 + 32;
  }

  static kmhToMph(kmh) {
    return kmh / 1.609344;
  }

  // Temperature in the chosen unit, rounded, without the unit symbol. `|| 0` turns -0 into 0.
  static temp(c, unit) {
    return Math.round(unit === 'F' ? Units.cToF(c) : c) || 0;
  }

  static formatTemp(c, unit) {
    return `${Units.temp(c, unit)}°${unit}`;
  }

  static formatSpeed(kmh, unit) {
    return unit === 'F'
      ? `${Math.round(Units.kmhToMph(kmh))} mph`
      : `${Math.round(kmh)} km/h`;
  }

  // 16-point compass name for the direction the wind comes from (0° = N, 90° = E).
  static degreesToCompass(deg) {
    return COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
  }

  // '12 mph NNW'. Leaves the direction off when it's unknown.
  static formatWind(kmh, deg, unit) {
    const speed = Units.formatSpeed(kmh, unit);
    return deg == null ? speed : `${speed} ${Units.degreesToCompass(deg)}`;
  }
}

const COMPASS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];
