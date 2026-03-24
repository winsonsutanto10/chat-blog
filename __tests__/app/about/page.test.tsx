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

vi.mock("@/db/queries/authors", () => ({
  getAuthor: vi.fn(),
}));

vi.mock("@/db/queries/posts", () => ({
  getAllPublishedPosts: vi.fn(),
}));

import AboutPage from "@/app/about/page";
import { getAuthor } from "@/db/queries/authors";
import { getAllPublishedPosts } from "@/db/queries/posts";
import type { Author } from "@/db/schema";
import type { BlogPost } from "@/types/blog";

const mockAuthor: Author = {
  id: "author-1",
  name: "Alice Smith",
  title: "Full-Stack Developer",
  avatar: "/avatar.jpg",
  bio: "Short bio",
  longBio: "First paragraph.\n\nSecond paragraph.",
  email: "alice@example.com",
  location: "New York",
  skills: ["TypeScript", "React"],
  socialTwitter: "https://twitter.com/alice",
  socialGithub: "https://github.com/alice",
  socialLinkedin: "https://linkedin.com/in/alice",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "post-1",
    title: "First Post",
    excerpt: "Excerpt",
    content: "Content",
    coverImage: "/cover.jpg",
    author: { name: "Alice", avatar: "/av.jpg", bio: "Bio" },
    publishedAt: "2024-01-01T00:00:00Z",
    readingTime: 5,
    tags: ["typescript", "react"],
  },
  {
    id: "post-2",
    slug: "post-2",
    title: "Second Post",
    excerpt: "Excerpt",
    content: "Content",
    coverImage: "/cover2.jpg",
    author: { name: "Alice", avatar: "/av.jpg", bio: "Bio" },
    publishedAt: "2024-02-01T00:00:00Z",
    readingTime: 3,
    tags: ["css"],
  },
];

describe("app/about/page – AboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'Profile not set up yet' when no author", async () => {
    vi.mocked(getAuthor).mockResolvedValue(null);
    vi.mocked(getAllPublishedPosts).mockResolvedValue([]);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("Profile not set up yet.")).toBeInTheDocument();
  });

  it("renders author name and title", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Full-Stack Developer")).toBeInTheDocument();
  });

  it("renders bio paragraphs from longBio", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
  });

  it("renders skills", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders social links", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("Twitter / X")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("renders stats: post count, read time, topics", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);

    // 2 articles, 8+ minutes, 3 topics
    expect(screen.getByText("2")).toBeInTheDocument(); // article count
    expect(screen.getByText("8+")).toBeInTheDocument(); // total read time
  });

  it("renders latest posts in sidebar", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("Latest Posts")).toBeInTheDocument();
    expect(screen.getByText("First Post")).toBeInTheDocument();
  });

  it("renders contact CTA with email", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("Send a message")).toBeInTheDocument();
  });

  it("renders location and email in hero", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
    vi.mocked(getAllPublishedPosts).mockResolvedValue(mockPosts);

    const jsx = await AboutPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });
});
