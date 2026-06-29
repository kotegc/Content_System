# Architectural Decision Records

This directory contains Architectural Decision Records (ADRs) for the Content System and its consumers.

## What is an ADR?

An ADR is a short document that captures a significant decision: why it was needed, what was decided, what alternatives were rejected and why, and what the consequences are. It is written at the time the decision is made (or shortly after) and is never deleted — only superseded.

The purpose is not to justify decisions after the fact. It is to make the reasoning legible to anyone who reads the code later — including your future self — without requiring them to have been present when the decision was made. A codebase without ADRs contains hundreds of decisions that look arbitrary because the reasoning was never written down.

## When to write an ADR

Write an ADR for any decision that:
- Affects how all consumers interact with the system (a change to the IR schema, the token architecture, the block registry)
- Involves a meaningful tradeoff between alternatives
- Would be difficult to reverse later
- Would surprise a new reader of the code

Do not write an ADR for routine implementation details, bug fixes, or decisions that follow obviously from the architecture already in place.

## File naming

```
ADR-NNN-short-descriptive-title.md
```

Numbers are assigned in sequence and never reused. Pad to three digits.

## Status values

| Status | Meaning |
|---|---|
| `Proposed` | Under discussion, not yet adopted |
| `Accepted` | The current approach |
| `Deprecated` | No longer the approach, but kept for historical context |
| `Superseded by ADR-NNN` | Replaced by a later decision |

## Index

| ADR | Title | Status |
|---|---|---|
| [ADR-001](ADR-001-content-architecture.md) | Four-Layer Content Architecture | Accepted |
| [ADR-002](ADR-002-quarto-as-compiler.md) | Quarto as Document Compiler | Accepted |
| [ADR-003](ADR-003-sanity-as-content-store.md) | Sanity as Content Store | Accepted |
| [ADR-004](ADR-004-scss-design-tokens.md) | SCSS Variables as Design Token System | Accepted |
| [ADR-005](ADR-005-git-submodules.md) | Git Submodules as Sharing Mechanism | Accepted |
| [ADR-006](ADR-006-intermediate-representation.md) | Intermediate Representation Design | Accepted |
| [ADR-007](ADR-007-block-taxonomy.md) | Block Taxonomy Unification | Accepted |
