import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogCard from "@/components/BlogCard";
import type { BlogPost } from "@/types/blog";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}));

const mockPost: BlogPost = {
  id: "post-1",
  slug: "my-post",
  title: "My Awesome Post",
  excerpt: "A short excerpt about the post",
  content: "Full content here",
  coverImage: "/cover.jpg",
  author: {
    name: "Alice",
    avatar: "/avatar.jpg",
    bio: "Developer",
  },
  publishedAt: "2024-01-15T00:00:00Z",
  readingTime: 5,
  tags: ["typescript", "react", "next.js"],
  featured: false,
};

describe("components/BlogCard", () => {
  describe("regular card (featured=false)", () => {
    it("renders post title", () => {
      render(<BlogCard post={mockPost} />);
      expect(screen.getByText("My Awesome Post")).toBeInTheDocument();
    });

    it("renders excerpt", () => {
      render(<BlogCard post={mockPost} />);
      expect(screen.getByText("A short excerpt about the post")).toBeInTheDocument();
    });

    it("renders author name", () => {
      render(<BlogCard post={mockPost} />);
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("renders reading time", () => {
      render(<BlogCard post={mockPost} />);
      expect(screen.getByText("5 min")).toBeInTheDocument();
    });

    it("renders first tag as cover overlay", () => {
      render(<BlogCard post={mockPost} />);
      expect(screen.getByText("typescript")).toBeInTheDocument();
    });

    it("renders additional tags in card body", () => {
      render(<BlogCard post={mockPost} />);
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("next.js")).toBeInTheDocument();
    });

    it("links to the correct blog post URL", () => {
      render(<BlogCard post={mockPost} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/blog/my-post");
    });

    it("does not render cover image when coverImage is empty", () => {
      const postWithoutCover = { ...mockPost, coverImage: "" };
      render(<BlogCard post={postWithoutCover} />);
      // Should still render without crashing
      expect(screen.getByText("My Awesome Post")).toBeInTheDocument();
    });

    it("handles post with no additional tags (slice(1) is empty)", () => {
      const postOneTag = { ...mockPost, tags: ["only-one"] };
      render(<BlogCard post={postOneTag} />);
      expect(screen.getByText("only-one")).toBeInTheDocument();
    });
  });

  describe("featured card (featured=true)", () => {
    it("renders 'Featured' badge", () => {
      render(<BlogCard post={mockPost} featured />);
      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("renders post title", () => {
      render(<BlogCard post={mockPost} featured />);
      expect(screen.getByText("My Awesome Post")).toBeInTheDocument();
    });

    it("renders excerpt", () => {
      render(<BlogCard post={mockPost} featured />);
      expect(screen.getByText("A short excerpt about the post")).toBeInTheDocument();
    });

    it("renders author name", () => {
      render(<BlogCard post={mockPost} featured />);
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("renders formatted date", () => {
      render(<BlogCard post={mockPost} featured />);
      // Should render a date string containing "2024"
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it("renders reading time with 'min read'", () => {
      render(<BlogCard post={mockPost} featured />);
      expect(screen.getByText(/5 min read/)).toBeInTheDocument();
    });

    it("renders first two tags", () => {
      render(<BlogCard post={mockPost} featured />);
      expect(screen.getByText("typescript")).toBeInTheDocument();
      expect(screen.getByText("react")).toBeInTheDocument();
    });

    it("links to correct blog post URL", () => {
      render(<BlogCard post={mockPost} featured />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/blog/my-post");
    });
  });
});
