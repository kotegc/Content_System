/**
 * theme-toggle — light/dark theme toggle button web component
 *
 * Markup:
 *   <theme-toggle></theme-toggle>
 *   <theme-toggle default-theme="light"></theme-toggle>
 *
 * Attributes:
 *   default-theme  "dark"|"light"  Fallback used only when localStorage has no
 *                                  saved preference yet. Default: "dark".
 *   storage-key    string          localStorage key. Default: "paralia-theme".
 *                                  Shared across sibling apps on the same origin
 *                                  by design — one theme preference for the
 *                                  whole app suite, not per-app.
 *
 * Events (bubble):
 *   theme-change  →  detail: { theme: 'dark' | 'light' }
 *   Fired once on connect (so app-specific listeners can sync immediately)
 *   and again on every toggle. Apps with theme-reactive rendering (e.g. a
 *   3D scene) should still read the `.theme` property synchronously for
 *   their own initial render rather than relying solely on catching this
 *   event in time — see the `.theme` property below.
 *
 * Property:
 *   .theme  →  current 'dark' | 'light'
 *
 * Side effects: toggles a `light` class on <body>, persists to localStorage.
 * Does not touch any app-specific rendering — purely chrome/UI state.
 */
class ThemeToggle extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.classList.add('theme-toggle');
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');

    this._storageKey = this.getAttribute('storage-key') || 'paralia-theme';
    const fallback = this.getAttribute('default-theme') === 'light' ? 'light' : 'dark';
    this._theme = localStorage.getItem(this._storageKey) || fallback;

    this._render();

    this.addEventListener('click', () => this._toggle());
    this.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggle(); }
    });
  }

  _toggle() {
    this._theme = this._theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this._storageKey, this._theme);
    this._render();
  }

  _render() {
    document.body.classList.toggle('light', this._theme === 'light');
    this.textContent = this._theme === 'dark' ? '◑ dark' : '◑ light';
    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: this._theme },
      bubbles: true,
    }));
  }

  get theme() { return this._theme; }
}

customElements.define('theme-toggle', ThemeToggle);
