# ADR-001: Four-Layer Content Architecture

## Status
Accepted

## Date
2026-06-29

## Context

Two repositories existed that independently implemented the same core idea — separating content from its presentation — but using incompatible mechanisms and incompatible vocabularies.

`MYP-2026_MY_PORTFOLIO` used Sanity as a headless CMS with structured block types authored in Studio and rendered by Astro at build time. Its output was HTML only.

`PUB_2026_PUBLISHER` used Quarto with Markdown source files, Lua filters for semantic block transformation, SCSS for styling, and LaTeX for PDF output. Its content lived entirely in `.qmd` files and could produce HTML, PDF, Reveal.js, and PPTX from a single source.

The goal was to unify these into a system where a single piece of content — a project case study, a technical report — could be authored once and rendered in any format for any brand. The question was how to do that without destroying what already worked in either system.

Several forces were in tension:

- The portfolio website was already deployed and depended on Sanity as its content store. Migrating away from Sanity would require rebuilding the editorial workflow and the Astro data layer simultaneously.
- The Publisher's Quarto/LaTeX/SCSS stack was carefully tuned for high-quality PDF and slide output. Moving to a web-first toolchain would degrade that output.
- Both systems used fundamentally different block vocabularies. The portfolio had media blocks (image, 3D model, interactive chart). The Publisher had engineering reasoning blocks (decision, requirement, test result). They were not competing — they were complementary.

A simple choice between the two systems would have required abandoning one vocabulary entirely.

## Decision

Adopt a four-layer architecture:

```
Layer 1 — Content (Semantic Data)
    Sanity as the system of record. Pure semantic meaning, no format hints.

Layer 2 — Document Schema (Composition Rules)
    Formal definitions of what block types exist and what documents can contain.
    Lives in Sanity schemas (enforced at authoring time) and block-registry.json.

Layer 3 — Intermediate Representation (IR)
    A format-neutral JSON document tree produced from Sanity by a build-time
    transformer. This is the contract between the content store and all renderers.

Layer 4 — Renderer + Brand
    Each renderer consumes the IR and applies a Brand Configuration to produce
    output. Brand is a parameter of the renderer invocation, not a content field.
```

Brand is explicitly a parameter of Layer 4, not a peer layer. A single IR document must be renderable with any brand without touching the content.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Keep both systems independent | Solves no problem. Content authored for the website cannot become a PDF. Tokens, macros, and block definitions continue to diverge. |
| Make the Publisher the system of record | Would require building editorial UI, asset management, content versioning, and draft workflows that Sanity already provides. Quarto `.qmd` files are not a suitable authoring interface for non-technical content. |
| Make the website the system of record and generate `.qmd` from Sanity directly | Couples Quarto to Sanity's wire format. Every Sanity schema change would break Quarto render. The IR exists to prevent exactly this coupling. |
| Merge both into a monorepo | Collapses independent deployment histories. The portfolio has an existing remote and deployment pipeline that would require restructuring. Does not solve the content-format coupling problem; only solves the file-sharing problem. |

## Consequences

**Positive:**
- Any content authored once in Sanity can be rendered by any renderer that implements an IR consumer.
- Sanity schema changes are absorbed by the IR transformer. Renderers are insulated.
- Adding a new renderer (epub, README, a third brand's website) requires only implementing an IR consumer and a brand config — no changes to content or the other renderers.
- The block vocabularies from both systems are unified rather than competing.

**Negative (known tradeoffs):**
- Every new block type requires changes in four places: Sanity schema, IR schema, IR transformer, and each renderer. This is intentional overhead; it prevents ad-hoc block additions that don't have a defined behavior across formats.
- The IR introduces a build step between authoring and rendering. There is no longer a direct Sanity → HTML path.
- The architecture is more complex than either predecessor system on its own.

**Neutral:**
- The Publisher changes role: from a content store (`.qmd` source files) to a renderer (Quarto infrastructure that consumes IR). Its Lua filters, SCSS, and LaTeX preamble remain in place; only how it receives content changes.

## Signals to Revisit

- If the IR transformer becomes a maintenance bottleneck — requiring changes too frequently to be sustainable — consider whether the block taxonomy has grown too large or whether the abstraction boundary is wrong.
- If a renderer emerges that can consume Sanity natively and reliably (a first-party Sanity-to-PDF tool, for example), the IR may be redundant for that specific path. Evaluate per renderer, not globally.
- If the four-layer model is found to have a fifth necessary layer (e.g., a content assembly layer that composes multi-source documents), revisit the layer definitions before adding it implicitly.
