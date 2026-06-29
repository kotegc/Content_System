# Blocks

The canonical block type registry for the unified content system.

## File

`block-registry.json` — the authoritative list of all block types, their fields, and their renderer fallback policies.

## Purpose

This registry serves two functions:

1. **Human reference** — when adding a new block type to a Sanity schema, Astro component, or Quarto Lua filter, consult this file to ensure consistent naming and field structure.

2. **Machine-readable spec** — renderers and tooling can read this JSON to understand what block types exist and how to handle them in different output formats.

## Block Categories

| Category | Description |
|---|---|
| `content` | General content — text, images, charts, 3D models |
| `reasoning` | Engineering reasoning — decisions, requirements, tests, warnings |
| `structure` | Layout primitives — grids, galleries, card collections |
| `meta` | Document metadata — project bio, team info |

## Block Origins

| Origin | Meaning |
|---|---|
| `portfolio` | Originated in MYP-2026_MY_PORTFOLIO (Sanity/Astro) |
| `publisher` | Originated in PUB_2026_PUBLISHER (Quarto/Lua) |
| `unified` | Designed for both systems simultaneously |

## Renderer Fallback Policy

Blocks with `origin: "portfolio"` and web-native rendering require fallbacks for non-web renderers. The fallback field in each block's `rendererFallback` entry specifies the behavior:

| Policy | Behavior |
|---|---|
| `full` | Full rendering — no fallback needed |
| `static-image` | Replace with a static image (must be in `fallback.src`) |
| `linearized` | Items rendered sequentially, no special layout |
| `caption` | Caption field only, media omitted |
| `inline` | Simple inline text (e.g. `> **Decision:** ...` in Markdown) |
| `omit` | Block not rendered in this format |

## Adding a New Block Type

1. Add an entry to `block-registry.json` following the existing pattern
2. Add the corresponding Sanity schema object in the portfolio repo
3. Add an Astro renderer component in the portfolio repo
4. Add a Lua filter entry in the publisher repo (for reasoning/structure blocks)
5. Add TypeScript interfaces to `ir/schema.ts`
6. Add a case to `ir/transformer/sanity-to-ir.js`

Naming convention: camelCase for registry keys (e.g., `testResult`), matching the IR `type` field. The `sanityType` field records the Sanity `_type` string (e.g., `testResultBlock`).
