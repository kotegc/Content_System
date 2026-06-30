import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Body Text',
      type: 'array',
      of: [{type: 'block'}],
    }),
  ],
  preview: {
    select: {
      title: 'content',
    },
    prepare() {
      return {title: '📝 Text Block'}
    },
  },
})
