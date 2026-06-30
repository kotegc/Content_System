import author from './author'
import post from './post'
import project from './project'
import tag from "./tag"

// Import new block types
import textBlock from './blocks/textBlock'
import imageGridBlock from './blocks/imageGridBlock'
import plotlyBlock from './blocks/plotlyBlock'
import model3DBlock from './blocks/model3DBlock'
import htmlBlock from './blocks/htmlBlock'
import projectBioBlock from './blocks/projectBioBlock'
import imageBlock from './blocks/imageBlock'
import contentCardsBlock from "./blocks/contentCardsBlock"
import dynaGridBlock from './blocks/dynaGridBlock'

export const schemaTypes = [
  author,
  post,
  project,
  tag,

  textBlock,
  imageGridBlock,
  plotlyBlock,
  model3DBlock,
  htmlBlock,
  projectBioBlock,
  imageBlock,
  contentCardsBlock,
  dynaGridBlock,
]
