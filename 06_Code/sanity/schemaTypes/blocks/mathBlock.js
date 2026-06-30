import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'mathBlock',
  title: 'Math',
  type: 'object',
  fields: [
    defineField({
      name: 'source',
      title: 'LaTeX expression',
      type: 'text',
      rows: 4,
      description: 'Enter a LaTeX math expression. No surrounding $…$ or $$…$$ delimiters.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'display',
      title: 'Display mode',
      type: 'string',
      options: {
        list: [
          {title: 'Block (centered, own line)', value: 'block'},
          {title: 'Inline (within text)', value: 'inline'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'block',
    }),
  ],
  preview: {
    select: {source: 'source', display: 'display'},
    prepare({source, display}) {
      const truncated = source ? source.slice(0, 60) : ''
      return {title: `∑ Math (${display ?? 'block'})`, subtitle: truncated}
    },
  },
})
