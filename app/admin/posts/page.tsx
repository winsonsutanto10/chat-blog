import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/db/queries/posts";
import DeletePostButton from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const rows = await getAllPosts();
  const allTags = [...new Set(rows.flatMap((r) => r.posts.tags))];

  return (
    <main className="flex-1 px-6 py-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#38200D]">All Posts</h1>
          <p className="text-sm text-[#38200D]/50 mt-0.5">
            {rows.length} posts total
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#FB5607] text-white text-sm font-semibold rounded-xl hover:bg-[#FB5607]/90 transition-colors shadow-lg shadow-[#FB5607]/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#38200D]/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#38200D]/10 rounded-xl text-sm text-[#38200D] placeholder-[#38200D]/30 outline-none focus:border-[#FB5607]/40"
          />
        </div>
        <select className="px-3 py-2 bg-white border border-[#38200D]/10 rounded-xl text-sm text-[#38200D]/70 outline-none focus:border-[#FB5607]/40 cursor-pointer">
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
        <select className="px-3 py-2 bg-white border border-[#38200D]/10 rounded-xl text-sm text-[#38200D]/70 outline-none focus:border-[#FB5607]/40 cursor-pointer">
          <option>All Tags</option>
          {allTags.map((tag) => (
            <option key={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-[#38200D]/10 overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#38200D]/40 text-sm mb-3">No posts yet.</p>
            <Link href="/admin/posts/new" className="text-sm text-[#FB5607] font-medium hover:underline">
              Write your first post →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#38200D]/10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#38200D]/50 uppercase tracking-wider">Post</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#38200D]/50 uppercase tracking-wider hidden md:table-cell">Tags</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#38200D]/50 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#38200D]/50 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38200D]/5">
              {rows.map(({ posts: post, authors: author }) => (
                <tr key={post.id} className="hover:bg-[#FFF8F2] transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {post.coverImage ? (
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#FFF8F2]">
                          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-[#FFF8F2] flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#38200D] line-clamp-1 group-hover:text-[#FB5607] transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-[#38200D]/40 mt-0.5">
                          by {author?.name ?? "Unknown"} · {post.readingTime} min read
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-[#FFBE0B]/15 text-[#38200D] text-xs rounded-full border border-[#FFBE0B]/30">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-[#38200D]/5 text-[#38200D]/50 text-xs rounded-full">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className="text-sm text-[#38200D]/50">
                      {(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-[#FFBE0B]/20 text-[#38200D]"
                    }`}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#38200D]/40 hover:text-[#3A86FF] hover:bg-[#3A86FF]/10 rounded-lg transition-colors"
                        title="View post"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-1.5 text-[#38200D]/40 hover:text-[#FB5607] hover:bg-[#FB5607]/10 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </Link>
                      <DeletePostButton postId={post.id} postTitle={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {rows.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#38200D]/10">
            <p className="text-xs text-[#38200D]/40">
              Showing 1–{rows.length} of {rows.length} posts
            </p>
            <div className="flex gap-1">
              <button className="w-7 h-7 text-xs font-medium rounded-lg bg-[#FB5607] text-white">1</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
