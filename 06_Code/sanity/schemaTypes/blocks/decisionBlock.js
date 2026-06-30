import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'decisionBlock',
  title: 'Design Decision',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Decision title',
      type: 'string',
    }),
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      description: 'Optional short reference code, e.g. D-01',
    }),
    defineField({
      name: 'content',
      title: 'Rationale',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', id: 'id'},
    prepare({title, id}) {
      return {title: `⚖ ${title ?? 'Decision'}`, subtitle: id ?? ''}
    },
  },
})
