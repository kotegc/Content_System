# Tokens

Design tokens for the unified content system.

## Files

| File | Purpose |
|---|---|
| `base.scss` | All base token definitions — typography, color, spacing, radius, layout, breakpoints |
| `brands/personal.scss` | George Kote personal engineering brand |
| `brands/paralia.scss` | Paralia brand (placeholder) |

## How Tokens Work

All variables in `base.scss` use the `!default` flag. This means any variable defined **before** `base.scss` is imported will take precedence over the base value.

Brand overlay files define their overrides first, then import base:

```scss
// brands/personal.scss
$font-sans: "IBM Plex Sans", sans-serif;  // override defined first
$font-display: "Grotesky", sans-serif;    // override defined first

@import "../base";  // base fills in everything else
```

This means a renderer that wants the personal brand imports only one file:

```scss
@import "path/to/tokens/brands/personal";
// now has ALL tokens: personal overrides + base defaults
```

A renderer that wants no brand overlay imports base directly:

```scss
@import "path/to/tokens/base";
// system font stacks, neutral colors
```

## Token Categories

### Typography
- `$font-sans` — primary body font stack
- `$font-mono` — monospace / code font stack
- `$font-serif` — serif stack (long-form text, pull quotes)
- `$font-display` — display/heading font (brand-specific; defaults to `$font-sans`)
- `$font-retro` — retro/accent font (brand-specific; defaults to `$font-mono`)

### Colors
- `$color-bg` — page background
- `$color-text` — primary text
- `$color-muted` — secondary text, captions
- `$color-rule` — horizontal rules, borders
- `$color-accent` — accent / interactive / engineering callout border
- `$color-code-bg` — code block background
- `$color-{type}-bg` — per-block-type background tints: note, warning, decision, requirement, test, assumption, risk

### Spacing
Scale: `$space-1` (4px) through `$space-12` (48px)

### Border Radius
`$radius-sm` (4px), `$radius-md` (8px), `$radius-lg` (14px)

### Layout
- `$content-width` — max content column width (860px)
- `$wide-width` — wide/full content width (1160px)
- `$page-gutter` — horizontal page padding (1.5rem)
- `$grid-gap` — derived from `$page-gutter / 4`

### Breakpoints
- `$bp-md` — tablet threshold (1080px)
- `$bp-sm` — mobile threshold (640px)

### Navigation
- `$nav-h` — nav bar height (8vh)

## Adding a New Brand

1. Create `brands/<name>.scss`
2. Define only the tokens that differ from base
3. Import base at the end: `@import "../base";`
4. Never duplicate base token definitions — only override what changes
