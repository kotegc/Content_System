# Adding a New Block Type

A "block" is a content unit that can be placed in a Sanity document, flows through the
IR layer, and renders in the Portfolio and/or Publisher output. Follow all steps below —
missing any one will cause silent failures or authoring gaps.

---

## Overview: 7 steps across 3 repos

| Step | File | Repo |
|------|------|------|
| 1. Register block | `blocks/block-registry.json` | Content System |
| 2. Add IR interface | `ir/schema.ts` | Content System |
| 3. Add transformer case | `ir/transformer/sanity-to-ir.js` | Content System |
| 4. Create Sanity schema | `sanity/schemaTypes/blocks/{name}Block.js` | Content System |
| 5. Register in Studio | `sanity/schemaTypes/index.js` + document types | Content System |
| 6. Portfolio renderer | `astro/src/components/IRBlockRenderer.astro` | Portfolio |
| 7. Publisher renderer | Quarto Lua filter | Publisher |

---

## Step 1 — Register in block-registry.json

Add an entry to `blocks/block-registry.json` under `"blocks"`:

```json
"myBlock": {
  "label": "My Block",
  "category": "content",
  "description": "What this block does.",
  "origin": "unified",
  "sanityType": "myBlock",
  "quartoEquivalent": "::: {.my-block}",
  "fields": {
    "title":   { "type": "string", "required": false },
    "content": { "type": "array", "items": "PortableTextBlock", "required": true }
  },
  "rendererFallback": {
    "web":      "full",
    "pdf":      "full",
    "revealjs": "full",
    "markdown": "inline"
  }
}
```

Set `"origin"` to `"portfolio"`, `"publisher"`, or `"unified"` depending on where the
block will be used.

---

## Step 2 — Add IR TypeScript interface

In `ir/schema.ts`, add the interface and include it in the `IRBlock` union:

```typescript
export interface IRMyBlock {
  type: 'myBlock';
  title?: string;
  content: PortableTextBlock[];
}

// Add to the IRBlock union:
export type IRBlock =
  | IRTextBlock
  | ...
  | IRMyBlock;   // ← add here
```

---

## Step 3 — Add transformer case

**CRITICAL: If you skip this step, the block is silently dropped.**

In `ir/transformer/sanity-to-ir.js`, add a case inside `transformBlock()`:

```js
case 'myBlock':
  return {
    type:    'myBlock',
    title:   block.title,
    content: block.content ?? [],
  };
```

Also add the fields to the GROQ query comment at the top of the file, and add to the
GROQ query in `generate-doc.js` (Publisher) and `api.js` (Portfolio) if the block has
asset references that need resolving (e.g., `asset->url`).

**Test:** After adding the case, author a document with the new block in Studio, run the
Publisher, and confirm the block appears in the output. If it doesn't, check the console
for `[sanity-to-ir] Unknown block type` errors.

After changing `sanity-to-ir.js`, sync the vendored copy in the Portfolio:
```powershell
# from astro/ directory:
npm run sync-ir
```

---

## Step 4 — Create Sanity schema file

Create `sanity/schemaTypes/blocks/myBlock.js`:

```js
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'myBlock',
  title: 'My Block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: `📦 ${title ?? 'My Block'}`}
    },
  },
})
```

Field names must exactly match what the transformer reads in Step 3.

---

## Step 5 — Register in Studio

**5a.** In `sanity/schemaTypes/index.js`, add the import and the export:

```js
import myBlock from './blocks/myBlock'

export const schemaTypes = [
  // ... existing types
  myBlock,
]
```

**5b.** In `sanity/schemaTypes/project.js` and/or `post.js`, add to the `contentBlocks`
array:

```js
{type: 'myBlock'},
```

Forgetting 5b means the block type exists in the schema but can't be placed in any
document. It won't appear in the block picker.

---

## Step 6 — Portfolio renderer (if the block should render on the website)

In `astro/src/components/IRBlockRenderer.astro`, add a branch for the new type. Follow
the existing pattern for similar blocks.

---

## Step 7 — Publisher renderer (if the block should appear in PDF/HTML/PPTX/Reveal.js)

In the Publisher's `components/semantic-blocks.lua` (or `gallery.lua`), add a Lua filter
case for the new Quarto div class. Follow the existing pattern for reasoning blocks.

---

## Checklist

- [ ] `block-registry.json` — new entry
- [ ] `ir/schema.ts` — new interface + added to `IRBlock` union
- [ ] `ir/transformer/sanity-to-ir.js` — new `case` in `transformBlock()`
- [ ] `sanity/schemaTypes/blocks/{name}Block.js` — new schema file
- [ ] `sanity/schemaTypes/index.js` — import + export
- [ ] `sanity/schemaTypes/project.js` — added to `contentBlocks`
- [ ] `sanity/schemaTypes/post.js` — added to `contentBlocks` (if applicable)
- [ ] Portfolio: `npm run sync-ir` + renderer component
- [ ] Publisher: Lua filter case + GROQ query update
