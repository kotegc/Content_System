# ADR-004: SCSS Variables as the Design Token System

## Status
Accepted

## Date
2026-06-29

## Context

A design token is a named, reusable value that encodes a design decision — a color, a typeface, a spacing unit, a border radius. Tokens are the mechanism by which a design system maintains visual consistency across multiple surfaces: a website, a PDF document, a slide deck.

The Publisher already had a complete, well-organized token system in `theme/variables.scss`. The portfolio website had partial token coverage — spacing and typography were centralized, but colors were hardcoded in 20+ component files, making brand variations impossible without touching every component.

The decision was: what is the right format and distribution mechanism for design tokens across both systems?

The requirements:
- Tokens must be consumable by Dart Sass (which Quarto uses to compile SCSS for HTML and slides)
- Tokens must be consumable by LaTeX (which Quarto uses for PDF — at minimum, color values must be accessible)
- Tokens must support brand overlay — the same base token set must be overridable per brand without forking
- The mechanism must work with the existing SCSS import system in both consumers

## Decision

SCSS variables with the `!default` flag, organized in `tokens/base.scss`, with per-brand overlay files in `tokens/brands/`.

**The `!default` flag** is Sass's mechanism for conditional assignment: a variable is only assigned if it has not already been assigned. This enables the brand overlay pattern:

```scss
// brands/personal.scss
$font-display: "Grotesky", #{$font-sans};  // set before importing base
$color-accent:  #000000;

@import "../base";  // !default assignments fill in everything not yet set
```

A consumer that imports only `base.scss` gets the default brand. A consumer that imports `brands/personal.scss` gets the personal brand overlay applied on top of base defaults.

All token variables in `base.scss` use `!default`. No variable in `base.scss` is assigned unconditionally.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **CSS custom properties (runtime variables)** | Available in any CSS context, no compilation needed, runtime-configurable. However: cannot be used in Sass math operations or compile-time logic (`lighten()`, `darken()`, string interpolation). No `!default` equivalent — cascade works differently. Most critically, Dart Sass cannot read a CSS custom property at compile time to use in a calculation. SCSS variables are needed for the Quarto PDF path regardless. |
| **Style Dictionary (Amazon)** | Correct architecture for large design systems. Stores tokens in JSON, transforms them into any output format (SCSS, CSS custom properties, Swift, Android XML, JSON). Adds a build step and a tooling dependency. The right answer if tokens need to target mobile apps or other non-CSS consumers. Not adopted now because: all current consumers are SCSS-based, and the overhead is not justified yet. Should be added on top of this approach if a non-SCSS consumer (iOS, Android) needs the same tokens. |
| **Hardcoded values** | What the portfolio currently does in 20+ component files. Explicitly rejected. Makes brand variations require touching every component individually. |
| **CSS-in-JS (styled-components, emotion)** | JavaScript runtime, not applicable to Quarto's SCSS build or LaTeX. Not appropriate for this multi-format system. |

## Consequences

**Positive:**
- The `!default` pattern cleanly separates base tokens from brand overrides. Adding a new brand requires only one SCSS overlay file — no changes to base.scss, no changes to any consumer's component code.
- Dart Sass, used by Quarto for HTML and slide output, natively supports SCSS. No additional tooling is required in any current consumer.
- Tokens defined once in `base.scss` are the single source of truth for all visual constants across all output formats.
- The existing Publisher token vocabulary (`theme/variables.scss`) was the starting point for `base.scss`, extended with portfolio-specific additions. No Publisher token was changed in meaning.

**Negative (known tradeoffs):**
- All consumers must have a SCSS compilation step. Raw CSS cannot import SCSS. A pure-HTML consumer (one that doesn't use Sass/Quarto) would need to either: consume a compiled CSS file (which requires a build step in the token system), or use a different mechanism.
- LaTeX (PDF) cannot consume SCSS variables directly. Colors and fonts for the PDF output must be duplicated in `latex/preamble.tex`. This is a known divergence — the LaTeX preamble is the one place where token values are not automatically applied. Changes to token colors must be manually reflected in the preamble if they affect PDF output.
- The portfolio's component CSS still has hardcoded color values (legacy technical debt from before the token system was established). These must be migrated to token references in Phase 2 of the migration plan.

**Neutral:**
- SCSS variables are compile-time only. There is no runtime theming capability. Brand is selected at build time by which import chain is used. This is by design — brand is a build-time renderer parameter, not a runtime content value.

## Signals to Revisit

- When a non-SCSS consumer needs the same tokens (a mobile app, a native desktop application, an email template): add Style Dictionary. Configure it to read a JSON token source and emit `base.scss` as one of its outputs. The SCSS-based consumers then become Style Dictionary consumers without any changes to their import chains.
- If the LaTeX/PDF color divergence (preamble.tex not consuming tokens automatically) becomes a source of drift, evaluate a token-to-LaTeX compilation step using Style Dictionary or a custom script.
- If the portfolio has more than 3 distinct brands, evaluate whether the `!default` overlay pattern remains manageable or whether a more formal theming system is needed.
