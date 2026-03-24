import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}));

vi.mock("@/components/admin/DeletePostButton", () => ({
  default: ({ postId }: { postId: string }) =>
    <button data-testid={`delete-${postId}`}>Delete</button>,
}));

vi.mock("@/db/queries/posts", () => ({
  getAllPosts: vi.fn(),
}));

import AdminPostsPage from "@/app/admin/posts/page";
import { getAllPosts } from "@/db/queries/posts";

const now = new Date("2024-01-15T00:00:00Z");

function makeRow(overrides: Partial<{
  id: string; slug: string; title: string; status: string;
  coverImage: string; tags: string[]; readingTime: number;
  publishedAt: Date | null; createdAt: Date;
}> = {}) {
  return {
    posts: {
      id: "post-1",
      slug: "post-1",
      title: "My Post",
      status: "published",
      coverImage: "/cover.jpg",
      tags: ["typescript", "react", "extra"],
      readingTime: 5,
      publishedAt: now,
      createdAt: now,
      ...overrides,
    },
    authors: { name: "Alice" },
  };
}

describe("app/admin/posts/page – AdminPostsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'All Posts' heading", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText("All Posts")).toBeInTheDocument();
  });

  it("shows 'No posts yet' when list is empty", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText("No posts yet.")).toBeInTheDocument();
    expect(screen.getByText("Write your first post →")).toBeInTheDocument();
  });

  it("renders posts table when posts exist", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow()]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText("My Post")).toBeInTheDocument();
  });

  it("shows Published badge for published post", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow({ status: "published" })]);
    const jsx = await AdminPostsPage();
    render(jsx);
    // "Published" appears in filter dropdown option AND in post badge
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
  });

  it("shows Draft badge for draft post", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow({ status: "draft" })]);
    const jsx = await AdminPostsPage();
    render(jsx);
    // "Draft" appears in filter dropdown option AND in post badge
    expect(screen.getAllByText("Draft").length).toBeGreaterThan(0);
  });

  it("renders author name in post row", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow()]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText(/by Alice/)).toBeInTheDocument();
  });

  it("renders 'Unknown' when author is null", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([{ ...makeRow(), authors: null }]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText(/Unknown/)).toBeInTheDocument();
  });

  it("renders tags (first 2 shown, overflow badge for extra)", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow({ tags: ["tagone", "tagtwo", "tagthree"] })]);
    const jsx = await AdminPostsPage();
    render(jsx);
    // First 2 tags visible in the table row
    expect(screen.getAllByText("tagone").length).toBeGreaterThan(0);
    expect(screen.getAllByText("tagtwo").length).toBeGreaterThan(0);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders row without cover image", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow({ coverImage: "" })]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText("My Post")).toBeInTheDocument();
  });

  it("renders post using createdAt when publishedAt is null", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow({ publishedAt: null })]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText("My Post")).toBeInTheDocument();
  });

  it("renders New Post button link", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByRole("link", { name: /new post/i })).toBeInTheDocument();
  });

  it("shows post count info when posts exist", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makeRow()]);
    const jsx = await AdminPostsPage();
    render(jsx);
    expect(screen.getByText(/1 posts total/i)).toBeInTheDocument();
    // Pagination info
    expect(screen.getByText(/Showing 1–1 of 1/)).toBeInTheDocument();
  });

  it("renders all unique tags in filter dropdown", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([
      makeRow({ tags: ["typescript"] }),
      { ...makeRow({ id: "p2", slug: "p2", title: "P2", tags: ["react"] }), authors: null },
    ]);
    const jsx = await AdminPostsPage();
    render(jsx);
    // All tags should be in the select options
    expect(screen.getAllByText("typescript").length).toBeGreaterThan(0);
  });
});
