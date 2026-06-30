import author from './author'
import post from './post'
import project from './project'
import tag from "./tag"

// Content blocks
import textBlock from './blocks/textBlock'
import imageBlock from './blocks/imageBlock'
import imageGridBlock from './blocks/imageGridBlock'
import plotlyBlock from './blocks/plotlyBlock'
import model3DBlock from './blocks/model3DBlock'
import htmlBlock from './blocks/htmlBlock'
import dynaGridBlock from './blocks/dynaGridBlock'
import galleryBlock from './blocks/galleryBlock'
import mathBlock from './blocks/mathBlock'

// Meta blocks
import projectBioBlock from './blocks/projectBioBlock'
import contentCardsBlock from "./blocks/contentCardsBlock"

// Engineering reasoning blocks
import decisionBlock from './blocks/decisionBlock'
import requirementBlock from './blocks/requirementBlock'
import testResultBlock from './blocks/testResultBlock'
import warningBlock from './blocks/warningBlock'
import noteBlock from './blocks/noteBlock'
import assumptionBlock from './blocks/assumptionBlock'
import riskBlock from './blocks/riskBlock'

export const schemaTypes = [
  // Documents
  author,
  post,
  project,
  tag,

  // Content blocks
  textBlock,
  imageBlock,
  imageGridBlock,
  plotlyBlock,
  model3DBlock,
  htmlBlock,
  dynaGridBlock,
  galleryBlock,
  mathBlock,

  // Meta blocks
  projectBioBlock,
  contentCardsBlock,

  // Engineering reasoning blocks
  decisionBlock,
  requirementBlock,
  testResultBlock,
  warningBlock,
  noteBlock,
  assumptionBlock,
  riskBlock,
]
