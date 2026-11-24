// Thresholds in grains/m³ for overallLevel(). One scale covers every pollen type. Tune it here.
export const LEVELS = { moderate: 10, high: 50 };

// Current pollen counts for one location (US-11).
export class PollenReport {
  static TYPES = ['alder', 'birch', 'grass', 'mugwort', 'olive', 'ragweed'];

  constructor({ time, levels }) {
    this.time = time;
    this.levels = levels;
  }

  // Returns null when every value is null, which is what Open-Meteo sends outside Europe.
  static fromApi(json) {
    const current = json.current ?? {};
    const levels = Object.fromEntries(
      PollenReport.TYPES.map((type) => [type, current[`${type}_pollen`] ?? null]),
    );
    if (Object.values(levels).every((value) => value === null)) return null;
    return new PollenReport({ time: current.time, levels });
  }

  // 'Low', 'Moderate', or 'High', from the highest count.
  overallLevel() {
    const highest = this.#highest()?.value ?? 0;
    if (highest >= LEVELS.high) return 'High';
    if (highest >= LEVELS.moderate) return 'Moderate';
    return 'Low';
  }

  // Returns null when there's no pollen in the air at all, so the view doesn't name an allergen at 0.
  topAllergen() {
    const top = this.#highest();
    return top && top.value > 0 ? top.type : null;
  }

  #highest() {
    let top = null;
    for (const [type, value] of Object.entries(this.levels)) {
      if (value !== null && (top === null || value > top.value)) top = { type, value };
    }
    return top;
  }
}
