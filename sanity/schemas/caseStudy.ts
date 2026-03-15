const caseStudy = {
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    {
      name: "vertical",
      title: "Vertical",
      type: "string",
      options: {
        list: ["civic", "ai", "infrastructure", "supply-chain", "teams"],
      },
    },
    { name: "promiseCount", title: "Promises Analyzed", type: "number" },
    { name: "agentCount", title: "Agents Tracked", type: "number" },
    { name: "domainCount", title: "Domains Covered", type: "number" },
    { name: "keyFinding", title: "Key Finding", type: "text" },
    { name: "body", title: "Body", type: "blockContent" },
    { name: "publishedAt", title: "Published at", type: "datetime" },
  ],
};

export default caseStudy;
