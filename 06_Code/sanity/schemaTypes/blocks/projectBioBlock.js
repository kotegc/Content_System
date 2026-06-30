import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'projectBioBlock',
  title: 'Project Bio Block',
  type: 'object',
  fields: [
    defineField({
      name: 'projectTitle',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'abstract',
      title: 'Abstract',
      type: 'text',
      rows: 4,
      description: 'Short intro. We'll tune the limit later.',
      validation: (Rule) =>
        Rule.required().max(240).warning('Try to keep this short for the tile.'),
    }),

    defineField({
      name: 'roles',
      title: 'Roles',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.min(1).warning('Add at least one role.'),
    }),

    defineField({
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      of: [
        defineType({
          name: 'projectContributor',
          title: 'Contributor',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'role'},
          },
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'projectTitle',
      subtitle: 'abstract',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Project Bio',
        subtitle: subtitle ? subtitle.slice(0, 60) + (subtitle.length > 60 ? '…' : '') : '',
      }
    },
  },
})
