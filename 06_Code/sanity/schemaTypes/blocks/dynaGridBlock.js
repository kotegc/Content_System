import { defineField, defineType, defineArrayMember } from "sanity";
import DynaGridInput from "../../components/DynaGridInput";

const GRID = 8;

export default defineType({
  name: "dynaGridBlock",
  title: "DynaGrid",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [
        defineArrayMember({
          name: "dynaGridItem",
          title: "Grid Item",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt text",
                  type: "string",
                }),
              ],
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "x",
              title: "X",
              type: "number",
              validation: (R) => R.required().min(0).max(GRID - 1),
            }),
            defineField({
              name: "y",
              title: "Y",
              type: "number",
              validation: (R) => R.required().min(0).max(GRID - 1),
            }),
            defineField({
              name: "w",
              title: "W",
              type: "number",
              validation: (R) => R.required().min(1).max(GRID),
            }),
            defineField({
              name: "h",
              title: "H",
              type: "number",
              validation: (R) => R.required().min(1).max(GRID),
            }),
          ],
          preview: {
            select: { media: "image" },
            prepare({ media }) {
              return { title: "Item", media };
            },
          },
        }),
      ],
      initialValue: [],
      components: { input: DynaGridInput },
    }),

    defineField({
      name: "title",
      title: "Title (optional)",
      type: "string",
    }),

    defineField({
      name: "text",
      title: "Text (optional)",
      type: "text",
      rows: 6,
      description:
        "If provided, text can appear left, right, below, or above the grid on desktop. On small screens it stacks below.",
    }),

    defineField({
      name: "textSide",
      title: "Text Placement (desktop)",
      type: "string",
      initialValue: "right",
      options: {
        list: [
          { title: "Text on Left", value: "left" },
          { title: "Text on Right", value: "right" },
          { title: "Text on Bottom", value: "bottom" },
          { title: "Text on Top", value: "top" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      hidden: ({ parent }) => {
        const hasTitle = !!parent?.title?.trim()
        const hasText = !!parent?.text?.trim()
        return !(hasTitle || hasText)
      },
    }),
  ],

  preview: {
    select: { items: "items", text: "text", side: "textSide" },
    prepare({ items, text, side }) {
      const count = Array.isArray(items) ? items.length : 0;
      const placement = side || "right";
      return {
        title: text
          ? `DynaGrid + Text (${placement})`
          : `DynaGrid (${count} image${count === 1 ? "" : "s"})`,
        subtitle: text
          ? (text.length > 60 ? text.slice(0, 60) + "…" : text)
          : `${count} image${count === 1 ? "" : "s"}`,
      };
    },
  },
});
