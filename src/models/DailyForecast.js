// One day of forecast (or history). Values are metric.
export class DailyForecast {
  constructor({ date, highC, lowC, weatherCode, precipChanceMax = null, sunrise = null, sunset = null, gustMaxKmh = null }) {
    this.date = date;
    this.highC = highC;
    this.lowC = lowC;
    this.weatherCode = weatherCode;
    this.precipChanceMax = precipChanceMax;
    this.sunrise = sunrise;
    this.sunset = sunset;
    this.gustMaxKmh = gustMaxKmh;
  }

  // Entry `i` of the `daily` block of an Open-Meteo forecast response.
  static fromApi(d, i) {
    return new DailyForecast({
      date: d.time[i],
      highC: d.temperature_2m_max?.[i] ?? null,
      lowC: d.temperature_2m_min?.[i] ?? null,
      weatherCode: d.weather_code?.[i] ?? null,
      precipChanceMax: d.precipitation_probability_max?.[i] ?? null,
      sunrise: d.sunrise?.[i] ?? null,
      sunset: d.sunset?.[i] ?? null,
      gustMaxKmh: d.wind_gusts_10m_max?.[i] ?? null,
    });
  }
}
