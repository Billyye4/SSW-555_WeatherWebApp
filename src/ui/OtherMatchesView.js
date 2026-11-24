// "Did you mean" list: other places that matched the last search (US-05).
export class OtherMatchesView {
  #root;
  #list;
  #onSelect;

  constructor(rootEl, { onSelect }) {
    this.#root = rootEl;
    this.#list = rootEl.querySelector('[data-field="list"]');
    this.#onSelect = onSelect;
  }

  // matches: every Location the search returned. The one on screen is left out.
  render(matches, currentId) {
    const others = matches.filter((place) => place.id !== currentId);
    this.#list.replaceChildren(...others.map((place) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = place.label();
      button.addEventListener('click', () => this.#onSelect(place));
      li.append(button);
      return li;
    }));
    this.#root.hidden = others.length === 0;
  }
}
