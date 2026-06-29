# ADR-003: Sanity as Content Store

## Status
Accepted

## Date
2026-06-29

## Context

The content system needs a place where content is authored and stored. This store must satisfy several requirements:

- Structured content model — block types with defined fields, not freeform text
- An authoring UI that does not require technical expertise to use
- Asset management (images, 3D model files, HTML embeds)
- Version history and draft workflows
- An API that can be queried at build time by any renderer
- A schema that is formally defined and version-controlled

The portfolio website (`MYP-2026_MY_PORTFOLIO`) was already using Sanity as its content store. The question was whether this was the right foundation to formalize and extend for the broader content system, or whether a different store should be adopted.

## Decision

Sanity (headless CMS with Studio + GROQ + CDN) is the content store and system of record for all authored content.

- **Authoring UI:** Sanity Studio (web-based, runs locally or hosted)
- **Query language:** GROQ (Graph-Relational Object Queries) — Sanity's native query language
- **Asset pipeline:** Sanity CDN — images, files, and 3D models are stored and served by Sanity
- **Schema:** Defined in TypeScript in the portfolio repo (`sanity/schemas/`), version-controlled in git
- **Content format:** Portable Text for rich text blocks, structured object fields for all other block types

Sanity is the **system of record**, meaning: when Sanity and any other representation of the content disagree, Sanity wins. All other representations (IR, generated `.qmd` files) are derived from Sanity at build time.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **Local Markdown files** | Version-controlled, no external dependency, readable in any editor. However: no structured schema enforcement, no editorial UI, no asset management, no draft workflow. Appropriate for a blog; not appropriate for structured block content with mixed media. |
| **Contentful** | Mature, widely used, good editorial UI. However: expensive at scale (the free tier is restrictive for a multi-project content system), proprietary query language (CDA), less flexible content modeling than Sanity. |
| **Notion API** | Excellent authoring experience for the author. However: Notion's API is designed for Notion's own interface, not as a content infrastructure layer. Block types are Notion-specific and not portable. API stability is low — it has changed significantly between versions. Rejected as an infrastructure dependency. |
| **Git-based CMS (Decap/Netlify CMS, Tina)** | Content lives in git, no external cloud dependency, editorial UI available. However: structured block content with mixed media is difficult to model, asset management is limited, and the editorial UI is significantly less capable than Sanity Studio. |
| **Storyblok, Prismic** | Viable alternatives to Sanity. Not adopted because Sanity was already in place, its schema system is more flexible, and GROQ is more expressive than REST-based query APIs. |

## Consequences

**Positive:**
- Formal TypeScript schema definitions with validation are enforced at authoring time in Studio.
- GROQ is highly expressive — projections, references, conditionals, and joins in a single query. This eliminates the N+1 query problem common in REST-based CMSes.
- Sanity's CDN serves assets reliably. The portfolio website references CDN URLs; those URLs are stable even if the Sanity project is migrated.
- Draft workflows allow content to be authored and reviewed before publishing. The portfolio already uses this.

**Negative (known tradeoffs):**
- External cloud dependency. If Sanity's service is unavailable, the authoring workflow is interrupted. (Rendered output is unaffected once built — it does not depend on Sanity at runtime.)
- Content lives in Sanity's cloud, not locally. Without an explicit export/backup strategy, a project deletion or a Sanity pricing change could make content inaccessible. See `RELIABILITY.md` Gap 6.
- Sanity's free tier has dataset and API call limits. As the content volume grows, this may require a paid plan.
- Portable Text (Sanity's rich text format) is Sanity-specific. The IR transformer must convert it to a renderer-neutral form for non-Sanity consumers. Currently, Portable Text arrays are passed through the IR as-is; each renderer is responsible for interpreting them.

**Neutral:**
- GROQ queries are the contract between the content store and the IR transformer. Changes to GROQ queries require updating the transformer, not the Sanity schema. This boundary is well-defined.

## Signals to Revisit

- If Sanity's pricing changes in a way that makes the free tier unworkable and a paid plan is not justified by usage, evaluate migration to a self-hosted alternative (Directus, Strapi) or a git-based CMS.
- If Portable Text becomes a meaningful burden on renderer implementations (requiring significant per-renderer interpretation logic), evaluate defining a richer IR text format that absorbs this complexity in the transformer.
- If content volume grows to the point where build-time GROQ queries are slow, evaluate Sanity's Content Lake API caching or a local content cache layer.
