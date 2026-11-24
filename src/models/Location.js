// A place the app can show weather for.
export class Location {
  constructor({ name, region = null, country = null, countryCode = null, latitude, longitude }) {
    this.name = name;
    this.region = region;
    this.country = country;
    this.countryCode = countryCode;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // Coordinates rounded to 2 decimals, so searched and geolocated places share one key format.
  get id() {
    return `${this.latitude.toFixed(2)},${this.longitude.toFixed(2)}`;
  }

  label() {
    return [this.name, this.region, this.country].filter(Boolean).join(', ');
  }

  // Builds from an Open-Meteo geocoding result.
  static fromGeocoding(result) {
    return new Location({
      name: result.name,
      region: result.admin1 ?? null,
      country: result.country ?? null,
      countryCode: result.country_code ?? null,
      latitude: result.latitude,
      longitude: result.longitude,
    });
  }

  toJSON() {
    const { name, region, country, countryCode, latitude, longitude } = this;
    return { name, region, country, countryCode, latitude, longitude };
  }

  static fromJSON(obj) {
    return new Location(obj);
  }
}
