/**
 * sanity-to-ir.js
 *
 * Transforms a raw Sanity GROQ response into an IRDocument.
 *
 * Usage:
 *   import { transformDocument } from './sanity-to-ir.js';
 *
 *   const sanityDoc = await client.fetch(query, { slug });
 *   const irDoc = transformDocument(sanityDoc);
 *
 * The GROQ query should resolve all asset references (asset->url) before
 * passing the response to this transformer. Example query shape:
 *
 *   *[_type == "project" && slug.current == $slug][0]{
 *     _type, title, "slug": slug.current, publishedAt,
 *     "author": author->name,
 *     "tags": tags[]->{ title, "slug": slug.current },
 *     "coverImage": { "url": coverImage.asset->url, "alt": coverImage.alt },
 *     contentBlocks[]{
 *       _type,
 *       // textBlock
 *       content,
 *       // imageBlock
 *       "imageUrl": image.asset->url, "alt": image.alt,
 *       title, text, textSide,
 *       // imageGridBlock
 *       "images": images[]{ "url": asset->url, alt, label },
 *       columns, caption,
 *       // model3DBlock
 *       "modelUrl": modelFile.asset->url,
 *       // htmlBlock
 *       "htmlUrl": htmlFile.asset->url,
 *       // plotlyBlock
 *       chartJSON, layout,
 *       // dynaGridBlock
 *       "items": items[]{ "imageUrl": image.asset->url, "alt": image.alt, x, y, w, h },
 *       // projectBioBlock
 *       projectTitle, abstract, roles, contributors,
 *       // contentCardsBlock
 *       "cards": cards[]{ title, "imageUrl": image.asset->url, "imageAlt": image.alt, bullets },
 *       layout, singleRow
 *     }
 *   }
 */

const IR_SCHEMA_VERSION = "1.0.0";

// ─── Block transformers ───────────────────────────────────────────────────────

function transformBlock(block) {
  if (!block?._type) return null;

  switch (block._type) {

    case 'textBlock':
      return {
        type: 'text',
        content: block.content ?? [],
      };

    case 'imageBlock':
      return {
        type: 'image',
        imageUrl: block.imageUrl ?? block.image?.asset?.url ?? '',
        alt:      block.alt ?? block.imageAlt ?? block.image?.alt ?? '',
        title:    block.title,
        text:     block.text,
        textSide: block.textSide,
      };

    case 'imageGridBlock':
      return {
        type: 'imageGrid',
        images: (block.images ?? []).map(img => ({
          url:   img?.url ?? img?.asset?.url ?? '',
          alt:   img?.alt ?? '',
          label: img?.label,
        })),
        columns: block.columns,
        caption: block.caption,
      };

    case 'model3DBlock':
      return {
        type:     'model3d',
        modelUrl: block.modelUrl ?? block.modelFile?.asset?.url ?? '',
        caption:  block.caption,
        fallback: { type: 'omit', caption: block.caption },
      };

    case 'htmlBlock':
      return {
        type:     'html',
        htmlUrl:  block.htmlUrl ?? block.htmlFile?.asset?.url ?? '',
        caption:  block.caption,
        fallback: { type: 'caption', caption: block.caption },
      };

    case 'plotlyBlock': {
      let chartSpec = block.chartJSON ?? {};
      if (typeof chartSpec === 'string') {
        try { chartSpec = JSON.parse(chartSpec); }
        catch { chartSpec = {}; }
      }
      return {
        type:      'plotly',
        chartSpec,
        caption:   block.caption,
        fallback:  { type: 'caption', caption: block.caption },
      };
    }

    case 'dynaGridBlock':
      return {
        type: 'dynaGrid',
        items: (block.items ?? []).map(item => ({
          imageUrl: item?.imageUrl ?? item?.image?.asset?.url ?? '',
          alt:      item?.alt ?? item?.image?.alt ?? '',
          x: item?.x ?? 0,
          y: item?.y ?? 0,
          w: item?.w ?? 1,
          h: item?.h ?? 1,
        })),
        title:    block.title,
        text:     block.text,
        textSide: block.textSide,
      };

    case 'projectBioBlock':
      return {
        type:         'projectBio',
        projectTitle: block.projectTitle ?? '',
        abstract:     block.abstract ?? '',
        roles:        block.roles ?? [],
        contributors: (block.contributors ?? []).map(c => ({
          name: c?.name ?? '',
          role: c?.role ?? '',
        })),
      };

    case 'contentCardsBlock':
      return {
        type: 'contentCards',
        cards: (block.cards ?? []).map(card => ({
          title:    card?.title,
          imageUrl: card?.imageUrl ?? card?.image?.asset?.url,
          imageAlt: card?.imageAlt ?? card?.image?.alt,
          bullets:  card?.bullets ?? [],
        })),
        layout:    block.layout ?? 'row',
        singleRow: block.singleRow ?? false,
      };

    // Engineering reasoning blocks (Publisher origin — future Sanity additions)

    case 'decisionBlock':
    case 'designDecisionBlock':
      return {
        type:    'decision',
        title:   block.title,
        id:      block.id,
        content: block.content ?? [],
      };

    case 'requirementBlock':
      return {
        type:     'requirement',
        id:       block.id,
        priority: block.priority,
        content:  block.content ?? [],
      };

    case 'testResultBlock':
      return {
        type:    'testResult',
        status:  block.status ?? 'partial',
        title:   block.title,
        content: block.content ?? [],
      };

    case 'warningBlock':
      return { type: 'warning',    title: block.title, content: block.content ?? [] };

    case 'noteBlock':
      return { type: 'note',       title: block.title, content: block.content ?? [] };

    case 'assumptionBlock':
      return { type: 'assumption', title: block.title, content: block.content ?? [] };

    case 'riskBlock':
      return {
        type:     'risk',
        severity: block.severity,
        title:    block.title,
        content:  block.content ?? [],
      };

    case 'mathBlock':
      return {
        type:     'math',
        source:   block.source ?? '',
        notation: 'latex',
        display:  block.display ?? 'block',
      };

    case 'galleryBlock':
      return {
        type: 'gallery',
        images: (block.images ?? []).map(img => ({
          url: img?.url ?? img?.asset?.url ?? '',
          alt: img?.alt ?? '',
        })),
        caption: block.caption,
      };

    default:
      console.error(
        `[sanity-to-ir] Unknown block type: "${block._type}" — block dropped.\n` +
        `  If this is a new block type, add a case to transformBlock() in sanity-to-ir.js.`
      );
      return null;
  }
}

// ─── Metadata transformer ─────────────────────────────────────────────────────

function transformMetadata(doc) {
  const coverImageUrl =
    doc.coverImage?.url ??
    doc.coverImage?.asset?.url ??
    null;

  return {
    title:       doc.title ?? '',
    slug:        doc.slug?.current ?? doc.slug ?? '',
    publishedAt: doc.publishedAt,
    author:      doc.author?.name ?? doc.author,
    tags:        (doc.tags ?? []).map(t => t?.title ?? t?.slug?.current ?? t),
    hook:        doc.hook,
    abstract:    doc.abstract,
    coverImage:  coverImageUrl
      ? { url: coverImageUrl, alt: doc.coverImage?.alt ?? doc.title }
      : undefined,
  };
}

// ─── Document type inference ──────────────────────────────────────────────────

function inferDocumentType(doc) {
  const typeMap = {
    project:      'project',
    post:         'post',
    report:       'report',
    presentation: 'presentation',
    proposal:     'proposal',
    notebook:     'notebook',
  };
  return typeMap[doc._type] ?? 'project';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Transform a Sanity document (GROQ response) into an IRDocument.
 *
 * @param {object} sanityDoc - Raw Sanity document with asset references resolved
 * @returns {import('../schema.js').IRDocument}
 */
export function transformDocument(sanityDoc) {
  if (!sanityDoc) {
    throw new Error('[sanity-to-ir] transformDocument received null or undefined');
  }

  const blocks = (sanityDoc.contentBlocks ?? [])
    .map(transformBlock)
    .filter(Boolean);

  return {
    schemaVersion: IR_SCHEMA_VERSION,
    documentType:  inferDocumentType(sanityDoc),
    metadata:      transformMetadata(sanityDoc),
    blocks,
  };
}

/**
 * Transform an array of Sanity documents.
 *
 * @param {object[]} sanityDocs
 * @returns {import('../schema.js').IRDocument[]}
 */
export function transformDocuments(sanityDocs) {
  return sanityDocs.map(transformDocument);
}
