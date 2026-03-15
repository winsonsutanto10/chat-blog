import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { getPostBySlug, getRelatedPosts, getAllPublishedSlugs } from "@/db/queries/posts";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Render markdown-ish content with basic formatting
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let codeBlock: string[] = [];
  let inCode = false;
  let codeKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCode) {
        elements.push(
          <pre
            key={`code-${codeKey++}`}
            className="bg-[#38200D] text-[#FF995D] rounded-xl p-4 overflow-x-auto text-sm leading-relaxed my-4 font-mono"
          >
            <code>{codeBlock.join("\n")}</code>
          </pre>
        );
        codeBlock = [];
        inCode = false;
      } else {
        inCode = true;
      }
      i++;
      continue;
    }

    if (inCode) {
      codeBlock.push(line);
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-[#38200D] text-2xl font-bold mt-8 mb-3 border-l-4 border-[#FB5607] pl-4"
        >
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-[#38200D] text-xl font-semibold mt-6 mb-2">
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("| ")) {
      // Table
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("| ")) {
        tableLines.push(lines[i]);
        i++;
      }
      const [headerRow, , ...dataRows] = tableLines;
      const headers = headerRow.split("|").filter((c) => c.trim());
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#38200D] text-white">
                {headers.map((h, idx) => (
                  <th key={idx} className="px-4 py-2 text-left font-semibold">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIdx) => {
                const cells = row.split("|").filter((c) => c.trim());
                return (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? "bg-white" : "bg-[#FFF8F2]"}
                  >
                    {cells.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 border-b border-[#38200D]/10 text-[#38200D]/80"
                      >
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith("- **")) {
      // Bold list item
      const match = line.match(/- \*\*(.+?)\*\*:? ?(.*)/);
      if (match) {
        elements.push(
          <li key={i} className="text-[#38200D]/80 text-base leading-relaxed my-1 ml-4">
            <span className="font-semibold text-[#FB5607]">{match[1]}</span>
            {match[2] ? `: ${match[2]}` : ""}
          </li>
        );
      }
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="text-[#38200D]/80 text-base leading-relaxed my-1 ml-4 list-disc">
          {line.replace(/^[-*] /, "")}
        </li>
      );
    } else if (line.trim() === "") {
      // Skip blank lines
    } else {
      elements.push(
        <p key={i} className="text-[#38200D]/80 text-base leading-relaxed my-3">
          {line}
        </p>
      );
    }

    i++;
  }

  return elements;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.slug, post.tags);

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Header />

      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 w-full">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#38200D]/40 via-transparent to-[#FFF8F2]" />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">

        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-xl shadow-[#38200D]/5 p-6 sm:p-10 mb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#38200D]/40 mb-5">
            <Link href="/" className="hover:text-[#FB5607] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#FB5607] font-medium truncate">{post.title}</span>
          </nav>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-[#FFBE0B]/20 text-[#38200D] text-xs font-semibold rounded-full border border-[#FFBE0B]/40"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-[#38200D] text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-5">
            {post.title}
          </h1>

          {/* Author + Meta */}
          <div className="flex items-center gap-4 pb-6 border-b border-[#38200D]/10">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={48}
              height={48}
              className="rounded-full ring-2 ring-[#FB5607]/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[#38200D] font-semibold text-sm">{post.author.name}</p>
              <p className="text-[#38200D]/50 text-xs">{post.author.bio}</p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-[#38200D]/50">
              <span>{formatDate(post.publishedAt)}</span>
              <div className="flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            {renderContent(post.content)}
          </div>
        </article>

        {/* Share + Back */}
        <div className="flex items-center justify-between mb-14 px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#38200D]/60 hover:text-[#FB5607] transition-colors text-sm font-medium"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to all posts
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[#38200D]/40 text-xs">Share:</span>
            {[
              {
                label: "Twitter",
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/blog/${post.slug}`)}`,
              },
              {
                label: "LinkedIn",
                href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/blog/${post.slug}`)}`,
              },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#3A86FF] text-white text-xs font-semibold rounded-full hover:bg-[#3A86FF]/80 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-[#38200D] text-xl font-bold">Related Posts</h2>
              <div className="flex-1 h-px bg-[#38200D]/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedPosts.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
