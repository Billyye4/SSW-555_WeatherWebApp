// Helpers for the 'YYYY-MM-DD' date strings Open-Meteo returns.
// All math is done in UTC so the viewer's own time zone never shifts a date.
export class Dates {
  static addDays(isoDate, days) {
    const d = new Date(`${isoDate}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // 'Sat, Nov 28'
  static formatDay(isoDate) {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
    });
  }

  // 'Nov 28'
  static formatMonthDay(isoDate) {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', timeZone: 'UTC',
    });
  }

  // 'Sat'
  static formatWeekday(isoDate) {
    return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  }

  // Minutes from one local 'YYYY-MM-DDTHH:mm' time to another. Both are read as UTC, so no time zone shifts them.
  static minutesBetween(from, to) {
    return Math.round((Date.parse(`${to}Z`) - Date.parse(`${from}Z`)) / 60_000);
  }
}
