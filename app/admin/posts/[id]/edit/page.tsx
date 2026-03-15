import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById } from "@/db/queries/posts";
import PostForm from "@/components/admin/PostForm";
import DeletePostButton from "@/components/admin/DeletePostButton";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const row = await getPostById(id);

  if (!row) notFound();

  const { posts: post, authors: author } = row;

  const initialData = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content.trim(),
    coverImage: post.coverImage,
    tags: post.tags,
    status: post.status,
  };

  return (
    <main className="flex-1 px-6 py-8 overflow-y-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/admin" className="text-[#38200D]/40 hover:text-[#FB5607] transition-colors">
          Dashboard
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#38200D]/20">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <Link href="/admin/posts" className="text-[#38200D]/40 hover:text-[#FB5607] transition-colors">
          Posts
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#38200D]/20">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-[#38200D]/60 truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#38200D] truncate">{post.title}</h1>
            <span className={`flex-shrink-0 px-2.5 py-0.5 text-xs font-bold rounded-full ${
              post.status === "published" ? "bg-green-100 text-green-700" : "bg-[#FFBE0B]/20 text-[#38200D]"
            }`}>
              {post.status === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#38200D]/40">
            <span>
              By <span className="font-medium text-[#38200D]/60">{author?.name ?? "Unknown"}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-[#38200D]/20" />
            <span>
              {post.status === "published" && post.publishedAt
                ? `Published ${post.publishedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : `Created ${post.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#38200D]/20" />
            <span>{post.readingTime} min read</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {post.status === "published" && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 border border-[#38200D]/15 text-[#38200D]/60 text-sm font-medium rounded-xl hover:bg-[#38200D]/5 hover:text-[#38200D] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Post
            </Link>
          )}
          <DeletePostButton postId={post.id} postTitle={post.title} />
        </div>
      </div>

      <div className="h-px bg-[#38200D]/8 mb-6" />

      <PostForm postId={post.id} initialData={initialData} />

      {/* Danger zone */}
      <div className="mt-10 border border-red-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
        </div>
        <div className="px-6 py-5 bg-white flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#38200D]">Delete this post</p>
            <p className="text-xs text-[#38200D]/50 mt-0.5">
              Once deleted, this post and all its content will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <DeletePostButton postId={post.id} postTitle={post.title} variant="danger" />
        </div>
      </div>
    </main>
  );
}
