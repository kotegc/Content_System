import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'htmlBlock',
  title: 'HTML Block',
  type: 'object',
  fields: [
    defineField({
      name: 'htmlFile',
      title: 'HTML File',
      type: 'file',
      options: {
        accept: '.html,.htm',
      },
      description: 'Upload an HTML file exported from your Jupyter notebook.',
    }),
    defineField({
      name: 'caption',
      title: 'Caption / Notes (optional)',
      type: 'text',
    })
  ],

  preview: {
    select: { title: 'caption' },
    prepare({ title }) {
      return {
        title: title || 'HTML Block',
        subtitle: 'Uploaded HTML file'
      }
    }
  }
})
