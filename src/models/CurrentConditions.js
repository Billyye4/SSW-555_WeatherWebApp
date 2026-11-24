// Conditions right now. All values are metric (°C, km/h).
export class CurrentConditions {
  constructor({ time, temperatureC, feelsLikeC, humidity, windKmh, windDirectionDeg = null, weatherCode, isDay }) {
    this.time = time;
    this.temperatureC = temperatureC;
    this.feelsLikeC = feelsLikeC;
    this.humidity = humidity;
    this.windKmh = windKmh;
    this.windDirectionDeg = windDirectionDeg;
    this.weatherCode = weatherCode;
    this.isDay = isDay;
  }

  // From the `current` block of an Open-Meteo forecast response.
  static fromApi(c) {
    return new CurrentConditions({
      time: c.time,
      temperatureC: c.temperature_2m,
      feelsLikeC: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windKmh: c.wind_speed_10m,
      windDirectionDeg: c.wind_direction_10m ?? null,
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
    });
  }
}
