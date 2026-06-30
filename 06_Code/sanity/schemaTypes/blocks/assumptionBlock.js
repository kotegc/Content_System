import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'assumptionBlock',
  title: 'Assumption',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Assumption title',
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
      return {title: `🔷 ${title ?? 'Assumption'}`}
    },
  },
})
