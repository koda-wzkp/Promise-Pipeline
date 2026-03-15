import Link from "next/link";

// Blog index page — fetches from Sanity when configured.
// Shows placeholder content when Sanity is not set up.

export default async function BlogPage() {
  let posts: any[] = [];

  try {
    // Only fetch if Sanity is configured
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder") {
      const { client } = await import("@/sanity/lib/client");
      const { allPostsQuery } = await import("@/sanity/lib/queries");
      posts = await client.fetch(allPostsQuery);
    }
  } catch {
    // Sanity not configured — show placeholder
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-500 mb-8">
          Promise Theory, case studies, and project updates.
        </p>

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any) => (
              <article key={post.slug?.current} className="bg-white rounded-xl border p-6">
                <Link href={`/blog/${post.slug?.current}`}>
                  <h2 className="font-serif text-xl font-semibold text-gray-900 hover:text-blue-700 mb-2">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {post.author && <span>{post.author}</span>}
                  {post.publishedAt && (
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  )}
                  {post.vertical && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                      {post.vertical}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center">
            <h3 className="font-serif text-lg font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Blog posts will appear here once the Sanity CMS is configured.
              Check back soon for articles on Promise Theory, case studies, and
              project updates.
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Planned articles:</p>
              <p>&bull; What is Promise Theory?</p>
              <p>&bull; Oregon HB 2021: 20 Promises, 5 Years Later</p>
              <p>&bull; Why We Built a Simulation Engine for Promises</p>
              <p>&bull; Promise Pipeline Changelog: v2 Launch</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
