import Link from "next/link";
import Image from "next/image";
import { mockPosts } from "@/lib/mock-data";

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#38200D]/10 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#38200D]">{value}</p>
        <p className="text-sm text-[#38200D]/50">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const totalPosts = mockPosts.length;
  const publishedPosts = mockPosts.length; // all mock posts are published
  const totalTags = [...new Set(mockPosts.flatMap((p) => p.tags))].length;
  const totalReadingTime = mockPosts.reduce((acc, p) => acc + p.readingTime, 0);

  const recentPosts = mockPosts.slice(0, 5);

  return (
    <main className="flex-1 px-6 py-8 overflow-y-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#38200D]">Dashboard</h1>
          <p className="text-sm text-[#38200D]/50 mt-0.5">
            Welcome back! Here&apos;s what&apos;s happening with your blog.
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Posts"
          value={totalPosts}
          color="bg-[#FB5607]/10"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FB5607" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <StatCard
          label="Published"
          value={publishedPosts}
          color="bg-green-50"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard
          label="Unique Tags"
          value={totalTags}
          color="bg-[#FFBE0B]/15"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          }
        />
        <StatCard
          label="Total Read Time"
          value={`${totalReadingTime} min`}
          color="bg-[#3A86FF]/10"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A86FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#38200D]/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#38200D]/10">
            <h2 className="font-semibold text-[#38200D]">Recent Posts</h2>
            <Link href="/admin/posts" className="text-xs text-[#FB5607] hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[#38200D]/5">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FFF8F2] transition-colors">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#FFF8F2]">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#38200D] truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#38200D]/40">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#38200D]/20" />
                    <span className="text-xs text-[#38200D]/40">{post.readingTime} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Published
                  </span>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="p-1.5 text-[#38200D]/40 hover:text-[#FB5607] hover:bg-[#FB5607]/10 rounded-lg transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Tags */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5">
            <h2 className="font-semibold text-[#38200D] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Write New Post", href: "/admin/posts/new", color: "bg-[#FB5607] text-white hover:bg-[#FB5607]/90", icon: "✏️" },
                { label: "Manage Posts", href: "/admin/posts", color: "bg-[#FFF8F2] text-[#38200D] hover:bg-[#FFBE0B]/20 border border-[#38200D]/10", icon: "📄" },
                { label: "Edit About Me", href: "/admin/about", color: "bg-[#FFF8F2] text-[#38200D] hover:bg-[#3A86FF]/10 border border-[#38200D]/10", icon: "👤" },
                { label: "View Blog", href: "/", color: "bg-[#FFF8F2] text-[#38200D] hover:bg-[#38200D]/5 border border-[#38200D]/10", icon: "🌐" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${action.color}`}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#38200D]/10 p-5">
            <h2 className="font-semibold text-[#38200D] mb-3">Tags Overview</h2>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(mockPosts.flatMap((p) => p.tags))].map((tag) => {
                const count = mockPosts.filter((p) => p.tags.includes(tag)).length;
                return (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFBE0B]/15 text-[#38200D] text-xs font-medium rounded-full border border-[#FFBE0B]/30">
                    {tag}
                    <span className="w-4 h-4 bg-[#FFBE0B]/40 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
