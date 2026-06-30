import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'imageBlock',
  title: 'Image Block',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Accessibility & SEO',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'title',
      title: 'Title (optional)',
      type: 'string',
    }),

    defineField({
      name: 'text',
      title: 'Text (optional)',
      type: 'text',
      rows: 6,
      description:
        'If provided, text can appear left, right, or below the image on desktop (your choice). On small screens it stacks below.',
    }),

    defineField({
      name: 'textSide',
      title: 'Text Placement (desktop)',
      type: 'string',
      initialValue: 'right',
      options: {
        list: [
          { title: 'Text on Left', value: 'left' },
          { title: 'Text on Right', value: 'right' },
          { title: 'Text on Bottom', value: 'bottom' },
          { title: 'Text on Top', value: 'top' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      hidden: ({ parent }) => {
        const hasTitle = !!parent?.title?.trim()
        const hasText = !!parent?.text?.trim()
        return !(hasTitle || hasText)
      },
    }),
  ],

  preview: {
    select: {
      media: 'image',
      text: 'text',
      side: 'textSide',
    },
    prepare({ media, text, side }) {
      const placement = side || 'right'
      return {
        title: text ? `Image + Text (${placement})` : 'Full-width Image',
        subtitle: text ? (text.length > 60 ? text.slice(0, 60) + '…' : text) : 'No text',
        media,
      }
    },
  },
})
