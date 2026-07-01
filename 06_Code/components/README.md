# Content System — Component Library

Six core UI components that implement any brand defined in `tokens/brands/`. Each component reads **level-2 component tokens** (`--btn-radius`, `--chip-font-size`, etc.) for its brand-specific shape and scale, and **level-1 primitive tokens** (`--color-accent`, `--color-rule`, etc.) for its colors. All CSS vars have fallbacks, so components work without any brand tokens loaded.

---

## Quick start

Four lines. That's the full setup for any consumer.

```html
<!-- 1. Primitive brand tokens: colors, fonts, radius scale, spacing scale -->
<link rel="stylesheet" href="{cs}/06_Code/tokens/brands/compiled/paralia.css">

<!-- 2. Component brand tokens: shapes, sizes, densities -->
<link rel="stylesheet" href="{cs}/06_Code/tokens/brands/compiled/paralia-components.css">

<!-- 3. Component styles (reads 1 + 2; fallbacks keep it working without them) -->
<link rel="stylesheet" href="{cs}/06_Code/components/components.css">

<!-- 4. Interactive web components (chip-toggle, labeled-slider) -->
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
| [cs-btn](#cs-btn) | CSS class | `<button class="cs-btn cs-btn--primary">` | Primary action, secondary, or ghost button |
| [cs-badge](#cs-badge) | CSS class | `<span class="cs-badge">` | Inline tag, version label, or status chip |
| [cs-card](#cs-card) | CSS class | `<div class="cs-card">` | Content container with brand surface and border |
| [cs-input-group](#cs-input-group) | CSS class | `<label class="cs-input-group">` | Labeled text input or select field |

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

**Modifier classes**

| Class | Appearance |
|-------|------------|
| `cs-btn--primary` | Solid accent background, white text |
| `cs-btn--secondary` | Transparent background, border, text-colored |
| `cs-btn--ghost` | No background or border, accent-colored text |
| `cs-btn--chip` | Chip-scale sizing and muted text; signal-orange on hover. Pair with `cs-btn--secondary`. |

The `--chip` modifier is the action-button counterpart to `<chip-toggle>` — same visual language (chip sizing, muted text, rule border), but a one-shot action rather than a stateful toggle. Use for low-emphasis inline actions like "Sign out".

```html
<button class="cs-btn cs-btn--secondary cs-btn--chip" onclick="...">Sign out</button>
```

**CSS vars consumed**

| Var | Source | Controls |
|-----|--------|----------|
| `--btn-radius` | components | border-radius |
| `--btn-padding-x/y` | components | base padding (overridden by `--chip` modifier) |
| `--btn-font-size` | components | base font-size (overridden by `--chip` modifier) |
| `--btn-font-weight` | components | font-weight |
| `--chip-font-size` | components | font-size when `--chip` modifier applied |
| `--chip-padding-x/y` | components | padding when `--chip` modifier applied |
| `--color-accent` | primitive | primary variant color |
| `--color-text` | primitive | secondary variant text |
| `--color-muted` | primitive | chip modifier text + secondary hover border |
| `--color-rule` | primitive | secondary/chip variant border |
| `--color-signal` | primitive | chip modifier hover text |
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

When a route serves the viewer HTML via `new Response(html)`, relative `<link>` and `<script src>` paths won't resolve correctly in production. The established pattern (see `paradigm.ts`) is to import each asset with Vite's `?raw` suffix and string-replace the link/script tags with inline equivalents:

```typescript
import paraliaCss      from '{cs}/06_Code/tokens/brands/compiled/paralia.css?raw';
import paraliaCmpCss   from '{cs}/06_Code/tokens/brands/compiled/paralia-components.css?raw';
import componentsCss   from '{cs}/06_Code/components/components.css?raw';
import chipToggleJs    from '{cs}/06_Code/components/chip-toggle.js?raw';
import labeledSliderJs from '{cs}/06_Code/components/labeled-slider.js?raw';
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
