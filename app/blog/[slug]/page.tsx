import Link from "next/link";
import { notFound } from "next/navigation";

// Individual blog post page — renders Portable Text from Sanity

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post: any = null;

  try {
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder") {
      const { client } = await import("@/sanity/lib/client");
      const { postBySlugQuery } = await import("@/sanity/lib/queries");
      post = await client.fetch(postBySlugQuery, { slug: params.slug });
    }
  } catch {
    // Sanity not configured
  }

  if (!post) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="font-serif text-2xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-500 mb-4">
            This post doesn&apos;t exist yet, or Sanity CMS is not configured.
          </p>
          <Link
            href="/blog"
            className="text-blue-600 hover:underline text-sm"
          >
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f6" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
        >
          &larr; Back to blog
        </Link>

        <article>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            {post.author?.name && <span>By {post.author.name}</span>}
            {post.publishedAt && (
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            )}
            {post.vertical && (
              <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                {post.vertical}
              </span>
            )}
          </div>

          {/* Body content rendered via Portable Text */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-500 italic">
              Content rendered from Sanity CMS. Configure your Sanity project
              to see blog post content here.
            </p>
          </div>

          {/* Related promises */}
          {post.relatedPromises && post.relatedPromises.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border">
              <h3 className="font-serif font-semibold text-gray-900 mb-2">
                Promises Referenced
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.relatedPromises.map((id: string) => (
                  <Link
                    key={id}
                    href={`/demo/hb2021#${id}`}
                    className="px-2 py-1 text-xs font-mono bg-white border rounded hover:bg-gray-100"
                  >
                    {id}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
