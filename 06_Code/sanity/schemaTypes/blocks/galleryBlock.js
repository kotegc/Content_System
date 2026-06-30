import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'galleryBlock',
  title: 'Gallery',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'alt', title: 'Alt text', type: 'string'},
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {images: 'images', caption: 'caption'},
    prepare({images, caption}) {
      const count = images?.length ?? 0
      return {title: `🖼 Gallery (${count} image${count !== 1 ? 's' : ''})`, subtitle: caption ?? ''}
    },
  },
})
