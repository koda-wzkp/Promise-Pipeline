const post = {
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 } },
    { name: "author", title: "Author", type: "reference", to: [{ type: "author" }] },
    { name: "publishedAt", title: "Published at", type: "datetime" },
    { name: "excerpt", title: "Excerpt", type: "text", rows: 3 },
    { name: "mainImage", title: "Main image", type: "image", options: { hotspot: true } },
    { name: "categories", title: "Categories", type: "array", of: [{ type: "reference", to: [{ type: "category" }] }] },
    { name: "body", title: "Body", type: "blockContent" },
    {
      name: "relatedPromises",
      title: "Related Promises",
      description: "Promise IDs referenced in this post (e.g., P001, AI-003)",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "vertical",
      title: "Vertical",
      type: "string",
      options: {
        list: [
          { title: "Civic", value: "civic" },
          { title: "AI Safety", value: "ai" },
          { title: "Infrastructure", value: "infrastructure" },
          { title: "Supply Chain", value: "supply-chain" },
          { title: "Teams", value: "teams" },
          { title: "General", value: "general" },
        ],
      },
    },
  ],
};

export default post;
