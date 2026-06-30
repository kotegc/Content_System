import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'requirementBlock',
  title: 'Requirement',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      description: 'Optional reference code, e.g. REQ-03',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
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
      name: 'content',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {id: 'id', priority: 'priority'},
    prepare({id, priority}) {
      const label = id ?? 'Requirement'
      const sub = priority ? `Priority: ${priority}` : ''
      return {title: `📋 ${label}`, subtitle: sub}
    },
  },
})
