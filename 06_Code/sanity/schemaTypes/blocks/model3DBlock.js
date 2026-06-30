import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'model3DBlock',
  title: '3D Model Block',
  type: 'object',
  fields: [
    defineField({
      name: 'modelFile',
      title: '3D Model File',
      type: 'file',
      options: {
        accept: '.glb',
      },
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return {title: '🧊 3D Model'}
    },
  },
})
