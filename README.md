# Content System

Paralia's shared design-token and UI-component system: brand-level design tokens (colors, type, spacing) and a small library of framework-agnostic web components/CSS classes built on top of them. Consumed by other repos (`PAR-2026_PARALIA`, `My_Portfolio`, `Publisher`, and future ones) as a git submodule at `06_Code/content-system` (or `06_Code/system`, depending on the consumer).

**This repo is the canonical source.** If you're looking at this file from inside a consumer repo's submodule checkout, you're reading a read-only copy — go to the standalone `SYS-2026_CONTENT_SYSTEM` checkout to make any edit. See [`06_Code/components/README.md`](06_Code/components/README.md#workflow) for the full workflow: how to add a component or brand, how to compile, where to push from, and what happens after (an automated PR bumps each consumer's submodule pointer — you still merge it yourself).

## Where things live

    06_Code/
      tokens/            — brand design tokens (tokens/brands/{brand}.json, {brand}-components.json)
                            + the compiler (tokens/compile.js) and its output (tokens/brands/compiled/)
      components/        — the component library (CSS classes + web components) and its README
      decisions/          — architecture decision records (ADR-001 onward)
      assets/            — brand image assets (icons, favicons, etc.)

`01_Docs/`, `02_CAD_Working/`, `03_CAD_Release/`, `04_ID/`, `05_Notes/` are leftover scaffolding from the client-project template this repo was created from — this project has no CAD/ID deliverables, so they're unused. `06_Code/` is where everything real lives.

## Start here

- Adding/using a component or editing brand values: [`06_Code/components/README.md`](06_Code/components/README.md)
- Bootstrapping a new brand from scratch: [`06_Code/tokens/_starter/README.md`](06_Code/tokens/_starter/README.md)
- Why git submodules (and their tradeoffs): [`06_Code/decisions/ADR-005-git-submodules.md`](06_Code/decisions/ADR-005-git-submodules.md)
