import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'noteBlock',
  title: 'Note',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Note title',
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
      return {title: `💡 ${title ?? 'Note'}`}
    },
  },
})
