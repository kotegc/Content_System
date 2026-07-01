/**
 * labeled-slider — range input with label and live value display
 *
 * Markup:
 *   <labeled-slider name="U" label="Longitudinal · U"
 *     min="6" max="96" step="1" value="48"></labeled-slider>
 *
 *   <labeled-slider name="r_dist" label="Distal radius · r₀"
 *     min="10" max="60" step="0.5" value="27" decimals="1"></labeled-slider>
 *
 * Attributes:
 *   name      string   Identifier passed in event detail
 *   label     string   Display label text
 *   min       number   Range minimum (passed to <input type=range>)
 *   max       number   Range maximum
 *   step      number   Step interval
 *   value     number   Initial value
 *   decimals  number   Decimal places for live value display (default 0)
 *
 * Events (bubble):
 *   labeled-slider-input   fires on every drag tick  →  detail: { name, value: number }
 *   labeled-slider-change  fires on release           →  detail: { name, value: number }
 *
 * Property:
 *   .value  →  current numeric value
 *
 * Theming: reads --slider-track-height, --slider-thumb-size, --color-grid,
 * --color-signal, --font-mono, --color-text. All have fallbacks.
 */
class LabeledSlider extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    const name     = this.getAttribute('name')     ?? '';
    const label    = this.getAttribute('label')    ?? '';
    const min      = this.getAttribute('min')      ?? '0';
    const max      = this.getAttribute('max')      ?? '100';
    const step     = this.getAttribute('step')     ?? '1';
    const value    = this.getAttribute('value')    ?? '50';
    const decimals = parseInt(this.getAttribute('decimals') ?? '0', 10);
    const fmt      = v => decimals > 0 ? (+v).toFixed(decimals) : v;

    this.innerHTML = `
      <div class="ls-row">
        <span class="ls-label">${label}</span>
        <span class="ls-value">${fmt(value)}</span>
      </div>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}">
    `;

    this._input   = this.querySelector('input');
    this._display = this.querySelector('.ls-value');

    this._input.addEventListener('input', () => {
      this._display.textContent = fmt(this._input.value);
      this.dispatchEvent(new CustomEvent('labeled-slider-input', {
        detail: { name, value: +this._input.value },
        bubbles: true,
      }));
    });

    this._input.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('labeled-slider-change', {
        detail: { name, value: +this._input.value },
        bubbles: true,
      }));
    });
  }

  get value() { return +this._input.value; }
}

customElements.define('labeled-slider', LabeledSlider);
