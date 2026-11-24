// °F/°C switch (US-01).
export class UnitToggle {
  #root;

  constructor(rootEl, { onChange }) {
    this.#root = rootEl;
    rootEl.addEventListener('change', (e) => {
      if (e.target.name === 'unit' && e.target.checked) onChange(e.target.value);
    });
  }

  render(unit) {
    const input = this.#root.querySelector(`input[name="unit"][value="${unit}"]`);
    if (input) input.checked = true;
  }
}
