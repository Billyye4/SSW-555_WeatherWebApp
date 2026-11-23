// A severe weather alert, from NWS or from forecast rules (US-07).
export class Alert {
  static SEVERITIES = ['Extreme', 'Severe', 'Moderate', 'Minor'];

  constructor({ id, title, severity, headline = '', description = '', starts = null, ends = null, source }) {
    this.id = id;
    this.title = title;
    this.severity = Alert.SEVERITIES.includes(severity) ? severity : 'Minor';
    this.headline = headline;
    this.description = description;
    this.starts = starts;
    this.ends = ends;
    this.source = source; // 'NWS' or 'forecast'
  }

  // Most severe first.
  static compare(a, b) {
    return Alert.SEVERITIES.indexOf(a.severity) - Alert.SEVERITIES.indexOf(b.severity);
  }
}
