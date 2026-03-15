import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/types/blog";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden bg-[#38200D] hover:shadow-2xl hover:shadow-[#FB5607]/20 transition-all duration-300">
          <div className="relative h-72 sm:h-96 w-full">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#38200D] via-[#38200D]/60 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-0.5 bg-[#FB5607] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Featured
              </span>
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#FFBE0B]/20 text-[#FFBE0B] text-xs font-medium rounded-full border border-[#FFBE0B]/30"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-2 group-hover:text-[#FFBE0B] transition-colors">
              {post.title}
            </h2>
            <p className="text-[#FF995D] text-sm leading-relaxed mb-4 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-[#FB5607]"
              />
              <div>
                <p className="text-white text-sm font-medium">
                  {post.author.name}
                </p>
                <p className="text-[#FF995D] text-xs">
                  {formatDate(post.publishedAt)} · {post.readingTime} min read
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-[#38200D]/10 bg-white hover:border-[#FB5607]/30 hover:shadow-xl hover:shadow-[#FB5607]/10 transition-all duration-300">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {post.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#FFBE0B] text-[#38200D] text-xs font-bold rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-1 p-5">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(1).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#FB5607]/10 text-[#FB5607] text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-[#38200D] font-bold text-lg leading-snug mb-2 group-hover:text-[#FB5607] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-[#38200D]/60 text-sm leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#38200D]/10">
            <div className="flex items-center gap-2">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-[#38200D]/70 text-xs font-medium">
                {post.author.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#38200D]/40 text-xs">
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
              <span>{post.readingTime} min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
