# ADR-006: Intermediate Representation Design

## Status
Accepted

## Date
2026-06-29

## Context

The four-layer architecture (ADR-001) requires a format-neutral document tree — an Intermediate Representation (IR) — that sits between the content store (Sanity) and all renderers (Astro, Quarto, future).

The IR must satisfy several properties:

- **Format-neutral:** The IR must not contain layout hints, color references, or format-specific markup. A block in the IR describes *what it means*, not *how it looks*.
- **Renderer-independent:** Any renderer must be able to consume the IR without knowing anything about Sanity's internal data format.
- **Self-describing:** The IR must carry enough information to identify the document type, metadata, and all block types without external lookups.
- **Stable:** The IR schema is a contract between the transformer and all renderers. Changes that break existing consumers must be versioned.

The key question was what format and schema to use for the IR, and specifically how to handle blocks that cannot be rendered in all formats (e.g., interactive 3D models in a PDF).

## Decision

A typed JSON document tree with a versioned schema defined in TypeScript interfaces (`ir/schema.ts`).

**Top-level envelope:**
```typescript
interface IRDocument {
  schemaVersion: string;       // "1.0.0" — semver, bump on breaking changes
  documentType: IRDocumentType; // "project" | "post" | "report" | ...
  metadata: IRMetadata;
  blocks: IRBlock[];
}
```

**Blocks** are a discriminated union on the `type` field (e.g., `{ type: "image", ... }`, `{ type: "decision", ... }`). Each block type has a defined TypeScript interface in `schema.ts`.

**Renderer-dependent blocks** carry a `fallback` field that specifies the fallback behavior for renderers that cannot natively render the block:
```typescript
interface IRFallback {
  type: "image" | "caption" | "omit";
  src?: string;
  alt?: string;
  caption?: string;
}
```
The fallback is determined by the IR transformer, not the renderer. Each renderer checks `fallback.type` and applies it if it cannot render the block natively.

**Asset references** are fully resolved CDN URLs in the IR — not Sanity internal `asset->_ref` references. The transformer resolves all references via the GROQ projection before writing the IR.

**Math notation** is carried as LaTeX source strings: `{ type: "math", notation: "latex", source: "\\frac{d}{dt}...", display: "block" }`. Renderers convert from LaTeX as appropriate (MathJax for HTML, native LaTeX for PDF).

The transformer lives at `ir/transformer/sanity-to-ir.js` and exports:
- `transformDocument(sanityDoc) → IRDocument`
- `transformDocuments(sanityDocs[]) → IRDocument[]`

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **No IR — render directly from Sanity format** | Simplest immediate path. Every renderer receives the raw GROQ response and maps Sanity `_type` fields to output. However: any Sanity schema change (renaming a field, changing a block type) requires updating every renderer simultaneously. A new renderer must understand Sanity's internal format. The systems are permanently coupled. Rejected because it defeats the purpose of ADR-001. |
| **Use Portable Text as the IR** | Sanity's rich text format is already a structured tree, and it is the format in which text content arrives from the CMS. However: Portable Text is designed for rich text paragraphs, not block-level document structure. Engineering reasoning blocks, metadata, and structured fields (chart JSON, model URLs) do not fit naturally in a Portable Text schema. Portable Text is also Sanity-specific — a future content source that is not Sanity would need to emit Portable Text, which is an unnecessary constraint. |
| **Use CommonMark (Markdown) as the IR** | Universal, human-readable, renderable by almost anything. However: loses all structured block semantics. A `decisionBlock` with a machine-readable `status` field becomes a blockquote with no distinguishable identity. An `imageGridBlock` with column count and per-image metadata becomes a flat list of images. The IR would not be able to carry the block taxonomy defined in ADR-007. |
| **Use JSON-LD or RDF** | Highly structured, semantically rich, machine-readable. However: significant tooling overhead, no native support in Quarto or Astro, and the semantic richness is not needed for this use case. Over-engineered. |

## Consequences

**Positive:**
- Sanity schema changes only require updating the transformer (`sanity-to-ir.js`). All renderers continue to consume the same IR format.
- A new renderer requires only implementing an IR consumer — no Sanity knowledge, no GROQ, no Portable Text parsing.
- TypeScript interfaces (`schema.ts`) serve as formal documentation of the IR contract. Any TypeScript consumer gets type-checking for free.
- `schemaVersion` enables consumers to detect incompatible IR versions and fail clearly rather than silently misinterpreting fields.

**Negative (known tradeoffs):**
- Every new block type requires changes in four places: Sanity schema, `block-registry.json`, `ir/schema.ts`, and `ir/transformer/sanity-to-ir.js`. This is intentional — it prevents block types from being added without defining their IR representation and fallback behavior.
- Portable Text arrays (Sanity's rich text format for `textBlock` content) are currently passed through the IR as-is. Each renderer must interpret Portable Text. This is a known partial decoupling — the transformer absorbs all other Sanity-specific formats, but Portable Text interpretation remains in each renderer.
- The IR introduces a build step. Content cannot be rendered without running the transformer first.
- **Current status:** The IR schema and transformer are complete. However, Astro does not yet consume the IR — it still reads directly from Sanity (Phase 5 of the migration plan). The IR is currently the forward-looking contract, not yet the active data flow.

**Neutral:**
- `schemaVersion` uses semantic versioning. A PATCH bump indicates a non-breaking additive change (new optional field). A MINOR bump indicates a new block type. A MAJOR bump indicates a breaking change to existing block interfaces. Consumers should validate the major version on ingest.

## Signals to Revisit

- If the IR accumulates layout hints, color values, or format-specific fields (e.g., `pdfWidth`, `webLayout`), it has been corrupted. The IR must carry only semantic meaning. Audit and remove such fields when found.
- If Portable Text interpretation complexity becomes a burden across multiple renderers, absorb it in the transformer: convert Portable Text to a renderer-neutral rich text format (e.g., a simplified block array of `{ type: "paragraph", children: [{ text: "...", marks: ["bold"] }] }`) as part of the IR `textBlock` representation.
- If the IR schema needs to support a non-Sanity content source (a second CMS, generated content from a CAD tool), add a second transformer for that source. The IR itself does not change.
