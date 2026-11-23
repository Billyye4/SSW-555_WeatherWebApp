// One hour of forecast. Values are metric.
export class HourlyForecast {
  constructor({ time, temperatureC, precipChance, weatherCode }) {
    this.time = time;
    this.temperatureC = temperatureC;
    this.precipChance = precipChance;
    this.weatherCode = weatherCode;
  }

  // Entry `i` of the `hourly` block of an Open-Meteo forecast response.
  static fromApi(h, i) {
    return new HourlyForecast({
      time: h.time[i],
      temperatureC: h.temperature_2m?.[i] ?? null,
      precipChance: h.precipitation_probability?.[i] ?? null,
      weatherCode: h.weather_code?.[i] ?? null,
    });
  }
}
