const blockContent = {
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    {
      title: "Block",
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Number", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
              },
            ],
          },
          {
            title: "Promise Reference",
            name: "promiseRef",
            type: "object",
            fields: [
              {
                title: "Promise ID",
                name: "promiseId",
                type: "string",
                description: "e.g., P001, AI-003",
              },
            ],
          },
        ],
      },
    },
    {
      type: "image",
      options: { hotspot: true },
    },
    {
      title: "Code Block",
      name: "code",
      type: "object",
      fields: [
        { title: "Language", name: "language", type: "string" },
        { title: "Code", name: "code", type: "text" },
      ],
    },
    {
      title: "Callout",
      name: "callout",
      type: "object",
      fields: [
        {
          title: "Type",
          name: "type",
          type: "string",
          options: {
            list: ["info", "warning", "insight"],
          },
        },
        { title: "Title", name: "title", type: "string" },
        { title: "Body", name: "body", type: "text" },
      ],
    },
  ],
};

export default blockContent;
