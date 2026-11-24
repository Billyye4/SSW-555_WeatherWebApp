// City search with suggestions as you type (US-05).
// Follows the ARIA combobox pattern: arrow keys move through the list, Enter picks,
// Escape closes. Views don't call services, so suggestions come from the onSuggest callback.
export class SearchBar {
  static DEBOUNCE_MS = 250;
  static MIN_CHARS = 2;

  #form;
  #input;
  #button;
  #list;
  #callbacks;
  #options = [];
  #active = -1;
  #timer = null;

  // callbacks: onSearch(name), onSuggest(query) -> Promise<Location[]>, onSelect(location)
  constructor(rootEl, callbacks) {
    this.#form = rootEl;
    this.#input = rootEl.elements.city;
    this.#button = rootEl.querySelector('button[type="submit"]');
    this.#list = rootEl.querySelector('[role="listbox"]');
    this.#callbacks = callbacks;

    rootEl.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#close();
      callbacks.onSearch(this.#input.value);
    });
    this.#input.addEventListener('input', () => this.#scheduleSuggest());
    this.#input.addEventListener('keydown', (e) => this.#onKeyDown(e));
    this.#input.addEventListener('blur', () => this.#close());
    // mousedown (not click) so the input doesn't blur and close the list first.
    this.#list.addEventListener('mousedown', (e) => {
      const option = e.target.closest('[role="option"]');
      if (!option) return;
      e.preventDefault();
      this.#pick(Number(option.dataset.index));
    });
  }

  // Disables the button while a search loads.
  setBusy(busy) {
    this.#button.disabled = busy;
    this.#form.setAttribute('aria-busy', String(busy));
  }

  #scheduleSuggest() {
    clearTimeout(this.#timer);
    const query = this.#input.value.trim();
    if (query.length < SearchBar.MIN_CHARS) {
      this.#close();
      return;
    }
    this.#timer = setTimeout(async () => {
      const places = await this.#callbacks.onSuggest(query);
      // Ignore answers for text the user has already changed.
      if (this.#input.value.trim() === query && document.activeElement === this.#input) this.#show(places);
    }, SearchBar.DEBOUNCE_MS);
  }

  #show(places) {
    this.#options = places;
    this.#active = -1;
    this.#list.replaceChildren(...places.map((place, i) => {
      const li = document.createElement('li');
      li.id = `search-option-${i}`;
      li.setAttribute('role', 'option');
      li.dataset.index = i;
      li.setAttribute('aria-selected', 'false');
      const name = document.createElement('strong');
      name.textContent = place.name;
      const where = document.createElement('span');
      where.className = 'suggestion-where';
      where.textContent = [place.region, place.country].filter(Boolean).join(', ');
      li.append(name, ' ', where);
      return li;
    }));
    const open = places.length > 0;
    this.#list.hidden = !open;
    this.#input.setAttribute('aria-expanded', String(open));
    this.#input.removeAttribute('aria-activedescendant');
  }

  #close() {
    clearTimeout(this.#timer);
    this.#show([]);
  }

  #onKeyDown(e) {
    const count = this.#options.length;
    if (e.key === 'Escape') {
      this.#close();
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && count) {
      e.preventDefault();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      this.#highlight((this.#active + step + count) % count);
    } else if (e.key === 'Enter' && this.#active >= 0) {
      e.preventDefault();
      this.#pick(this.#active);
    }
  }

  #highlight(index) {
    this.#active = index;
    [...this.#list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === index)));
    this.#input.setAttribute('aria-activedescendant', `search-option-${index}`);
  }

  #pick(index) {
    const place = this.#options[index];
    if (!place) return;
    this.#input.value = place.label();
    this.#close();
    this.#callbacks.onSelect(place);
  }
}
