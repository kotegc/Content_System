/**
 * Intermediate Representation schema — Content System v1.0.0
 *
 * IRDocument is the format-neutral document tree that sits between the
 * content store (Sanity) and all renderers (Astro, Quarto, Markdown, etc.).
 *
 * Invariants:
 *   - All asset references are resolved CDN URIs (not Sanity internal refs)
 *   - Math notation is carried as LaTeX source strings
 *   - No layout hints, colors, or format-specific markup
 *   - Renderer-dependent blocks carry a `fallback` field
 */

export const IR_SCHEMA_VERSION = "1.0.0";

// ─── Fallback ─────────────────────────────────────────────────────────────────

export type IRFallbackType = "image" | "caption" | "omit";

export interface IRFallback {
  type: IRFallbackType;
  src?: string;
  alt?: string;
  caption?: string;
}

// ─── Portable Text ────────────────────────────────────────────────────────────

/**
 * Sanity Portable Text block — preserved as-is from the CMS.
 * Renderers are responsible for interpreting this structure.
 * See: https://www.portabletext.org/
 */
export type PortableTextBlock = Record<string, unknown>;

// ─── Metadata ─────────────────────────────────────────────────────────────────

export interface IRCoverImage {
  url: string;
  alt?: string;
}

export interface IRMetadata {
  title: string;
  slug: string;
  publishedAt?: string;
  author?: string;
  tags?: string[];
  hook?: string;       // short summary for listings / carousels (posts)
  abstract?: string;   // longer summary (future use)
  coverImage?: IRCoverImage;
}

// ─── Shared sub-types ─────────────────────────────────────────────────────────

export interface IRImageItem {
  url: string;
  alt?: string;
  label?: string;
}

export interface IRContributor {
  name: string;
  role: string;
}

export interface IRCard {
  title?: string;
  imageUrl?: string;
  imageAlt?: string;
  bullets?: string[];
}

export interface IRDynaGridItem {
  imageUrl: string;
  alt?: string;
  x: number;   // column position (0–7 on 8-unit grid)
  y: number;   // row position    (0–7 on 8-unit grid)
  w: number;   // width in units  (1–8)
  h: number;   // height in units (1–8)
}

// ─── Content blocks ───────────────────────────────────────────────────────────

export interface IRTextBlock {
  type: "text";
  content: PortableTextBlock[];
}

export interface IRImageBlock {
  type: "image";
  imageUrl: string;
  alt: string;
  title?: string;
  text?: string;
  textSide?: "left" | "right" | "top" | "bottom";
}

export interface IRImageGridBlock {
  type: "imageGrid";
  images: IRImageItem[];
  columns?: number;
  caption?: string;
}

export interface IRModel3DBlock {
  type: "model3d";
  modelUrl: string;
  caption?: string;
  fallback: IRFallback;
}

export interface IRHtmlBlock {
  type: "html";
  htmlUrl: string;
  caption?: string;
  fallback: IRFallback;
}

export interface IRPlotlyBlock {
  type: "plotly";
  chartSpec: Record<string, unknown>;
  caption?: string;
  fallback: IRFallback;
}

export interface IRDynaGridBlock {
  type: "dynaGrid";
  items: IRDynaGridItem[];
  title?: string;
  text?: string;
  textSide?: "left" | "right" | "top" | "bottom";
}

// ─── Meta blocks ──────────────────────────────────────────────────────────────

export interface IRProjectBioBlock {
  type: "projectBio";
  projectTitle: string;
  abstract: string;
  roles: string[];
  contributors?: IRContributor[];
}

export interface IRContentCardsBlock {
  type: "contentCards";
  cards: IRCard[];
  layout: "row" | "stack";
  singleRow?: boolean;
}

// ─── Structure blocks ─────────────────────────────────────────────────────────

export interface IRGalleryBlock {
  type: "gallery";
  images: IRImageItem[];
  caption?: string;
}

// ─── Math block ───────────────────────────────────────────────────────────────

export interface IRMathBlock {
  type: "math";
  source: string;
  notation: "latex";
  display: "block" | "inline";
}

// ─── Engineering reasoning blocks ─────────────────────────────────────────────

/**
 * Content field on reasoning blocks is Portable Text when the block
 * originates from Sanity, or a plain string when derived from Quarto .qmd.
 */
type ReasoningContent = PortableTextBlock[] | string;

export interface IRDecisionBlock {
  type: "decision";
  title?: string;
  id?: string;
  content: ReasoningContent;
}

export interface IRRequirementBlock {
  type: "requirement";
  id?: string;
  priority?: "high" | "medium" | "low";
  content: ReasoningContent;
}

export interface IRTestResultBlock {
  type: "testResult";
  status: "pass" | "fail" | "partial";
  title?: string;
  content: ReasoningContent;
}

export interface IRWarningBlock {
  type: "warning";
  title?: string;
  content: ReasoningContent;
}

export interface IRNoteBlock {
  type: "note";
  title?: string;
  content: ReasoningContent;
}

export interface IRAssumptionBlock {
  type: "assumption";
  title?: string;
  content: ReasoningContent;
}

export interface IRRiskBlock {
  type: "risk";
  severity?: "high" | "medium" | "low";
  title?: string;
  content: ReasoningContent;
}

// ─── Block union ──────────────────────────────────────────────────────────────

export type IRBlock =
  // Content
  | IRTextBlock
  | IRImageBlock
  | IRImageGridBlock
  | IRModel3DBlock
  | IRHtmlBlock
  | IRPlotlyBlock
  | IRDynaGridBlock
  // Meta
  | IRProjectBioBlock
  | IRContentCardsBlock
  // Structure
  | IRGalleryBlock
  // Math
  | IRMathBlock
  // Engineering reasoning
  | IRDecisionBlock
  | IRRequirementBlock
  | IRTestResultBlock
  | IRWarningBlock
  | IRNoteBlock
  | IRAssumptionBlock
  | IRRiskBlock;

// ─── Document ─────────────────────────────────────────────────────────────────

export type IRDocumentType =
  | "project"
  | "post"
  | "report"
  | "presentation"
  | "proposal"
  | "notebook";

export interface IRDocument {
  schemaVersion: string;
  documentType: IRDocumentType;
  metadata: IRMetadata;
  blocks: IRBlock[];
}
