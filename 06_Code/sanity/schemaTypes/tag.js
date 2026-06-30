import { defineType, defineField } from "sanity";

export default defineType({
  name: "tag",
  title: "Tags",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      readOnly: ({ document }) => document?.slug?.current === "featured",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      readOnly: ({ document }) => document?.slug?.current === "featured",
      options: { source: "title", maxLength: 48 },
      validation: (Rule) => Rule.required(),
    }),
  ],
});
