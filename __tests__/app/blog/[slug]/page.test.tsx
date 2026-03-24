import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}));

vi.mock("@/components/Header", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock("@/components/BlogCard", () => ({
  default: ({ post }: { post: { id: string; title: string } }) =>
    <div data-testid={`blog-card-${post.id}`}>{post.title}</div>,
}));

vi.mock("@/db/queries/posts", () => ({
  getPostBySlug: vi.fn(),
  getRelatedPosts: vi.fn(),
  getAllPublishedSlugs: vi.fn(),
}));

const { mockNotFound } = vi.hoisted(() => ({
  mockNotFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
}));
vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

import BlogDetailPage, { generateStaticParams } from "@/app/blog/[slug]/page";
import { getPostBySlug, getRelatedPosts, getAllPublishedSlugs } from "@/db/queries/posts";
import type { BlogPost } from "@/types/blog";

const makePost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: "post-1",
  slug: "my-post",
  title: "My Awesome Post",
  excerpt: "A great excerpt",
  content: "Simple paragraph content.",
  coverImage: "/cover.jpg",
  author: { name: "Alice", avatar: "/av.jpg", bio: "Developer" },
  publishedAt: "2024-01-15T00:00:00Z",
  readingTime: 5,
  tags: ["typescript", "react"],
  featured: false,
  ...overrides,
});

// Content with all markdown-like syntax branches
const richContent = `## Main Heading

### Sub Heading

- Regular list item
- * starred list item

- **Bold item**: description here
- **Bold only**
- **unclosed bold

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

\`\`\`javascript
const x = 1;
\`\`\`

Plain paragraph text.

`;

describe("app/blog/[slug]/page – BlogDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRelatedPosts).mockResolvedValue([]);
  });

  it("calls notFound() when post not found", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(undefined);
    await expect(
      BlogDetailPage({ params: Promise.resolve({ slug: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("renders post title", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    // Title appears in both breadcrumb span and h1
    expect(screen.getAllByText("My Awesome Post").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "My Awesome Post" })).toBeInTheDocument();
  });

  it("renders author information", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders post tags", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  it("renders reading time", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });

  it("renders cover image when present", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    const img = screen.getAllByRole("img").find(
      (el) => el.getAttribute("src") === "/cover.jpg"
    );
    expect(img).toBeInTheDocument();
  });

  it("does not render cover image section when coverImage is empty", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost({ coverImage: "" }));
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    const { container } = render(jsx);
    // No cover image img tag should exist with empty src
    const imgs = container.querySelectorAll("img");
    const hasCoverImg = Array.from(imgs).some((img) => img.getAttribute("src") === "");
    expect(hasCoverImg).toBe(false);
  });

  it("renders share links (Twitter, LinkedIn)", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.getByText("Twitter")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("renders related posts section when related posts exist", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    vi.mocked(getRelatedPosts).mockResolvedValue([
      makePost({ id: "related-1", slug: "related-1", title: "Related Post" }),
    ]);
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.getByText("Related Posts")).toBeInTheDocument();
    expect(screen.getByTestId("blog-card-related-1")).toBeInTheDocument();
  });

  it("does not render related posts section when none exist", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    vi.mocked(getRelatedPosts).mockResolvedValue([]);
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.queryByText("Related Posts")).not.toBeInTheDocument();
  });

  it("renders all markdown-like content types", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost({ content: richContent }));
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);

    expect(screen.getByText("Main Heading")).toBeInTheDocument();
    expect(screen.getByText("Sub Heading")).toBeInTheDocument();
    expect(screen.getByText("Regular list item")).toBeInTheDocument();
    // Line "- * starred list item" renders as "* starred list item" (the "- " prefix is stripped)
    expect(screen.getByText("* starred list item")).toBeInTheDocument();
    expect(screen.getByText("Bold item")).toBeInTheDocument();
    // "description here" is a text node inside the <li> after <span>Bold item</span>
    expect(screen.getByText(/description here/)).toBeInTheDocument();
    expect(screen.getByText("Bold only")).toBeInTheDocument();
    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
    expect(screen.getByText("Plain paragraph text.")).toBeInTheDocument();
  });

  it("renders formatted date", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });

  it("renders author bio", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(makePost());
    const jsx = await BlogDetailPage({ params: Promise.resolve({ slug: "my-post" }) });
    render(jsx);
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });
});

describe("app/blog/[slug]/page – generateStaticParams", () => {
  it("returns slug params from published posts", async () => {
    vi.mocked(getAllPublishedSlugs).mockResolvedValue(["post-1", "post-2"]);
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: "post-1" }, { slug: "post-2" }]);
  });

  it("returns empty array when no published posts", async () => {
    vi.mocked(getAllPublishedSlugs).mockResolvedValue([]);
    const params = await generateStaticParams();
    expect(params).toEqual([]);
  });
});
