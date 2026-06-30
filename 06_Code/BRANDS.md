# Adding a New Brand

A "brand" is a client identity: a set of visual tokens, a Sanity dataset, and Publisher
output styling. Everything for a brand is keyed to a single short name (e.g. `paralia`).

---

## Step 1 — Define brand tokens (Content System)

Create `06_Code/tokens/brands/{brandname}.json`:

```json
{
  "brand": "brandname",
  "tokens": {
    "color-bg":     "#0b0e15",
    "color-text":   "#e5ebf2",
    "color-accent": "#183EFC",
    "font-sans":    "\"Inter\", sans-serif"
  }
}
```

Rules:
- Token keys use kebab-case (they become `--key` in CSS and `$key` in SCSS)
- Any token key matching a base.scss variable overrides the base default for SCSS consumers
- Extension tokens (not in base.scss) are freely addable here

Then run the compiler from `06_Code/tokens/`:
```powershell
node compile.js   # or: npm run compile
```

This generates:
- `brands/compiled/{brandname}.css`   — CSS custom properties, for any web client
- `brands/compiled/{brandname}.scss`  — SCSS variables, for Publisher/Portfolio
- `brands/compiled/{brandname}.json`  — flat JSON, for Python/C#/JS clients

Commit all four files (the JSON source + three compiled outputs).

---

## Step 2 — Create SCSS brand entry file (Content System)

Create `06_Code/tokens/brands/{brandname}.scss`:

```scss
// {Brandname} — SCSS entry point
// Source of truth: brands/{brandname}.json — run compile.js to regenerate

@import "compiled/{brandname}";  // generated variable declarations
@import "../base";                // fill remaining tokens with !default values
```

This is what Publisher and Portfolio import when they use this brand.

---

## Step 3 — Add Sanity workspace (Content System)

In `06_Code/sanity/sanity.config.js`, add a workspace entry:

```js
{
  name: 'brandname',
  title: 'Brand Display Name',
  projectId,
  dataset: 'brandname',   // must match dataset created in Step 4
  basePath: '/brandname',
  plugins,
  schema,
},
```

---

## Step 4 — Create Sanity dataset

In [sanity.io/manage](https://sanity.io/manage) → project `n59ihvcl` → **Datasets** →
**Add dataset** → name it `{brandname}`.

The Sanity workspace from Step 3 will 404 until this dataset exists.

---

## Step 5 — Add Publisher brand config (Publisher repo)

Create `06_Code/engineering-publisher/brands/{brandname}.js`:

```js
export default {
  sanity: {
    projectId: 'n59ihvcl',
    dataset:   'brandname',
    apiVersion: '2025-02-19',
  },
  outputSubdir: 'brandname',
  theme: {
    report: 'report-brandname',
    slides: 'slides-brandname',
  },
}
```

---

## Step 6 — Add Publisher theme SCSS files (Publisher repo)

Create `06_Code/engineering-publisher/theme/report-{brandname}.scss`:

```scss
@import "../../system/06_Code/tokens/brands/{brandname}";
@import "report-core";
```

Create `06_Code/engineering-publisher/theme/slides-{brandname}.scss`:

```scss
@import "../../system/06_Code/tokens/brands/{brandname}";
@import "slides-core";
```

---

## Connecting a client repo to these brand tokens

Client repos that need brand tokens consume the compiled outputs from the Content System
submodule. No build tooling required — the compiled files are committed.

**Add Content System as a submodule:**
```powershell
git submodule add https://github.com/kotegc/Content_System.git 06_Code/system
```

**Consume by technology:**

| Consumer type        | Import                                                          |
|----------------------|-----------------------------------------------------------------|
| HTML (no build step) | `<link href="../system/06_Code/tokens/brands/compiled/{brand}.css">` |
| SCSS build           | `@import "path/to/tokens/brands/{brand}"`                       |
| Python               | `json.load(open("system/06_Code/tokens/brands/compiled/{brand}.json"))` |
| JavaScript           | `JSON.parse(readFileSync("system/06_Code/tokens/brands/compiled/{brand}.json"))` |
| C#                   | `JsonSerializer.Deserialize<Dictionary<string,string>>(File.ReadAllText(...))` |

---

## Naming convention

The brand key (`paralia`, `personal`, etc.) must be consistent across all files:
- `tokens/brands/{brand}.json` — token source
- `tokens/brands/{brand}.scss` — SCSS entry
- `sanity.config.js` workspace `name` and `dataset` — both equal to `{brand}`
- `brands/{brand}.js` in Publisher — brand config
- `theme/report-{brand}.scss` and `theme/slides-{brand}.scss` in Publisher
- Sanity dataset name — equal to `{brand}`
