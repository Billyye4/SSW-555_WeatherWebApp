const NAMES = {
  alder: 'Alder',
  birch: 'Birch',
  grass: 'Grass',
  mugwort: 'Mugwort',
  olive: 'Olive',
  ragweed: 'Ragweed',
};

// Pollen card (US-11).
export class PollenView {
  #root;
  #fields;

  constructor(rootEl) {
    this.#root = rootEl;
    this.#fields = Object.fromEntries(
      [...rootEl.querySelectorAll('[data-field]')].map((el) => [el.dataset.field, el]),
    );
  }

  // pollen is a PollenReport, null when the location has no pollen data, or undefined while it loads.
  render(pollen) {
    const { summary, levels } = this.#fields;
    levels.replaceChildren();

    if (pollen === undefined) {
      summary.textContent = 'Loading pollen…';
    } else if (pollen === null) {
      summary.textContent = "Pollen data isn't available for this location.";
    } else {
      const level = pollen.overallLevel();
      const top = pollen.topAllergen();
      const badge = this.#el('span', level);
      badge.className = 'pollen-badge';
      badge.dataset.level = level.toLowerCase();
      summary.replaceChildren(badge, top ? ` Highest: ${NAMES[top]}` : ' No pollen in the air right now');

      for (const [type, value] of Object.entries(pollen.levels)) {
        if (value === null) continue;
        levels.append(this.#el('dt', NAMES[type]), this.#el('dd', `${Math.round(value)} grains/m³`));
      }
    }
    this.#root.hidden = false;
  }

  #el(tag, text) {
    const el = this.#root.ownerDocument.createElement(tag);
    el.textContent = text;
    return el;
  }
}
