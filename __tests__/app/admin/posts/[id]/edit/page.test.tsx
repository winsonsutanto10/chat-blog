import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, target, className }: { href: string; children: React.ReactNode; target?: string; className?: string }) =>
    <a href={href} target={target} className={className}>{children}</a>,
}));

vi.mock("@/components/admin/PostForm", () => ({
  default: ({ postId, initialData }: { postId?: string; initialData?: unknown }) => (
    <div data-testid="post-form" data-post-id={postId ?? ""}>
      PostForm
    </div>
  ),
}));

vi.mock("@/components/admin/DeletePostButton", () => ({
  default: ({ postId, postTitle, variant }: { postId: string; postTitle: string; variant?: string }) => (
    <button data-testid={`delete-${variant ?? "default"}`} data-post-id={postId}>
      Delete {postTitle}
    </button>
  ),
}));

vi.mock("@/db/queries/posts", () => ({
  getPostById: vi.fn(),
}));

const { mockNotFound } = vi.hoisted(() => ({
  mockNotFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
}));
vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

import EditPostPage from "@/app/admin/posts/[id]/edit/page";
import { getPostById } from "@/db/queries/posts";

const now = new Date("2024-03-01T00:00:00Z");

function makeRow(overrides: Partial<{
  id: string; slug: string; title: string; status: string;
  excerpt: string; content: string; coverImage: string;
  tags: string[]; readingTime: number;
  publishedAt: Date | null; createdAt: Date;
}> = {}) {
  return {
    posts: {
      id: "post-1",
      slug: "my-post",
      title: "My Post Title",
      status: "published",
      excerpt: "An excerpt",
      content: "  Some content  ",
      coverImage: "/cover.jpg",
      tags: ["typescript"],
      readingTime: 5,
      publishedAt: now,
      createdAt: now,
      ...overrides,
    },
    authors: { name: "Alice" },
  };
}

describe("app/admin/posts/[id]/edit/page – EditPostPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls notFound when post is not found", async () => {
    vi.mocked(getPostById).mockResolvedValue(undefined);
    await expect(
      EditPostPage({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("renders post title in heading", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow());
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getAllByText("My Post Title").length).toBeGreaterThan(0);
  });

  it("renders breadcrumb links", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow());
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Posts")).toBeInTheDocument();
  });

  it("renders Published badge for published post", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow({ status: "published" }));
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders Draft badge for draft post", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow({ status: "draft" }));
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders author name", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow());
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders 'Unknown' when author is null", async () => {
    vi.mocked(getPostById).mockResolvedValue({ ...makeRow(), authors: null });
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("renders published date when status is published and publishedAt set", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow({ status: "published", publishedAt: now }));
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText(/Published March 1, 2024/)).toBeInTheDocument();
  });

  it("renders created date when status is draft", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow({ status: "draft", publishedAt: null }));
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText(/Created March 1, 2024/)).toBeInTheDocument();
  });

  it("renders reading time", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow({ readingTime: 7 }));
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("7 min read")).toBeInTheDocument();
  });

  it("renders 'View Post' link for published posts", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow({ status: "published", slug: "my-post" }));
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("View Post")).toBeInTheDocument();
    expect(screen.getByText("View Post").closest("a")).toHaveAttribute("href", "/blog/my-post");
  });

  it("does not render 'View Post' link for draft posts", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow({ status: "draft" }));
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.queryByText("View Post")).not.toBeInTheDocument();
  });

  it("renders PostForm with postId", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow());
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    const form = screen.getByTestId("post-form");
    expect(form).toBeInTheDocument();
    expect(form.getAttribute("data-post-id")).toBe("post-1");
  });

  it("renders Danger Zone section", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow());
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    expect(screen.getByText("Delete this post")).toBeInTheDocument();
  });

  it("renders two delete buttons (header and danger zone)", async () => {
    vi.mocked(getPostById).mockResolvedValue(makeRow());
    const jsx = await EditPostPage({ params: Promise.resolve({ id: "post-1" }) });
    render(jsx);
    expect(screen.getByTestId("delete-default")).toBeInTheDocument();
    expect(screen.getByTestId("delete-danger")).toBeInTheDocument();
  });
});
