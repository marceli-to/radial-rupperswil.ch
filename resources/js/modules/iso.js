/**
 * Isometric visualization module for interactive building/floor diagrams
 * Handles hover and touch interactions between table rows and SVG elements
 */

const SELECTORS = Object.freeze({
  object: '[data-object]',
  building: '[data-building]',
  iso: '[data-iso]',
  floor: '[data-iso-floor]',
});

const CLASSES = Object.freeze({
  active: 'is-active',
  available: 'is-available',
  taken: 'is-taken',
  up: 'is-up',
});

class IsoVisualization {
  #abortController = null;
  #clearTimeout = null;

  constructor() {
    this.#init();
  }

  #init() {
    this.#abortController = new AbortController();
    this.#bindEvents();
  }

  #bindEvents() {
    const { signal } = this.#abortController;

    // Floor events
    for (const floor of document.querySelectorAll(SELECTORS.floor)) {
      floor.addEventListener('mouseenter', () => this.#hideFloor(floor), { signal });
      floor.addEventListener('mouseleave', () => this.#showFloor(floor), { signal });
    }

    // Object (table row) events
    for (const object of document.querySelectorAll(SELECTORS.object)) {
      object.addEventListener('mouseenter', () => this.#highlightIso(object), { signal });
      object.addEventListener('click', () => this.#highlightIso(object), { signal });
      object.addEventListener('mouseleave', () => this.#clearIso(), { signal });
    }

    // ISO (SVG element) events
    for (const iso of document.querySelectorAll(SELECTORS.iso)) {
      iso.addEventListener('mouseenter', () => this.#highlightRow(iso), { signal });
      iso.addEventListener('touchstart', () => this.#highlightRow(iso), { signal, passive: true });
      iso.addEventListener('touchend', () => this.#clearAllDelayed(), { signal, passive: true });
      iso.addEventListener('mouseleave', () => this.#clearAllDelayed(), { signal });
    }
  }

  #highlightIso(object, moveSiblings = true) {
    const { objectNumber, objectState } = object.dataset;
    const stateClass = objectState === 'free' ? CLASSES.available : CLASSES.taken;
    const isos = document.querySelectorAll(`[data-iso="${objectNumber}"]`);

    for (const iso of isos) {
      iso.classList.add(CLASSES.active, stateClass);

      if (moveSiblings) {
        const floorGroup = iso.closest(SELECTORS.floor);
        if (floorGroup) {
          for (const sibling of this.#getNextSiblings(floorGroup)) {
            sibling.classList.add(CLASSES.up);
          }
        }
      }
    }
  }

  #highlightRow(iso) {
    // Cancel any pending clear
    if (this.#clearTimeout) {
      clearTimeout(this.#clearTimeout);
      this.#clearTimeout = null;
    }

    // Clear previous highlights first
    this.#clearIso();
    this.#clearRow();

    const { iso: isoNumber } = iso.dataset;
    const object = document.querySelector(`[data-object-number="${isoNumber}"]`);

    const stateClass = object?.dataset.objectState === 'free' ? CLASSES.available : CLASSES.taken;

    if (object) {
      object.classList.add(CLASSES.active);
    }

    const isos = document.querySelectorAll(`[data-iso="${isoNumber}"]`);
    for (const isoElement of isos) {
      isoElement.classList.add(CLASSES.active, stateClass);

      // Lift floors above this apartment
      const floorGroup = isoElement.closest(SELECTORS.floor);
      if (floorGroup) {
        for (const sibling of this.#getNextSiblings(floorGroup)) {
          sibling.classList.add(CLASSES.up);
        }
      }
    }
  }

  #clearIso() {
    for (const iso of document.querySelectorAll(SELECTORS.iso)) {
      iso.classList.remove(CLASSES.active, CLASSES.available, CLASSES.taken);
    }

    for (const floor of document.querySelectorAll(SELECTORS.floor)) {
      floor.classList.remove(CLASSES.up);
    }
  }

  #clearRow() {
    for (const object of document.querySelectorAll(SELECTORS.object)) {
      object.classList.remove(CLASSES.active);
    }
  }

  #clearAll() {
    this.#clearRow();
    this.#clearIso();
  }

  #clearAllDelayed() {
    if (this.#clearTimeout) {
      clearTimeout(this.#clearTimeout);
    }
    this.#clearTimeout = setTimeout(() => {
      this.#clearAll();
      this.#clearTimeout = null;
    }, 50);
  }

  #hideFloor(floor) {
    for (const sibling of this.#getNextSiblings(floor)) {
      sibling.classList.add(CLASSES.up);
    }
  }

  #showFloor(floor) {
    for (const sibling of this.#getNextSiblings(floor)) {
      sibling.classList.remove(CLASSES.up);
    }
  }

  #getNextSiblings(element) {
    const siblings = [];
    let current = element.nextElementSibling;

    while (current) {
      siblings.push(current);
      current = current.nextElementSibling;
    }

    return siblings;
  }

  #getAllSiblings(element) {
    const siblings = [];

    let next = element.nextElementSibling;
    while (next) {
      siblings.push(next);
      next = next.nextElementSibling;
    }

    let prev = element.previousElementSibling;
    while (prev) {
      siblings.push(prev);
      prev = prev.previousElementSibling;
    }

    return siblings;
  }

  destroy() {
    this.#abortController?.abort();
  }
}

// Initialize and export instance
const isoInstance = new IsoVisualization();
export default isoInstance;
