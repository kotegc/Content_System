import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'plotlyBlock',
  title: 'Plotly Chart Block',
  type: 'object',
  fields: [
    defineField({
      name: 'chartJSON',
      title: 'Plotly Chart JSON',
      type: 'code',
      options: {
        language: 'json',
        languageAlternatives: [],
        withFilename: false,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Wide', value: 'wide'},
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
    }),
  ],
  preview: {
    prepare() {
      return {title: '📊 Plotly Chart'}
    },
  },
})
