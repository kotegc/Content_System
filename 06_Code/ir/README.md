# Intermediate Representation (IR)

The format-neutral document tree that sits between the content store and all renderers.

## Files

| File | Purpose |
|---|---|
| `schema.ts` | TypeScript interfaces for `IRDocument` and all block types |
| `transformer/sanity-to-ir.js` | Converts a Sanity GROQ response to `IRDocument` |
| `transformer/package.json` | Module manifest for the transformer |

## Why This Exists

Without an IR, every renderer is directly coupled to Sanity's internal data format (`_type`, `_key`, Portable Text structure, `asset->url` dereferencing). If the Sanity schema changes, every renderer breaks.

The IR is a stable contract. Sanity schema changes are absorbed by the transformer. Renderers only need to understand the IR.

```
Sanity schema changes  →  update transformer only
Renderer changes       →  update renderer only
New renderer           →  implement IR consumer; no other changes
```

## IRDocument Shape

```typescript
{
  schemaVersion: "1.0.0",
  documentType: "project" | "post" | "report" | "presentation" | "proposal" | "notebook",
  metadata: {
    title, slug, publishedAt?, author?, tags?, hook?, abstract?, coverImage?
  },
  blocks: IRBlock[]  // discriminated union on `type` field
}
```

## Block Types

All 19 block types are in `../blocks/block-registry.json`. The IR `type` field uses camelCase (e.g., `testResult`), which differs from Sanity's `_type` (e.g., `testResultBlock`). The transformer handles the mapping.

### Renderer-dependent blocks

Blocks that cannot be rendered in all formats carry a `fallback` field:

```typescript
{
  type: 'model3d',
  modelUrl: 'https://cdn.sanity.io/...',
  caption: 'Flight controller assembly',
  fallback: {
    type: 'omit'   // or 'image' (with src/alt) or 'caption'
  }
}
```

Renderers check `fallback.type` to decide how to handle the block when they cannot render it natively.

## Using the Transformer

### Install as submodule (no npm required)

```js
import { transformDocument } from './system/06_Code/ir/transformer/sanity-to-ir.js';
```

### Example GROQ query

The transformer expects asset references to be resolved in the GROQ projection:

```groq
*[_type == "project" && slug.current == $slug][0]{
  _type,
  title,
  "slug": slug.current,
  publishedAt,
  "author": author->name,
  "tags": tags[]->{ title, "slug": slug.current },
  "coverImage": { "url": coverImage.asset->url, "alt": coverImage.alt },
  contentBlocks[]{
    _type,
    // textBlock
    content,
    // imageBlock
    "imageUrl": image.asset->url, "alt": image.alt, title, text, textSide,
    // imageGridBlock
    "images": images[]{ "url": asset->url, alt, label }, columns, caption,
    // model3DBlock
    "modelUrl": modelFile.asset->url, caption,
    // htmlBlock
    "htmlUrl": htmlFile.asset->url, caption,
    // plotlyBlock
    chartJSON, caption,
    // dynaGridBlock
    "items": items[]{ "imageUrl": image.asset->url, "alt": image.alt, x, y, w, h },
    title, text, textSide,
    // projectBioBlock
    projectTitle, abstract, roles,
    "contributors": contributors[]{ name, role },
    // contentCardsBlock
    "cards": cards[]{ title, "imageUrl": image.asset->url, "imageAlt": image.alt, bullets },
    layout, singleRow
  }
}
```

### Usage in Astro (Phase 5 migration)

```js
// src/lib/ir.js
import { createClient } from '@sanity/client';
import { transformDocument } from 'system/06_Code/ir/transformer/sanity-to-ir.js';

const client = createClient({ /* config */ });

export async function getProjectIR(slug) {
  const doc = await client.fetch(PROJECT_QUERY, { slug });
  return transformDocument(doc);
}
```

## Adding a New Block Type

1. Add the block entry to `../blocks/block-registry.json`
2. Add the TypeScript interface to `schema.ts` and add it to the `IRBlock` union
3. Add a `case` to `transformer/sanity-to-ir.js`
4. Add the Sanity schema object in the portfolio repo
5. Add an Astro renderer component in the portfolio repo

Follow the same `type` naming convention: camelCase IR type, `typeBlock` Sanity `_type`.

## Schema Versioning

`IR_SCHEMA_VERSION` in `schema.ts` and in `sanity-to-ir.js` must stay in sync.

Increment the version when the `IRDocument` shape changes in a way that breaks existing consumers. Consumers should validate `irDoc.schemaVersion` on ingest and reject documents with unexpected versions.
