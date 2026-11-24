// Saved locations: click one to load its weather, × to remove it (US-06).
export class FavoritesView {
  #list;
  #empty;
  #onSelect;
  #onRemove;

  constructor(rootEl, { onSelect, onRemove }) {
    this.#list = rootEl.querySelector('[data-field="list"]');
    this.#empty = rootEl.querySelector('[data-field="empty"]');
    this.#onSelect = onSelect;
    this.#onRemove = onRemove;
  }

  render(locations, currentId = null) {
    this.#empty.hidden = locations.length > 0;
    this.#list.replaceChildren(...locations.map((loc) => this.#item(loc, loc.id === currentId)));
  }

  #item(location, isCurrent) {
    const li = document.createElement('li');
    li.className = 'favorite-item';

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'favorite-open';
    open.textContent = location.name;
    open.title = location.label();
    if (isCurrent) open.setAttribute('aria-current', 'true');
    open.addEventListener('click', () => this.#onSelect(location));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'favorite-remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${location.name} from favorites`);
    remove.addEventListener('click', () => this.#onRemove(location.id));

    li.append(open, remove);
    return li;
  }
}
