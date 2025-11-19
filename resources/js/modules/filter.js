/**
 * Filter module for filtering objects based on data attributes
 * Uses event delegation for efficient DOM event handling
 */

const SELECTORS = Object.freeze({
  attribute: '.js-filter-attribute',
  building: '[data-building]',
  object: '[data-object]',
  btnReset: '.js-btn-reset',
});

const DISPLAY_STATES = Object.freeze({
  object: 'table-row',
  building: 'block',
  hidden: 'none',
});

class Filter {
  #filters = new Map();
  #abortController = null;

  constructor() {
    this.#init();
  }

  #init() {
    this.#abortController = new AbortController();
    this.#bindEvents();
  }

  #bindEvents() {
    const { signal } = this.#abortController;

    document.addEventListener('change', this.#handleChange, { signal });
    document.addEventListener('click', this.#handleClick, { signal });
  }

  #handleChange = (event) => {
    const target = event.target;
    if (target.matches(SELECTORS.attribute)) {
      this.#updateFilter(target);
    }
  };

  #handleClick = (event) => {
    const target = event.target;
    if (target.matches(SELECTORS.btnReset)) {
      event.preventDefault();
      this.reset();
    }
  };

  #updateFilter(element) {
    const type = element.dataset.filtertype;
    const value = element.value;

    if (value === 'NULL' || value === '') {
      this.#filters.delete(type);
    } else {
      this.#filters.set(type, value);
    }

    this.#applyFilters();
  }

  #applyFilters() {
    const objects = document.querySelectorAll(SELECTORS.object);
    const buildings = document.querySelectorAll(SELECTORS.building);

    if (this.#filters.size === 0) {
      this.#showAll(objects, buildings);
      return;
    }

    const selector = this.#buildAttributeSelector();
    if (!selector) {
      this.#showAll(objects, buildings);
      return;
    }

    this.#hideAll(objects);
    this.#showMatching(selector);
  }

  #buildAttributeSelector() {
    const parts = [];

    for (const [key, value] of this.#filters) {
      if (value) {
        parts.push(`[data-${key}="${CSS.escape(value)}"]`);
      }
    }

    return parts.join('');
  }

  #hideAll(elements) {
    for (const element of elements) {
      element.style.display = DISPLAY_STATES.hidden;
    }
  }

  #showAll(objects, buildings) {
    for (const element of objects) {
      element.style.display = DISPLAY_STATES.object;
    }
    for (const element of buildings) {
      element.style.display = DISPLAY_STATES.building;
    }
  }

  #showMatching(selector) {
    const matches = document.querySelectorAll(selector);
    for (const element of matches) {
      element.style.display = DISPLAY_STATES.object;
    }
  }

  reset() {
    this.#filters.clear();

    const selects = document.querySelectorAll(`select${SELECTORS.attribute}`);
    for (const select of selects) {
      select.selectedIndex = 0;
    }

    this.#applyFilters();
  }

  destroy() {
    this.#abortController?.abort();
    this.#filters.clear();
  }

  get activeFilters() {
    return Object.fromEntries(this.#filters);
  }
}

// Initialize and export instance
const filterInstance = new Filter();
export default filterInstance;
