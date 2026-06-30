import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'imageGridBlock',
  title: 'Image Grid Block',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineType({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'label',
              title: 'Label (optional)',
              type: 'string',
              description: 'Small label that appears on the bottom-right of the image'
            })
          ]
        })
      ]
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
    }),
    defineField({
      name: 'columns',
      title: 'Grid Columns',
      type: 'number',
      description: 'How many columns wide should this image grid be?',
      validation: Rule => Rule.min(1).max(8),
    }),
  ],
  preview: {
    prepare() {
      return {title: '🖼️ Image Grid'}
    },
  },
})
