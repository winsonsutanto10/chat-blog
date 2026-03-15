"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/app/actions/posts";

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: "draft" | "published";
}

interface PostFormProps {
  postId?: string;
  initialData?: Partial<PostFormData>;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function PostForm({ postId, initialData }: PostFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    coverImage: initialData?.coverImage ?? "",
    tags: initialData?.tags ?? [],
    status: initialData?.status ?? "draft",
  });
  const [tagInput, setTagInput] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (!slugEdited && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugEdited]);

  const set = (field: keyof PostFormData, value: string | string[]) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      set("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    set("tags", form.tags.filter((t) => t !== tag));

  const handleSave = async (status: "draft" | "published") => {
    setSaved("saving");
    setError("");
    const data = { ...form, status };

    const result = postId
      ? await updatePost(postId, data)
      : await createPost(data);

    if (result.success) {
      setSaved("saved");
      setTimeout(() => setSaved("idle"), 3000);
      if (!postId) {
        router.push(`/admin/posts/${result.id}/edit`);
      }
    } else {
      setSaved("idle");
      setError(result.error);
    }
  };

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedRead = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex gap-6 h-full">
      {/* Main editor area */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Post title..."
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full text-2xl font-bold text-[#38200D] placeholder-[#38200D]/25 bg-transparent border-none outline-none focus:ring-0 leading-tight"
          />
          <div className="h-px bg-[#38200D]/10 mt-2" />
        </div>

        {/* Slug */}
        <div className="flex items-center gap-2 bg-white border border-[#38200D]/10 rounded-xl px-4 py-2">
          <span className="text-[#38200D]/40 text-sm font-mono">/blog/</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true);
              set("slug", slugify(e.target.value));
            }}
            className="flex-1 text-sm font-mono text-[#FB5607] bg-transparent outline-none"
            placeholder="post-slug"
          />
          <button
            onClick={() => { setSlugEdited(false); set("slug", slugify(form.title)); }}
            className="text-xs text-[#38200D]/40 hover:text-[#FB5607] transition-colors"
            title="Reset slug from title"
          >
            ↺ reset
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 bg-white border border-[#38200D]/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 pt-3 pb-0 border-b border-[#38200D]/10">
            <div className="flex gap-1">
              {(["write", "preview"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-[#FB5607] text-white"
                      : "text-[#38200D]/50 hover:text-[#38200D]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-xs text-[#38200D]/40 pr-1 pb-2">
              {wordCount} words · ~{estimatedRead} min read
            </div>
          </div>

          {activeTab === "write" ? (
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={`Write your post in Markdown...\n\n## Heading\n\nYour content here...`}
              className="flex-1 w-full p-5 text-sm text-[#38200D]/80 font-mono leading-relaxed resize-none outline-none min-h-[420px]"
            />
          ) : (
            <div className="flex-1 p-5 overflow-y-auto prose max-w-none min-h-[420px]">
              {form.content ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-[#38200D]/80 leading-relaxed">
                  {form.content}
                </pre>
              ) : (
                <p className="text-[#38200D]/30 italic text-sm">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div className="bg-white border border-[#38200D]/10 rounded-2xl p-4">
          <label className="block text-xs font-semibold text-[#38200D]/60 uppercase tracking-wider mb-2">
            Excerpt / Summary
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="A short description shown in the blog listing..."
            className="w-full text-sm text-[#38200D]/80 bg-transparent resize-none outline-none leading-relaxed placeholder-[#38200D]/25"
          />
          <p className="text-right text-xs text-[#38200D]/30 mt-1">
            {form.excerpt.length}/280
          </p>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4">
        {/* Publish actions */}
        <div className="bg-white border border-[#38200D]/10 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[#38200D] mb-3">Publish</h3>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#38200D]/60">Status</span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
              form.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-[#FFBE0B]/20 text-[#38200D]"
            }`}>
              {form.status === "published" ? "Published" : "Draft"}
            </span>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleSave("draft")}
              className="flex-1 px-3 py-2 border border-[#38200D]/20 text-[#38200D] text-sm font-medium rounded-xl hover:bg-[#38200D]/5 transition-colors"
            >
              {saved === "saving" ? "Saving..." : saved === "saved" ? "Saved!" : "Save Draft"}
            </button>
            <button
              onClick={() => handleSave("published")}
              className="flex-1 px-3 py-2 bg-[#FB5607] text-white text-sm font-semibold rounded-xl hover:bg-[#FB5607]/90 transition-colors shadow-lg shadow-[#FB5607]/20"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white border border-[#38200D]/10 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[#38200D] mb-3">Cover Image</h3>
          <input
            type="text"
            placeholder="https://..."
            value={form.coverImage}
            onChange={(e) => { set("coverImage", e.target.value); setImgError(false); }}
            className="w-full text-xs text-[#38200D]/70 bg-[#FFF8F2] border border-[#38200D]/10 rounded-lg px-3 py-2 outline-none focus:border-[#FB5607]/40 mb-3"
          />
          {form.coverImage && !imgError ? (
            <div className="relative h-36 rounded-xl overflow-hidden bg-[#FFF8F2]">
              <Image
                src={form.coverImage}
                alt="Cover preview"
                fill
                className="object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="h-36 rounded-xl bg-[#FFF8F2] border-2 border-dashed border-[#38200D]/10 flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto mb-1 text-[#38200D]/20" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-xs text-[#38200D]/30">
                  {imgError ? "Invalid image URL" : "Preview will appear here"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="bg-white border border-[#38200D]/10 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-[#38200D] mb-3">Tags</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 text-sm text-[#38200D]/70 bg-[#FFF8F2] border border-[#38200D]/10 rounded-lg px-3 py-1.5 outline-none focus:border-[#FB5607]/40"
            />
            <button
              onClick={addTag}
              className="px-3 py-1.5 bg-[#FFBE0B] text-[#38200D] text-sm font-semibold rounded-lg hover:bg-[#FFBE0B]/80 transition-colors"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFBE0B]/20 text-[#38200D] text-xs font-medium rounded-full border border-[#FFBE0B]/30"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-[#38200D]/40 hover:text-[#FB5607] transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            {form.tags.length === 0 && (
              <p className="text-xs text-[#38200D]/30 italic">No tags yet</p>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="bg-white border border-[#38200D]/10 rounded-2xl p-4 text-xs text-[#38200D]/50 space-y-1.5">
          <div className="flex justify-between">
            <span>Word count</span><span className="font-medium text-[#38200D]">{wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Est. reading time</span><span className="font-medium text-[#38200D]">{estimatedRead} min</span>
          </div>
          <div className="flex justify-between">
            <span>Excerpt length</span><span className="font-medium text-[#38200D]">{form.excerpt.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
