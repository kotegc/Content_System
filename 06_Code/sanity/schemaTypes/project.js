import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),

    defineField({
      name: 'isVisible',
      title: 'Visible on site',
      type: 'boolean',
      description: 'Turn this on to show the project on the live site.',
      initialValue: false,
    }),

    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first on the homepage.',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'tileSize',
      title: 'Tile Size (Homepage)',
      type: 'string',
      description: 'Controls the tile size on the homepage grid',
      options: {
        list: [
          { title: '1×1 (default)', value: '1x1' },
          { title: '2×1', value: '2x1' },
          { title: '2×2', value: '2x2' },
          { title: '3×2', value: '3x2' },
          { title: '3×3', value: '3x3' },
          { title: '4×4', value: '4x4' },
        ],
        layout: 'dropdown',
      },
      initialValue: '1x1',
    }),

    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for accessibility & SEO',
        },
      ],
    }),

    defineField({
      name: 'logo',
      title: 'Logo (PNG/SVG)',
      type: 'file',
      options: {
        accept: "image/png,image/svg+xml",
      },
      fields: [
        {
          name: 'logoAlt',
          title: 'Logo alt text',
          type: 'string',
        },
      ],
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),

    defineField({
      name: "tags",
      title: "Tags (max 3)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      validation: (Rule) => Rule.max(3),
      options: {
        layout: "tags",
      },
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),

    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
        // Meta
        {type: 'projectBioBlock'},
        {type: 'contentCardsBlock'},
        // Content
        {type: 'textBlock'},
        {type: 'imageBlock'},
        {type: 'imageGridBlock'},
        {type: 'galleryBlock'},
        {type: 'plotlyBlock'},
        {type: 'model3DBlock'},
        {type: 'htmlBlock'},
        {type: 'dynaGridBlock'},
        {type: 'mathBlock'},
        // Engineering reasoning
        {type: 'decisionBlock'},
        {type: 'requirementBlock'},
        {type: 'testResultBlock'},
        {type: 'warningBlock'},
        {type: 'noteBlock'},
        {type: 'assumptionBlock'},
        {type: 'riskBlock'},
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      isVisible: 'isVisible',
      sortOrder: 'sortOrder',
    },
    prepare(selection) {
      const {author, isVisible, sortOrder} = selection
      const visibility = isVisible ? 'Visible' : 'Hidden'
      const order = typeof sortOrder === 'number' ? `#${sortOrder}` : 'No order'
      return {
        title: selection.title,
        subtitle: [author && `by ${author}`, visibility, order].filter(Boolean).join(' • '),
      }
    },
  },
})
