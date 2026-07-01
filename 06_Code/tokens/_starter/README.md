# Adding a new brand

The `_starter/` directory is a copy-and-fill template. Creating a new brand takes five minutes.

---

## 1 — Copy the starter files

```bash
# Run from the repo root
cp 06_Code/tokens/_starter/brand.json         06_Code/tokens/brands/mybrand.json
cp 06_Code/tokens/_starter/components.json    06_Code/tokens/brands/mybrand-components.json
```

---

## 2 — Fill in `mybrand.json`

Change `"brand": "YOUR_BRAND_NAME"` → `"brand": "mybrand"` (must match the filename, no spaces).

Then set values for every token. The tokens break into five groups:

| Group | Tokens | What they control |
|-------|--------|-------------------|
| Core palette | `color-bg`, `color-text`, `color-accent` | Page background, body text, primary CTA color |
| Surfaces | `color-muted`, `color-rule`, `color-panel`, `color-panel-2`, `color-ink-faint`, `color-grid` | Secondary text, borders, sidebar/card backgrounds |
| Data & status | `color-signal`, `color-ok` | Highlight / warning color, success color |
| Typefaces | `font-sans`, `font-mono`, `font-display` | Body, code, and heading font stacks |
| Scale | `radius-sm/md/lg/pill`, `space-xs/sm/md/lg/xl` | Border radius and spacing used by component tokens |

The `light` block at the bottom holds dark→light overrides (applied when `body.light` class is set). Only include tokens that actually change in light mode.

**Keys starting with `_` are annotations and are stripped by the compiler** — you can leave or delete them.

---

## 3 — Fill in `mybrand-components.json`

Change `"brand"` to match. Then set component rules. The key question for each component is:

**button / chip:** What border-radius does this brand use?
- Pill-shaped → `"var(--radius-pill)"`
- Standard rounded → `"var(--radius-md)"`  
- Sharp corners → `"4px"`

**slider:** Track height and thumb size rarely need changing from defaults.

**input / badge / card:** Usually just adjust the border-radius to match the brand's rounding style.

Colors flow automatically from the primitive tokens — you don't specify them here. If `color-accent` is orange, the active chip is orange. If it's blue, the chip is blue.

---

## 4 — Compile

```bash
node 06_Code/tokens/compile.js
```

Outputs written to `06_Code/tokens/brands/compiled/`:

| File | Contents |
|------|----------|
| `mybrand.css` | Primitive tokens as CSS custom properties — the core brand stylesheet |
| `mybrand-components.css` | Component shape/size tokens as CSS custom properties |
| `mybrand.scss` | SCSS `$variable` declarations for preprocessor consumers |
| `mybrand.json` | Flat key→value JSON for programmatic use |

---

## 5 — Commit everything

```bash
git add 06_Code/tokens/brands/mybrand.json
git add 06_Code/tokens/brands/mybrand-components.json
git add 06_Code/tokens/brands/compiled/
git commit -m "add mybrand brand tokens"
```

Commit both the source JSON **and** the compiled outputs. Consumer repos pull the compiled files directly — they don't run the compiler themselves.

---

## 6 — Use it in a consumer repo

Update the consumer's submodule reference:

```bash
git submodule update --remote
```

Then follow the import pattern in [`06_Code/components/README.md`](../../components/README.md).
