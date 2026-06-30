import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
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

    // 🖼️ Cover Image
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true, // optional, allows cropping in Sanity Studio
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
        // This makes the input feel like a "dropdown search"
        // (Sanity reference input is autocomplete by default)
        layout: "tags",
      },
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),

    defineField({
      name: "hook",
      title: "Hook (1–2 sentences)",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(280),
      description: "Short summary used in carousels/cards. ~200–280 characters max.",
    }),

    // 🚀 Here's the key new part
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
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
        // Reasoning callouts
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
    },
    prepare(selection) {
      const {author} = selection
      return {...selection, subtitle: author && `by ${author}`}
    },
  },
})
