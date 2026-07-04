# Content System — Component Library

A growing set of core UI components that implement any brand defined in `tokens/brands/`. Each component reads **level-2 component tokens** (`--btn-radius`, `--chip-font-size`, etc.) for its brand-specific shape and scale, and **level-1 primitive tokens** (`--color-accent`, `--color-rule`, etc.) for its colors. All CSS vars have fallbacks, so components work without any brand tokens loaded.

---

## Workflow

**This is the canonical repo.** If you're reading this file from inside a consumer repo's submodule checkout (e.g. `PAR-2026_PARALIA/06_Code/content-system`), stop — `cd` to (or clone) the standalone `SYS-2026_CONTENT_SYSTEM` checkout and make your edit there instead. **Never commit or push from inside a submodule checkout** — changes made there don't go anywhere and will be silently lost the next time the submodule pointer moves.

- **To add or edit brand values**: edit `tokens/brands/{brand}.json` or `tokens/brands/{brand}-components.json` directly for an existing brand, or see [`tokens/_starter/README.md`](../tokens/_starter/README.md) to bootstrap a new one.
- **To add a new component**: see [Adding a new component](#adding-a-new-component) below.
- **Compile**: after any `tokens/brands/*.json` edit, run `node 06_Code/tokens/compile.js` from the repo root. Commit both the JSON source and the regenerated `compiled/` output.
- **Push**: commit and push to `origin/main` in this repo. That's the last manual step.
- **What happens next**: [`update-consumers.yml`](../../.github/workflows/update-consumers.yml) watches pushes to `main` touching `06_Code/tokens/brands/compiled/**`, `06_Code/assets/**`, or `06_Code/components/**`, and opens a PR in each consumer repo (currently `My_Portfolio`, `Publisher`, `Paralia`) bumping that repo's submodule pointer. **Nothing auto-merges** — review the PR (it's just a submodule-pointer bump; the real diff is whatever you pushed here) and merge it yourself.

---

## Quick start

Five lines. That's the full setup for any consumer.

```html
<!-- 1. Primitive brand tokens: colors, fonts, radius scale, spacing scale -->
<link rel="stylesheet" href="{cs}/06_Code/tokens/brands/compiled/paralia.css">

<!-- 2. Component brand tokens: shapes, sizes, densities -->
<link rel="stylesheet" href="{cs}/06_Code/tokens/brands/compiled/paralia-components.css">

<!-- 3. Component styles (reads 1 + 2; fallbacks keep it working without them) -->
<link rel="stylesheet" href="{cs}/06_Code/components/components.css">

<!-- 4. Viewer-app chrome: header, theme toggle, session-action styling -->
<link rel="stylesheet" href="{cs}/06_Code/components/app-chrome.css">

<!-- 5. Interactive web components (chip-toggle, labeled-slider, app-header, theme-toggle) -->
<script type="module" src="{cs}/06_Code/components/index.js"></script>
```

Replace `{cs}` with your path to the content-system submodule — typically `06_Code/content-system` from a consumer repo root, or `../../content-system` from a file several directories deep.

**Swap the brand** by changing `paralia` to any other brand name in lines 1 and 2. Zero other changes needed.

---

## Component index

| Component | Type | Markup | When to use |
|-----------|------|--------|-------------|
| [chip-toggle](#chip-toggle) | Web component | `<chip-toggle>` | Binary on/off toggle, pill-shaped by default |
| [labeled-slider](#labeled-slider) | Web component | `<labeled-slider>` | Range input with live label display |
| [app-header](#app-header) | Web component | `<app-header>` | Logo + title + subtitle block for a viewer app's left rail |
| [theme-toggle](#theme-toggle) | Web component | `<theme-toggle>` | Floating light/dark theme toggle button |
| [cs-btn](#cs-btn) | CSS class | `<button class="cs-btn cs-btn--primary">` | Primary action, secondary, or ghost button |
| [cs-badge](#cs-badge) | CSS class | `<span class="cs-badge">` | Inline tag, version label, or status chip |
| [cs-card](#cs-card) | CSS class | `<div class="cs-card">` | Content container with brand surface and border |
| [cs-input-group](#cs-input-group) | CSS class | `<label class="cs-input-group">` | Labeled text input or select field |
| [cs-shelf](#cs-shelf) | CSS class | `<div class="cs-shelf">` | App-launcher tray of icon+label tiles |

---

## chip-toggle

A binary toggle button that manages its own active state. Dispatches a `chip-toggle` event (bubbles) on click or Enter/Space.

**Markup**

```html
<div class="toggles">
  <chip-toggle data-key="wire" data-on>wireframe</chip-toggle>
  <chip-toggle data-key="spin">auto-spin</chip-toggle>
  <chip-toggle data-key="clamp" data-on>clamp neg→white</chip-toggle>
</div>
```

**Attributes**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-key` | string | — | Identifier passed in the event detail |
| `data-on` | boolean (presence) | absent (off) | Initially active when present |

**Event**

```js
document.querySelector('.toggles').addEventListener('chip-toggle', e => {
  const { key, on } = e.detail;   // key: "wire", on: true/false
  state[key] = on;
});
```

**Property**

```js
const chip = document.querySelector('chip-toggle[data-key="wire"]');
chip.on;   // → boolean
```

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--chip-radius` | components | border-radius |
| `--chip-font-size` | components | font-size |
| `--chip-padding-x/y` | components | padding |
| `--color-rule` | primitive | inactive border |
| `--color-muted` | primitive | inactive text |
| `--color-accent` | primitive | active background + border |

---

## labeled-slider

A range input with a label and a live-updating value display.

**Markup**

```html
<!-- Integer value (no decimals) -->
<labeled-slider name="U" label="Longitudinal · U"
  min="6" max="96" step="1" value="48"></labeled-slider>

<!-- One decimal place -->
<labeled-slider name="r_dist" label="Distal radius · r₀"
  min="10" max="60" step="0.5" value="27" decimals="1"></labeled-slider>
```

**Attributes**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | — | Identifier passed in event detail |
| `label` | string | — | Display label text (supports Unicode: `r₀`, `·`, etc.) |
| `min` | number | 0 | Range minimum |
| `max` | number | 100 | Range maximum |
| `step` | number | 1 | Step interval |
| `value` | number | 50 | Initial value |
| `decimals` | number | 0 | Decimal places shown in live display |

**Events**

```js
// labeled-slider-input — fires on every drag tick (use for live preview)
// labeled-slider-change — fires on release (use for expensive recomputes)
slider.addEventListener('labeled-slider-input',  e => { ... e.detail.value ... });
slider.addEventListener('labeled-slider-change', e => { ... e.detail.value ... });

// detail shape: { name: string, value: number }
```

**Property**

```js
const slider = document.querySelector('labeled-slider[name="U"]');
slider.value;   // → number (current value)
```

**Debounce pattern** (for expensive operations on drag):

```js
let deb;
slider.addEventListener('labeled-slider-input', () => {
  clearTimeout(deb); deb = setTimeout(compute, 180);
});
```

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--slider-track-height` | components | range track height |
| `--slider-thumb-size` | components | thumb diameter |
| `--color-grid` | primitive | track fill color |
| `--color-signal` | primitive | thumb border color |
| `--color-text` | primitive | label color |
| `--font-mono` | primitive | value display font |

---

## app-header

Logo + title + subtitle block for a viewer app's left rail (e.g. paradigm, parable). Replaces hand-writing the same header markup in every app.

**Markup**

```html
<app-header
  app-title="para.digm"
  app-subtitle="workbench"
  logo-src="public/Paradigm_Icon.svg"
></app-header>
```

**Attributes**

| Attribute | Type | Default | Description |
|-----------|------|---------|--------------|
| `app-title` | string | — | Rendered in `<h1>`. Required. |
| `app-subtitle` | string | — | Rendered in `<span class="tag">`. Optional. |
| `logo-src` | string | — | `<img>` src. Optional — omit to render no logo. |

The element itself carries `class="brand"` so `.brand`/`.brand h1`/`.brand .tag` styling (see `app-chrome.css`) applies with no selector changes needed by consumers migrating from a hand-written `<div class="brand">`.

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--header-gap` | components | gap between logo and title block |
| `--header-logo-size` | components | logo height (width auto-scales, so non-square logos don't distort) |
| `--header-title-font-size` | components | `<h1>` font-size |
| `--header-title-letter-spacing` | components | `<h1>` letter-spacing |
| `--header-tag-font-size` | components | subtitle font-size |
| `--header-tag-letter-spacing` | components | subtitle letter-spacing |
| `--font-display-2` | primitive | `<h1>` font-family |
| `--color-ink-faint` | primitive | subtitle color |
| `--color-accent` | primitive | `<h1>` color in light mode (`body.light app-header h1`) |

---

## theme-toggle

Floating light/dark theme toggle button, positioned bottom-right of its nearest positioned ancestor (that ancestor — typically an app's main viewport panel — must set `position: relative`).

**Markup**

```html
<theme-toggle></theme-toggle>
<theme-toggle default-theme="light"></theme-toggle>
```

**Attributes**

| Attribute | Type | Default | Description |
|-----------|------|---------|--------------|
| `default-theme` | `"dark"` \| `"light"` | `"dark"` | Fallback used only when localStorage has no saved preference yet |
| `storage-key` | string | `"paralia-theme"` | localStorage key — shared across sibling apps on the same origin by design, one theme preference for the whole suite |

**Event**

```js
document.querySelector('theme-toggle').addEventListener('theme-change', e => {
  const { theme } = e.detail;   // 'dark' | 'light'
});
```
Fires once on connect (so listeners can sync immediately) and again on every toggle. Apps with theme-reactive rendering (e.g. a 3D scene) should still read the `.theme` property synchronously for their own initial render, rather than relying solely on catching this event in time — module scripts can execute in an order where the event fires before a later listener attaches:

```js
const toggle = document.querySelector('theme-toggle');
applyMyTheme(toggle.theme);              // sync initial read, no race
toggle.addEventListener('theme-change', e => applyMyTheme(e.detail.theme));
```

**Property**

```js
document.querySelector('theme-toggle').theme;   // → 'dark' | 'light'
```

Side effects: toggles a `light` class on `<body>`, persists to `localStorage`. Does not touch any app-specific rendering — purely chrome/UI state.

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--theme-toggle-radius` | components | border-radius |
| `--theme-toggle-padding-x/y` | components | padding |
| `--theme-toggle-font-size` | components | font-size |
| `--theme-toggle-offset-x/y` | components | distance from the right/bottom edge of its positioned ancestor |
| `--color-panel` | primitive | background |
| `--color-rule` | primitive | border |
| `--color-muted` | primitive | text color |
| `--color-text` | primitive | hover text color |
| `--color-accent` | primitive | focus ring |
| `--font-mono` | primitive | font-family |

---

## .cs-btn

A styled button. Apply to any `<button>` or `<a>` element.

**Markup**

```html
<button class="cs-btn cs-btn--primary">Submit</button>
<button class="cs-btn cs-btn--secondary">Cancel</button>
<button class="cs-btn cs-btn--ghost">Learn more</button>
<button class="cs-btn cs-btn--primary" disabled>Disabled</button>
<a href="/dashboard" class="cs-btn cs-btn--primary">Dashboard</a>
```

**Architecture: shape vs. color**

`.cs-btn` separates two concerns:

- **Shape** — `border-radius`, `padding`, `font-size`, `font-weight` — read from brand tokens (`--btn-radius`, `--btn-padding-x/y`, etc.) and are consistent across every button use within a brand. A brand that declares pill-shaped buttons gets pill-shaped buttons everywhere, no exceptions.

- **Color** — `background`, `color (text)`, `border-color`, and their hover states — controlled via CSS custom property hooks. Canonical variants set these hooks. App-level CSS can override any hook using a more-specific selector (see below).

**Canonical variants**

| Class | Color treatment |
|-------|----------------|
| `cs-btn--primary` | Solid accent background, white text |
| `cs-btn--secondary` | Transparent background, rule border, text-colored; hover darkens border |
| `cs-btn--ghost` | No background or border, accent-colored text; hover adds panel background |
| `cs-btn--outline-white` | Literal white border + text (not theme-reactive) — for buttons on a fixed-dark surface like `.cs-shelf`, where the button shouldn't shift with the page's light/dark theme |

**Color hook API** — override any hook in app-level CSS

```css
/* Example: a low-emphasis button that fills signal-orange on hover */
.cs-btn.signout-btn {                   /* two-class selector beats one-class variants */
  --btn-text:         var(--color-muted);
  --btn-hover-bg:     var(--color-signal);
  --btn-hover-text:   #fff;
  --btn-hover-border: var(--color-signal);
}
```

| Hook | Resting | Hover counterpart |
|------|---------|------------------|
| `--btn-bg` | background | `--btn-hover-bg` (falls back to `--btn-bg`) |
| `--btn-text` | text color | `--btn-hover-text` (falls back to `--btn-text`) |
| `--btn-border` | border color | `--btn-hover-border` (falls back to `--btn-border`) |

**CSS vars consumed (shape)**

| Var | Source | Controls |
|-----|--------|----------|
| `--btn-radius` | components | border-radius |
| `--btn-padding-x/y` | components | padding |
| `--btn-font-size` | components | font-size |
| `--btn-font-weight` | components | font-weight |

**Primitive tokens used by canonical variants**

| Var | Source | Used by |
|-----|--------|---------|
| `--color-accent` | primitive | primary bg/border; ghost text; focus ring |
| `--color-text` | primitive | secondary text |
| `--color-rule` | primitive | secondary border |
| `--color-muted` | primitive | secondary hover border |
| `--color-panel` | primitive | ghost hover background |

---

## .cs-badge

An inline tag, label, or status chip.

**Markup**

```html
<span class="cs-badge">v1.2.0</span>
<span class="cs-badge">In review</span>
```

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--badge-radius` | components | border-radius |
| `--badge-font-size` | components | font-size |
| `--badge-padding-x/y` | components | padding |
| `--color-panel` | primitive | background |
| `--color-muted` | primitive | text color |
| `--color-rule` | primitive | border |

---

## .cs-card

A content container with a brand surface color, border, and rounding.

**Markup**

```html
<div class="cs-card">
  <h2>Card heading</h2>
  <p>Card content.</p>
</div>
```

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--card-radius` | components | border-radius |
| `--card-padding` | components | padding |
| `--color-panel` | primitive | background |
| `--color-rule` | primitive | border |

---

## .cs-shelf

A long tray holding app-launcher tiles (icon + label) in a row. Unlike `.cs-card`, its background/border/text/label colors are literal hex, not primitive-token-driven — it's meant to stay a fixed dark surface even on pages using a light theme class (`body.light`).

**Markup**

```html
<div class="cs-shelf">
  <a class="cs-shelf__tile" href="/apps/paradigm">
    <span class="cs-shelf__icon-frame">
      <img class="cs-shelf__icon" src="/paradigm-icon.svg" alt="Paradigm">
    </span>
    <span class="cs-shelf__label">Paradigm</span>
  </a>

  <span class="cs-shelf__tile cs-shelf__tile--inactive" aria-disabled="true">
    <span class="cs-shelf__icon-frame">
      <img class="cs-shelf__icon" src="/parasol-icon.svg" alt="">
    </span>
    <span class="cs-shelf__label">Parasol</span>
  </span>

  <a class="cs-btn cs-btn--outline-white cs-shelf__action" href="/tour">Take a tour</a>
</div>
```

Use a real `<a>` for launchable apps. For apps that aren't built yet, use a non-anchor element (e.g. `<span>`) with `cs-shelf__tile--inactive` and `aria-disabled="true"` — this keeps it out of tab order and click-inert without needing a disabled-anchor hack. Inactive tiles still respond to hover (a smaller icon-scale than active tiles) so they read as "not yet available" rather than fully inert.

`.cs-shelf__icon-frame` reserves a fixed square slot for each icon regardless of its native aspect ratio — `.cs-shelf__icon` fills the frame's width with auto height, so a set of icons with mismatched proportions (e.g. one square, one taller, one wider) still line up consistently, favoring width as the shared dimension and centering vertically.

The shelf fills its container up to `--shelf-max-width` and shrinks fluidly below that, so it stays wide on large screens and responsive on small ones. Tiles pack to the left; an optional trailing element with `cs-shelf__action` (e.g. a button) pins itself to the right edge via `margin-left: auto`, leaving a "room to grow" gap between it and the last tile.

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--shelf-radius` | components | border-radius |
| `--shelf-padding-x/y` | components | padding |
| `--shelf-gap` | components | gap between tiles |
| `--shelf-max-width` | components | cap on the shelf's width on large screens |
| `--shelf-bg` | components | background (literal, not primitive-driven) |
| `--shelf-border` | components | border color (literal) |
| `--shelf-text` | components | label color on hover/focus (literal) |
| `--shelf-label-color` | components | label color, resting (literal) |
| `--shelf-tile-size` | components | tile width |
| `--shelf-icon-size` | components | icon width/height |
| `--shelf-icon-hover-scale` | components | active tile icon hover/focus scale |
| `--shelf-icon-hover-scale-inactive` | components | inactive tile icon hover scale (smaller than active) |
| `--shelf-label-font-size` | components | label font-size |
| `--shelf-inactive-opacity` | components | opacity of inactive tile's icon + label |
| `--color-accent` | primitive | focus ring |
| `--font-ui` | primitive | label font-family |

---

## .cs-input-group

A label + input/select pair. Use `<label>` as the outer element so clicking the label focuses the input natively.

**Markup**

```html
<!-- Text input -->
<label class="cs-input-group">
  <span class="cs-input-label">Email address</span>
  <input class="cs-input" type="email" placeholder="you@example.com">
</label>

<!-- Select -->
<label class="cs-input-group">
  <span class="cs-input-label">Specimen</span>
  <select class="cs-select">
    <option>Option A</option>
    <option>Option B</option>
  </select>
</label>
```

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--input-radius` | components | border-radius |
| `--input-padding-x/y` | components | padding |
| `--input-font-size` | components | font-size |
| `--color-panel` | primitive | background |
| `--color-text` | primitive | text color |
| `--color-rule` | primitive | border |
| `--color-accent` | primitive | focus ring |
| `--color-muted` | primitive | label + placeholder |

---

## Astro / Vite build-time inlining

When a route serves the viewer HTML via `new Response(html)`, relative `<link>` and `<script src>` paths won't resolve correctly in production. The established pattern (see `Website/src/lib/wireViewerRoute.ts`, which centralizes this for every viewer app) is to import each asset with Vite's `?raw` suffix and string-replace the link/script tags with inline equivalents:

```typescript
import paraliaCss      from '{cs}/06_Code/tokens/brands/compiled/paralia.css?raw';
import paraliaCmpCss   from '{cs}/06_Code/tokens/brands/compiled/paralia-components.css?raw';
import componentsCss   from '{cs}/06_Code/components/components.css?raw';
import appChromeCss    from '{cs}/06_Code/components/app-chrome.css?raw';
import chipToggleJs    from '{cs}/06_Code/components/chip-toggle.js?raw';
import labeledSliderJs from '{cs}/06_Code/components/labeled-slider.js?raw';
import appHeaderJs     from '{cs}/06_Code/components/app-header.js?raw';
import themeToggleJs   from '{cs}/06_Code/components/theme-toggle.js?raw';
```

Use `index.js` only for raw-HTML consumers. For inlining, import component files individually (the module-relative imports inside `index.js` don't survive string embedding).

---

## Adding a new brand

See [`tokens/_starter/README.md`](../tokens/_starter/README.md) for the full bootstrap walkthrough.

---

## Adding a new component

1. **Define its tokens** — add a section to `tokens/_starter/components.json` with the component's configurable properties and sensible generic defaults
2. **Update existing brands** — add the same section to `brands/paralia-components.json` (and any other brand files) with brand-appropriate values, or omit to use CSS fallbacks
3. **Compile** — `node 06_Code/tokens/compile.js`
4. **Write the CSS** — create `components/{name}.css`, read each brand property via `var(--{prefix}-{prop}, genericDefault)` where `genericDefault` matches the starter template value
5. **Write the JS** (only if interactive) — create `components/{name}.js` as a custom element, add `import './{name}.js'` to `index.js`
6. **Document it** — add a section to this README following the pattern above
