/**
 * app-header — brand/title block for viewer app left rails
 *
 * Markup:
 *   <app-header app-title="para.digm" app-subtitle="workbench"
 *     logo-src="public/Paradigm_Icon.svg"></app-header>
 *
 * Attributes:
 *   app-title     string  Rendered in <h1>. Required.
 *   app-subtitle  string  Rendered in <span class="tag">. Optional.
 *   logo-src      string  <img> src. Optional — omit to render no logo.
 *
 * Renders (light DOM, replaces its own children): a logo <img> (if
 * logo-src given), an <h1> with the title, and a <span class="tag"> with
 * the subtitle. The element itself carries class="brand" so existing
 * .brand / .brand h1 / .brand .tag CSS (see app-chrome.css) applies with
 * no selector changes.
 *
 * Theming: reads --font-display-2 (title font), --color-ink-faint (tag
 * color), --color-accent (title color in light mode, via body.light
 * app-header h1).
 */
class AppHeader extends HTMLElement {
  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;

    this.classList.add('brand');
    this.textContent = '';

    const title    = this.getAttribute('app-title') || '';
    const subtitle = this.getAttribute('app-subtitle');
    const logoSrc  = this.getAttribute('logo-src');

    if (logoSrc) {
      const img = document.createElement('img');
      img.className = 'brand-logo';
      img.src = logoSrc;
      img.alt = '';
      this.appendChild(img);
    }

    const h1 = document.createElement('h1');
    h1.textContent = title;
    this.appendChild(h1);

    if (subtitle) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = subtitle;
      this.appendChild(tag);
    }
  }
}

customElements.define('app-header', AppHeader);
