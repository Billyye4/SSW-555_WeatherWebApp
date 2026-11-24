// City search form (US-05).
export class SearchBar {
  constructor(rootEl, { onSearch }) {
    rootEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = rootEl.elements.city.value.trim();
      if (name) onSearch(name);
    });
  }
}
