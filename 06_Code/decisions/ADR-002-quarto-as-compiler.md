# ADR-002: Quarto as Document Compiler

## Status
Accepted

## Date
2026-06-29

## Context

The goal of this infrastructure is to produce beautiful, publication-quality documentation — technical reports, proposals, slide decks — with the reliability and repeatability of a professional desktop publishing application. The authoring experience should be close to writing: plain text with minimal markup, no manual layout work. The output should be indistinguishable from professionally typeset material.

The system must support at minimum: PDF (for technical reports and proposals), HTML (for web publication), and Reveal.js (for slide presentations), all from a single source document.

The Publisher toolkit (`PUB_2026_PUBLISHER`) already existed and used Quarto. The question was whether Quarto was the right foundation to commit to for the long term, or whether a different compiler should replace it.

## Decision

Quarto, built on Pandoc and LaTeX, is the document compiler for the content system's document output pipeline.

- **Authoring format:** Quarto Markdown (`.qmd`) — a superset of Pandoc Markdown with executable code cell support
- **Multi-format output:** HTML, PDF (via LaTeX), Reveal.js, PPTX from a single source
- **Styling:** Dart Sass / SCSS for HTML and slides; LaTeX packages for PDF
- **Semantic block extension:** Pandoc Lua filters (`.lua`) transform custom div syntax (`::: {.decision}`) into styled output
- **Math:** LaTeX notation, rendered by MathJax (HTML) and LaTeX (PDF)

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| **LaTeX directly** | Exceptional PDF quality, but no Markdown authoring — authors write in LaTeX syntax. No HTML or slides output without separate tooling. High learning curve. Not appropriate for the primary authoring interface. |
| **Typst** | Modern, fast, beautiful PDF output, Markdown-like syntax, no LaTeX dependency. However: released in 2023, ecosystem is immature, no native Reveal.js output, limited Lua filter equivalent, no established path to multi-format output from one source. Worth monitoring — if it reaches feature parity, it becomes the preferred LaTeX replacement for PDF. |
| **Pandoc directly** | Quarto is built on Pandoc. Using Pandoc directly loses Quarto's project system (multi-file documents, shared `_quarto.yml`), execution engine (code cells), and format management. There is no benefit to bypassing Quarto for this use case. |
| **Microsoft Word** | No version control (binary format), no programmatic generation, cannot produce slides or web output from the same source, layout is manual. Does not compose with a build pipeline. Rejected categorically. |
| **Adobe InDesign** | Exceptional print and layout output. Binary proprietary format, no version control, no automation, requires designer expertise for every document. A tool for professional designers producing fixed-layout publications, not for an engineer producing reproducible technical documents. Rejected categorically. |
| **Markdown + custom pipeline** | Build a custom Pandoc pipeline without Quarto. More control, but Quarto provides multi-format output management, a project system, and active maintenance for free. Custom pipelines require maintenance that Quarto absorbs. |

## Consequences

**Positive:**
- Source files are plain text (`.qmd`). They are readable in any text editor, version-controllable in git, and will not become unreadable due to format changes. A `.qmd` file written today will be readable in 20 years.
- Pandoc has been in active development since 2006. It is foundational infrastructure for academic publishing. It is not going away.
- Quarto is maintained by Posit (formerly RStudio), a well-funded company whose core business depends on document publishing tooling. It is open source.
- Multi-format output from one source is a first-class feature, not an afterthought.
- The Lua filter system (used for semantic blocks) is Pandoc's native extension mechanism. It is stable and well-documented.

**Negative (known tradeoffs):**
- LaTeX is a heavy dependency: a full TeX distribution (MiKTeX or TeX Live) is 4–8 GB and has a complex installer. PDF compilation is slower than HTML rendering.
- Quarto itself is relatively new (2022). Long-term stability is probable but not yet proven at a 20-year timescale. The underlying Pandoc is far more proven.
- SCSS compilation requires Dart Sass, which Quarto ships with — but this is an additional runtime dependency that must be present.
- Font installation for high-quality output (IBM Plex Sans, Grotesky, Topaz) is a manual step not enforced by any tooling.

**Neutral:**
- The Reveal.js output uses a browser-based presentation engine. Presentations require a browser to display, not a PDF viewer. This is appropriate for the use case.

## Signals to Revisit

- If Posit discontinues Quarto or significantly changes its direction, evaluate whether Pandoc alone (without Quarto's project layer) remains sufficient, or whether Typst has matured to cover the use case.
- If Typst releases stable multi-format output (HTML + PDF + slides from one source) with a mature ecosystem, evaluate it as a LaTeX replacement for the PDF path. Typst's compilation speed and modern syntax are genuine advantages.
- Revisit annually. The document tooling landscape is changing faster than it has in decades.
