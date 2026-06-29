# Content System

Shared infrastructure for the unified content architecture.

This repository is the single source of truth for design tokens, math macros, the canonical block type registry, and the Intermediate Representation (IR) schema. It does not contain applications or renderers — only the shared layer that all consumers depend on.

---

## Architecture

```
Content Store (Sanity)
        │
        ▼
  IR Transformer          ← ir/transformer/sanity-to-ir.js
        │
        ▼
  IRDocument (JSON)       ← ir/schema.ts defines this shape
        │
   ┌────┴──────────┐
   ▼               ▼
Astro renderer   Quarto renderer
(portfolio web)  (PDF, slides, etc.)
        │               │
        └───────┬───────┘
                ▼
         Brand tokens     ← tokens/brands/*.scss
         (applied at renderer build time)
```

---

## Contents

```
06_Code/
├── tokens/              Design tokens — typography, color, spacing
│   ├── base.scss        Single source of truth for all tokens
│   └── brands/          Per-brand overrides
├── macros/              Math macro definitions
│   ├── macros.yml       Source of truth for all LaTeX/MathJax notation
│   ├── generate-macros.py  Generates macros.tex + mathjax-macros.html
│   └── generated/       Generated outputs (committed so consumers work without Python)
├── blocks/              Canonical block type registry
│   └── block-registry.json  All 19 block types, fields, fallback policies
└── ir/                  Intermediate Representation
    ├── schema.ts        TypeScript interfaces for IRDocument
    └── transformer/     Sanity → IR converter
```

---

## Using This Repo as a Consumer

### Add as a git submodule

```bash
# From your consumer repo root
git submodule add ../SYS-2026_CONTENT_SYSTEM system
git submodule update --init
```

### Tokens — SCSS

In any SCSS file, import the base tokens:

```scss
@import "../../system/06_Code/tokens/base";
```

To apply a brand overlay, import the brand file instead — it imports base internally:

```scss
@import "../../system/06_Code/tokens/brands/personal";
```

Adjust the relative path based on your file's location within the consumer repo.

### Tokens — Astro / Vite

In `vite.config.*`, use SCSS `additionalData` to inject tokens globally:

```js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@import "${path.resolve('system/06_Code/tokens/base')}";`
    }
  }
}
```

Or import directly in your global CSS/SCSS entry point.

### Math Macros

The generated files in `macros/generated/` are committed and ready to use without running Python.

**For Quarto PDF** — reference in document frontmatter:
```yaml
format:
  pdf:
    include-in-header:
      - system/06_Code/macros/generated/macros.tex
```

**For Quarto HTML / Reveal.js** — reference in `_quarto.yml`:
```yaml
format:
  html:
    include-in-header:
      - system/06_Code/macros/generated/mathjax-macros.html
```

**For Astro** — include in your base layout `<head>`:
```astro
---
import macros from 'system/06_Code/macros/generated/mathjax-macros.html?raw';
---
<Fragment set:html={macros} />
```

### IR Transformer

```js
import { transformDocument } from './system/06_Code/ir/transformer/sanity-to-ir.js';

const sanityDoc = await sanityClient.fetch(query, params);
const irDoc = transformDocument(sanityDoc);
```

---

## Regenerating Macro Outputs

If you edit `macros/macros.yml`, regenerate the outputs:

```bash
cd system/06_Code/macros
python generate-macros.py
```

Commit both `generated/macros.tex` and `generated/mathjax-macros.html` so consumers without Python can still build.

---

## Adding a New Brand

1. Create `tokens/brands/<brand-name>.scss`
2. Define variable overrides (see `brands/personal.scss` for the pattern)
3. End the file with `@import "../base";`
4. Reference the brand file from your renderer's build config

A brand file should only contain the token values that differ from the base. All other tokens are inherited.

---

## Versioning

The IR schema version is defined in `ir/schema.ts` as `IR_SCHEMA_VERSION`. Increment it when the IRDocument shape changes in a breaking way. Consumer code should validate `schemaVersion` on ingest.
