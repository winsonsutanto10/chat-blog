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
            Developer Blog
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            Ideas Worth{" "}
            <span className="text-[#FFBE0B]">Writing</span>{" "}
            About
          </h1>
          <p className="text-[#FF995D] text-lg max-w-xl mx-auto leading-relaxed">
            Deep dives, tutorials, and opinions on modern web development.
            Written by developers, for developers.
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

        {/* Newsletter CTA */}
        <section className="mt-16 rounded-2xl bg-[#38200D] p-8 sm:p-12 text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FB5607]/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFBE0B]/10 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2">
              Stay in the Loop
            </h3>
            <p className="text-[#FF995D] mb-6 max-w-md mx-auto">
              Get the latest articles delivered straight to your inbox. No spam,
              unsubscribe anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#FFBE0B]/60"
              />
              <button className="px-6 py-2.5 bg-[#FB5607] hover:bg-[#FF995D] text-white font-semibold text-sm rounded-full transition-colors whitespace-nowrap cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
