/**
 * chip-toggle — binary toggle button web component
 *
 * Markup:
 *   <chip-toggle data-key="wire" data-on>wireframe</chip-toggle>
 *
 * Attributes:
 *   data-key   string   Identifier passed in the event detail
 *   data-on    boolean  Present = initially active; absent = initially off
 *
 * Events (bubble):
 *   chip-toggle  →  detail: { key: string, on: boolean }
 *
 * Property:
 *   .on  →  current boolean state
 *
 * Theming: reads CSS vars --chip-radius, --chip-font-size, --chip-padding-x/y,
 * --color-rule, --color-muted, --color-accent. All have fallbacks; brand tokens
 * are optional.
 */
class ChipToggle extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    this._on = this.hasAttribute('data-on');
    this.classList.toggle('on', this._on);

    this.addEventListener('click', () => this._toggle());
    this.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggle(); }
    });
  }

  _toggle() {
    this._on = !this._on;
    this.classList.toggle('on', this._on);
    this.dispatchEvent(new CustomEvent('chip-toggle', {
      detail: { key: this.dataset.key, on: this._on },
      bubbles: true,
    }));
  }

  get on() { return this._on; }
}

customElements.define('chip-toggle', ChipToggle);
