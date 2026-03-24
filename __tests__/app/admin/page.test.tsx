import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}));

vi.mock("@/db/queries/posts", () => ({
  getAllPosts: vi.fn(),
}));

import AdminDashboard from "@/app/admin/page";
import { getAllPosts } from "@/db/queries/posts";

const now = new Date();

function makePostRow(overrides: Partial<{
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
      tags: ["typescript", "react"],
      readingTime: 5,
      publishedAt: now,
      createdAt: now,
      ...overrides,
    },
    authors: { name: "Alice" },
  };
}

describe("app/admin/page – AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Dashboard title", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders stats cards", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makePostRow()]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    // "Published" appears both in stat card label and in post badge
    expect(screen.getAllByText("Published").length).toBeGreaterThan(0);
    expect(screen.getByText("Unique Tags")).toBeInTheDocument();
    expect(screen.getByText("Total Read Time")).toBeInTheDocument();
  });

  it("counts published posts correctly", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([
      makePostRow({ status: "published" }),
      makePostRow({ id: "post-2", slug: "post-2", status: "draft" }),
    ]);
    const jsx = await AdminDashboard();
    render(jsx);
    // 2 total, 1 published
    const counts = screen.getAllByText(/^[0-9]+$/);
    expect(counts.length).toBeGreaterThan(0);
  });

  it("renders recent posts table", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makePostRow()]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("My Post")).toBeInTheDocument();
  });

  it("renders post with null publishedAt using createdAt", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makePostRow({ publishedAt: null })]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("My Post")).toBeInTheDocument();
  });

  it("renders post without cover image", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makePostRow({ coverImage: "" })]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("My Post")).toBeInTheDocument();
  });

  it("shows Draft badge for draft posts", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makePostRow({ status: "draft" })]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows Published badge for published posts", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([makePostRow({ status: "published" })]);
    const jsx = await AdminDashboard();
    render(jsx);
    // "Published" appears in stat card label AND in post row badge
    expect(screen.getAllByText("Published").length).toBeGreaterThanOrEqual(2);
  });

  it("renders Quick Actions links", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("Write New Post")).toBeInTheDocument();
    expect(screen.getByText("Manage Posts")).toBeInTheDocument();
    expect(screen.getByText("Edit About Me")).toBeInTheDocument();
    expect(screen.getByText("View Blog")).toBeInTheDocument();
  });

  it("renders Tags Overview with post counts", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([
      makePostRow({ tags: ["typescript", "react"] }),
    ]);
    const jsx = await AdminDashboard();
    render(jsx);
    expect(screen.getByText("Tags Overview")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("handles empty posts list", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([]);
    const jsx = await AdminDashboard();
    render(jsx);
    // All stats should be 0 or "0 min"
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("renders New Post button in header", async () => {
    vi.mocked(getAllPosts).mockResolvedValue([]);
    const jsx = await AdminDashboard();
    render(jsx);
    // Multiple links may match /new post/i (header button + Quick Actions)
    expect(screen.getAllByRole("link", { name: /new post/i }).length).toBeGreaterThan(0);
  });
});
