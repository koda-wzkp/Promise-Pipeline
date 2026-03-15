export const allPostsQuery = `*[_type == "post"] | order(publishedAt desc) {
  title, slug, excerpt, publishedAt, mainImage,
  "categories": categories[]->title,
  "author": author->name,
  vertical
}`;

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  title, slug, body, publishedAt, mainImage, excerpt,
  "categories": categories[]->title,
  "author": author->{name, image, bio},
  vertical, relatedPromises
}`;

export const caseStudiesQuery = `*[_type == "caseStudy"] | order(publishedAt desc) {
  title, slug, vertical, promiseCount, agentCount, keyFinding, publishedAt
}`;

export const postsByVerticalQuery = `*[_type == "post" && vertical == $vertical] | order(publishedAt desc) {
  title, slug, excerpt, publishedAt, mainImage
}`;
