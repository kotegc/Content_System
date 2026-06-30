import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'testResultBlock',
  title: 'Test Result',
  type: 'object',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pass', value: 'pass'},
          {title: 'Fail', value: 'fail'},
          {title: 'Partial', value: 'partial'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Test name',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Notes',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', status: 'status'},
    prepare({title, status}) {
      const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
      return {title: `${icon} ${title ?? 'Test Result'}`, subtitle: status ?? ''}
    },
  },
})
