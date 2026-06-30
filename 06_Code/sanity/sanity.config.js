import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemaTypes'

const projectId = 'n59ihvcl'
const plugins = [codeInput(), structureTool(), visionTool()]
const schema = {types: schemaTypes}

export default defineConfig([
  {
    name: 'personal',
    title: 'Personal Practice',
    projectId,
    dataset: 'production',
    basePath: '/personal',
    plugins,
    schema,
  },
  {
    name: 'paralia',
    title: 'Paralia',
    projectId,
    dataset: 'paralia',
    basePath: '/paralia',
    plugins,
    schema,
  },
])
