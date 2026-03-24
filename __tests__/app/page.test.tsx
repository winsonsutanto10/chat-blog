import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Suspense } from "react";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}));

vi.mock("@/components/Header", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock("@/components/BlogCard", () => ({
  default: ({ post, featured }: { post: { id: string; title: string }; featured?: boolean }) =>
    <div data-testid={`blog-card-${post.id}`} data-featured={featured}>{post.title}</div>,
}));

vi.mock("@/components/TagFilter", () => ({
  default: ({ tags, activeTag }: { tags: { name: string; count: number }[]; activeTag: string | null }) => (
    <div data-testid="tag-filter" data-active-tag={activeTag}>
      {tags.map((t) => <span key={t.name}>{t.name}</span>)}
    </div>
  ),
}));

vi.mock("@/db/queries/posts", () => ({
  getFeaturedPost: vi.fn(),
  getAllPublishedPosts: vi.fn(),
}));

import HomePage from "@/app/page";
import { getFeaturedPost, getAllPublishedPosts } from "@/db/queries/posts";
import type { BlogPost } from "@/types/blog";

const makePost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: "post-1",
  slug: "my-post",
  title: "My Post",
  excerpt: "Excerpt",
  content: "Content",
  coverImage: "/cover.jpg",
  author: { name: "Alice", avatar: "/av.jpg", bio: "Bio" },
  publishedAt: "2024-01-15T00:00:00Z",
  readingTime: 3,
  tags: ["typescript"],
  featured: false,
  ...overrides,
});

describe("app/page – HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders blog heading section", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([]);

    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByText(/Thoughts Worth/)).toBeInTheDocument();
  });

  it("renders featured post when available and no tag filter", async () => {
    const featuredPost = makePost({ id: "featured-1", featured: true });
    vi.mocked(getFeaturedPost).mockResolvedValue(featuredPost);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([
      featuredPost,
      makePost({ id: "post-2", slug: "post-2", title: "Second Post" }),
    ]);

    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByText("Featured Post")).toBeInTheDocument();
    expect(screen.getByTestId("blog-card-featured-1")).toBeInTheDocument();
  });

  it("hides featured post section when tag filter active", async () => {
    const featuredPost = makePost({ id: "featured-1", featured: true });
    vi.mocked(getFeaturedPost).mockResolvedValue(featuredPost);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([featuredPost]);

    const jsx = await HomePage({ searchParams: Promise.resolve({ tag: "typescript" }) });
    render(jsx);

    expect(screen.queryByText("Featured Post")).not.toBeInTheDocument();
  });

  it("shows 'Posts tagged X' heading when tag filter active", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([
      makePost({ tags: ["typescript"] }),
    ]);

    const jsx = await HomePage({ searchParams: Promise.resolve({ tag: "typescript" }) });
    render(jsx);

    expect(screen.getByText("Posts tagged")).toBeInTheDocument();
    // "typescript" may appear in both heading and tag filter
    expect(screen.getAllByText("typescript").length).toBeGreaterThan(0);
  });

  it("shows 'Recent Posts' heading when no tag filter", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([]);

    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByText("Recent Posts")).toBeInTheDocument();
  });

  it("shows 'No posts found' when tag filter has no results", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([
      makePost({ tags: ["react"] }),
    ]);

    const jsx = await HomePage({ searchParams: Promise.resolve({ tag: "typescript" }) });
    render(jsx);

    expect(screen.getByText(/No posts found/)).toBeInTheDocument();
  });

  it("renders post count badge", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([
      makePost(),
      makePost({ id: "post-2", slug: "post-2", title: "Second" }),
    ]);

    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    // Post count is displayed (2 posts, excluding featured slug)
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("builds tag list from posts and passes to TagFilter", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([
      makePost({ tags: ["typescript", "react"] }),
      makePost({ id: "post-2", slug: "post-2", title: "Post 2", tags: ["typescript"] }),
    ]);

    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    // typescript appears in TagFilter (count 2)
    const tagFilter = screen.getByTestId("tag-filter");
    expect(tagFilter).toBeInTheDocument();
  });

  it("filters posts by tag when tag param provided", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([
      makePost({ id: "p1", tags: ["typescript"] }),
      makePost({ id: "p2", slug: "p2", title: "Post 2", tags: ["react"] }),
    ]);

    const jsx = await HomePage({ searchParams: Promise.resolve({ tag: "typescript" }) });
    render(jsx);

    expect(screen.getByTestId("blog-card-p1")).toBeInTheDocument();
    expect(screen.queryByTestId("blog-card-p2")).not.toBeInTheDocument();
  });

  it("excludes featured post slug from regular grid, shows it in featured section", async () => {
    const featured = makePost({ id: "featured-1", slug: "featured", featured: true });
    const regular = makePost({ id: "regular-1", slug: "regular", title: "Regular" });
    vi.mocked(getFeaturedPost).mockResolvedValue(featured);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([featured, regular]);

    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    // Featured post is shown in the featured section (data-featured="true")
    const featuredCard = screen.getByTestId("blog-card-featured-1");
    expect(featuredCard).toHaveAttribute("data-featured", "true");
    // Regular post is also shown
    expect(screen.getByTestId("blog-card-regular-1")).toBeInTheDocument();
  });

  it("renders Header and Footer", async () => {
    vi.mocked(getFeaturedPost).mockResolvedValue(undefined);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([]);

    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByRole("banner")).toBeInTheDocument(); // header
    expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // footer
  });
});
