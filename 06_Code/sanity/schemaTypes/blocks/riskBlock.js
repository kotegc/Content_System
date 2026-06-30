import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'riskBlock',
  title: 'Risk',
  type: 'object',
  fields: [
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: {
        list: [
          {title: 'High', value: 'high'},
          {title: 'Medium', value: 'medium'},
          {title: 'Low', value: 'low'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'title',
      title: 'Risk title',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Description & mitigation',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', severity: 'severity'},
    prepare({title, severity}) {
      const icon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'
      return {title: `${icon} ${title ?? 'Risk'}`, subtitle: severity ?? ''}
    },
  },
})
