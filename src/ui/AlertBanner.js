// Active alerts for the location on screen and every saved location (US-07, #20).
export class AlertBanner {
  #root;
  #list;
  #onSelectLocation;

  constructor(rootEl, { onSelectLocation }) {
    this.#root = rootEl;
    this.#list = rootEl.querySelector('[data-field="list"]');
    this.#onSelectLocation = onSelectLocation;
  }

  // entries: [{ location, alerts, isCurrent }]
  render(entries) {
    const items = entries.flatMap(({ location, alerts, isCurrent }) =>
      alerts.map((alert) => this.#item(alert, location, isCurrent)));
    this.#list.replaceChildren(...items);
    this.#root.hidden = items.length === 0;
  }

  #item(alert, location, isCurrent) {
    const li = document.createElement('li');
    li.className = `alert alert-${alert.severity.toLowerCase()}`;

    const header = document.createElement('div');
    header.className = 'alert-header';
    const badge = document.createElement('span');
    badge.className = 'alert-badge';
    badge.textContent = `⚠ ${alert.severity}`;
    const title = document.createElement('strong');
    title.textContent = alert.title;
    const place = document.createElement('span');
    place.className = 'alert-place';
    place.textContent = location.name;
    header.append(badge, title, place);
    li.append(header);

    if (alert.headline) {
      const headline = document.createElement('p');
      headline.textContent = alert.headline;
      li.append(headline);
    }

    if (alert.description) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = alert.source === 'NWS' ? 'Details from the National Weather Service' : 'About this alert';
      const body = document.createElement('p');
      body.className = 'alert-description';
      body.textContent = alert.description;
      details.append(summary, body);
      li.append(details);
    }

    if (!isCurrent) {
      const view = document.createElement('button');
      view.type = 'button';
      view.className = 'alert-view';
      view.textContent = `View ${location.name} weather`;
      view.addEventListener('click', () => this.#onSelectLocation(location));
      li.append(view);
    }
    return li;
  }
}
