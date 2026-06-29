# ADR-007: Block Taxonomy Unification

## Status
Accepted

## Date
2026-06-29

## Context

The two predecessor systems had separate and incompatible block vocabularies:

**Portfolio blocks (media-focused, 9 types):**
`textBlock`, `imageBlock`, `imageGridBlock`, `model3DBlock`, `htmlBlock`, `plotlyBlock`, `dynaGridBlock`, `projectBioBlock`, `contentCardsBlock`

**Publisher blocks (engineering reasoning, 8 types):**
`decision`, `requirement`, `test-result`, `warning`, `note`, `assumption`, `risk`, `design-decision`

The question was how to handle the fact that a complete engineering case study needs blocks from *both* vocabularies. A project document might contain 3D model renders (`model3DBlock`), a design decision log (`decisionBlock`), test result summaries (`testResultBlock`), and interactive charts (`plotlyBlock`).

## Decision

Unify both vocabularies into a single block registry of 19 block types, organized by category. The vocabularies are recognized as **complementary, not competing** — they address entirely different content dimensions. No blocks were eliminated; both complete vocabularies are preserved in the unified registry.

**Unified categories:**

| Category | Block types | Origin |
|---|---|---|
| Content | `text`, `image`, `imageGrid`, `model3d`, `html`, `plotly`, `dynaGrid` | portfolio |
| Meta | `projectBio`, `contentCards` | portfolio |
| Structure | `gallery` | unified |
| Math | `math` | unified |
| Reasoning | `decision`, `requirement`, `testResult`, `warning`, `note`, `assumption`, `risk`, `designDecision` | publisher |

**Naming convention:**
- Registry keys and IR `type` fields: `camelCase` (e.g., `testResult`)
- Sanity `_type` fields: `camelCase` + `Block` suffix (e.g., `testResultBlock`)
- Publisher Lua filter classes: `kebab-case` (e.g., `eng-test-result`)
- The transformer handles all name mapping; no consumer sees multiple naming conventions simultaneously.

The canonical source for the taxonomy is `blocks/block-registry.json`, which defines for each block type: its category, description, origin, field schema, and renderer fallback policy across web, PDF, Reveal.js, and Markdown.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **Choose one vocabulary** | Keeping only portfolio blocks means documents cannot include engineering reasoning. Keeping only Publisher blocks means documents cannot include 3D models, interactive charts, or image grids. Both options impoverish the content system relative to what either predecessor could already do. |
| **Maintain two separate registries** | A portfolio registry and a publisher registry that coexist. Every consumer that handles both types of content must know about both registries. The IR would have two separate block union types. Complexity increases at every renderer without any architectural benefit, since the vocabularies do not conflict. |
| **Namespace prefixes** | `portfolio:imageBlock`, `publisher:decisionBlock`. Adds syntactic overhead and requires namespace-stripping at every consumer. Solves a collision problem that does not exist — the two vocabularies have no overlapping names. |
| **Translate between vocabularies at render time** | Allow each system to keep its own vocabulary and translate at the renderer boundary. Creates a mapping layer in every renderer that must be kept in sync as both vocabularies evolve. More complexity at more locations than a single unified registry. |

## Consequences

**Positive:**
- A document in Sanity can contain both an image grid and a design decision log in the same content block array. The vocabularies combine naturally.
- The block registry (`block-registry.json`) is the single source of truth for what block types exist, what fields they have, and how they fall back across renderers.
- The IR block union (`IRBlock` in `schema.ts`) covers all 19 types. A renderer that implements the full IR contract handles all content.
- Adding a new block type is a single, well-defined operation: add to registry, add to IR schema, add to transformer, add to Sanity schema, add renderer component(s).

**Negative (known tradeoffs):**
- The Sanity schema currently only defines the 9 portfolio blocks. The 8 Publisher reasoning blocks and 2 unified blocks (`math`, `gallery`) must be added to Sanity schemas before they can be authored in Studio. This is Phase 3 of the migration plan.
- The Astro portfolio renderer currently has no components for the 8 reasoning blocks. These must be built in Phase 3.
- The Publisher's Lua filter (`semantic-blocks.lua`) uses `kebab-case` class names that differ from the registry's `camelCase` keys. The transformer handles the mapping. If new reasoning blocks are added, both the registry and the Lua filter must be updated consistently.

**Neutral:**
- The 2 "unified" blocks (`math`, `gallery`) are not strictly new — math notation existed implicitly via LaTeX in the Publisher, and the Publisher had a gallery Lua filter. They are formalized as first-class block types in the unified taxonomy.
- Publisher reasoning blocks carry a `content` field that is Portable Text when authored in Sanity, but a plain string when derived from a Quarto `.qmd` source. The transformer and renderers handle both forms.

## Signals to Revisit

- If a block type is added that cannot be represented in a format-neutral IR form — that is, it inherently carries renderer-specific information — it should remain renderer-specific and not enter the shared registry. The registry defines blocks that all renderers must acknowledge, even if via fallback.
- If the registry exceeds ~30 block types, evaluate whether some blocks should be grouped into compound types (e.g., a `figureBlock` that wraps image + caption + optional 3D model) to reduce combinatorial complexity at renderers.
- If the Publisher's Lua filter class naming (`eng-decision`, `eng-test-result`) diverges significantly from the registry keys, consider aligning them in a major Publisher release to reduce the mapping surface.
