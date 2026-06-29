# Macros

Math macro definitions for the unified content system.

## Files

| File | Purpose |
|---|---|
| `macros.yml` | Source of truth — all LaTeX / MathJax notation defined here |
| `generate-macros.py` | Reads `macros.yml`, writes both generated outputs |
| `generated/macros.tex` | LaTeX `\providecommand` definitions (for Quarto PDF) |
| `generated/mathjax-macros.html` | MathJax `window.MathJax.tex.macros` config (for web) |

The generated files are committed so that consumers without Python can still build.

## Adding or Editing Macros

Edit `macros.yml`, then regenerate:

```bash
python generate-macros.py
```

Commit both generated files alongside the change to `macros.yml`.

## Macro Format

```yaml
# No arguments
transpose: "^{\\mathsf{T}}"

# N arguments  (use #1, #2, ... as placeholders)
vect: ["\\boldsymbol{#1}", 1]
pd:   ["\\frac{\\partial #1}{\\partial #2}", 2]
```

## Using in Renderers

### Quarto PDF (via LaTeX)

In document frontmatter or `_quarto.yml`:

```yaml
format:
  pdf:
    include-in-header:
      - path/to/system/06_Code/macros/generated/macros.tex
```

### Quarto HTML / Reveal.js (via MathJax)

In `_quarto.yml`:

```yaml
format:
  html:
    include-in-header:
      - path/to/system/06_Code/macros/generated/mathjax-macros.html
  revealjs:
    include-in-header:
      - path/to/system/06_Code/macros/generated/mathjax-macros.html
```

### Astro (via MathJax in `<head>`)

```astro
---
import macros from 'path/to/system/06_Code/macros/generated/mathjax-macros.html?raw';
---
<Fragment set:html={macros} />
```

Also include MathJax from CDN in your base layout:

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
```

## Current Macros

| Macro | Usage | Output |
|---|---|---|
| `\vect{x}` | vectors | **x** (bold) |
| `\mat{A}` | matrices | **A** (bold upright) |
| `\transpose` | transpose | ᵀ superscript |
| `\inverse` | matrix inverse | ⁻¹ superscript |
| `\Real` | real numbers | ℝ |
| `\norm{x}` | norm | ‖x‖ |
| `\abs{x}` | absolute value | |x| |
| `\set{x}` | set notation | {x} |
| `\diag` | diagonal operator | diag |
| `\trace` | trace operator | tr |
| `\rank` | rank operator | rank |
| `\argmin` | argmin | arg min |
| `\argmax` | argmax | arg max |
| `\dd` | differential d | d (upright) |
| `\pd{f}{x}` | partial derivative | ∂f/∂x |
| `\od{f}{x}` | ordinary derivative | df/dx |
