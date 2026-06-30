// sanity/schemaTypes/blocks/contentCardsBlock.js
import { defineType, defineField } from "sanity";

export default defineType({
  name: "contentCardsBlock",
  title: "Content Cards",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Horizontal (Row)", value: "row" },
          { title: "Vertical (Stack)", value: "stack" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "row",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "singleRow",
      title: "Single row",
      type: "boolean",
      initialValue: false,
      description: "Keep all cards in one row, regardless of card count.",
    }),

    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      validation: (Rule) => Rule.min(1),
      of: [
        defineType({
          name: "contentCard",
          title: "Card",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "bullets",
              title: "Bullet List",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
          preview: {
            select: { title: "title", media: "image", bullets: "bullets" },
            prepare({ title, media, bullets }) {
              const count = Array.isArray(bullets) ? bullets.length : 0;
              return {
                title: title || "Untitled card",
                subtitle: `${count} bullet${count === 1 ? "" : "s"}`,
                media,
              };
            },
          },
        }),
      ],
    }),
  ],

  preview: {
    select: { cards: "cards", layout: "layout", singleRow: "singleRow" },
    prepare({ cards, layout, singleRow }) {
      const count = Array.isArray(cards) ? cards.length : 0;
      const modeLabel = layout === "stack" ? "Stack" : "Row";
      const rowLabel = singleRow ? " • Single row" : "";
      return {
        title: `Content Cards (${modeLabel})`,
        subtitle: `${count} card${count === 1 ? "" : "s"}${rowLabel}`,
      };
    },
  },
});
