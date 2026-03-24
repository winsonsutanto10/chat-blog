import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/admin/PostForm", () => ({
  default: ({ postId, initialData }: { postId?: string; initialData?: unknown }) => (
    <div data-testid="post-form" data-post-id={postId ?? ""}>
      PostForm
    </div>
  ),
}));

import NewPostPage from "@/app/admin/posts/new/page";

describe("app/admin/posts/new/page – NewPostPage", () => {
  it("renders 'New Post' heading", () => {
    render(<NewPostPage />);
    expect(screen.getByText("New Post")).toBeInTheDocument();
  });

  it("renders subtitle text", () => {
    render(<NewPostPage />);
    expect(screen.getByText("Write and publish a new blog article")).toBeInTheDocument();
  });

  it("renders PostForm component without postId", () => {
    render(<NewPostPage />);
    const form = screen.getByTestId("post-form");
    expect(form).toBeInTheDocument();
    expect(form.getAttribute("data-post-id")).toBe("");
  });
});
