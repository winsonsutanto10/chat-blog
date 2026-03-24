import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import TagFilter from "@/components/TagFilter";
import { Suspense } from "react";
import { getFeaturedPost, getAllPublishedPosts } from "@/db/queries/posts";

interface HomePageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tag } = await searchParams;

  const [featuredPost, allPosts] = await Promise.all([
    getFeaturedPost(),
    getAllPublishedPosts(),
  ]);

  // Build tag list sorted by post count
  const tagCounts = allPosts.reduce<Record<string, number>>((acc, post) => {
    post.tags.forEach((t) => { acc[t] = (acc[t] ?? 0) + 1; });
    return acc;
  }, {});
  const tagList = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Filter posts by active tag
  const filteredPosts = tag
    ? allPosts.filter((p) => p.tags.includes(tag))
    : allPosts.filter((p) => p.slug !== featuredPost?.slug);

  const postCount = filteredPosts.length;

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-[#38200D] py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FB5607]/20 text-[#FF995D] text-xs font-semibold rounded-full border border-[#FB5607]/30 mb-5 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB5607] animate-pulse" />
            Personal Blog
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Thoughts Worth{" "}
            <span className="text-[#FFBE0B]">Sharing</span>
          </h1>
          <p className="text-[#FF995D] text-lg max-w-xl mx-auto leading-relaxed">
            A personal space for ideas, stories, and things I find worth writing about.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Featured Post — hidden when filtering by tag */}
        {featuredPost && !tag && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[#38200D] text-xl font-bold">Featured Post</h2>
              <div className="flex-1 h-px bg-[#38200D]/10" />
            </div>
            <BlogCard post={featuredPost} featured />
          </section>
        )}

        {/* Posts Grid */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-[#38200D] text-xl font-bold">
                {tag ? (
                  <>Posts tagged <span className="text-[#FB5607]">{tag}</span></>
                ) : (
                  "Recent Posts"
                )}
              </h2>
              <div className="px-2 py-0.5 bg-[#FB5607] text-white text-xs font-bold rounded-full">
                {postCount}
              </div>
            </div>

            <Suspense>
              <TagFilter tags={tagList} activeTag={tag ?? null} />
            </Suspense>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[#38200D]/40 text-sm">No posts found for &ldquo;{tag}&rdquo;.</p>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
