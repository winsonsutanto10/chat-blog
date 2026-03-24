import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PostForm from "@/components/admin/PostForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock("@/app/actions/posts", () => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
}));

import { createPost, updatePost } from "@/app/actions/posts";

describe("components/admin/PostForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty form by default", () => {
    render(<PostForm />);
    expect(screen.getByPlaceholderText("Post title...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("post-slug")).toBeInTheDocument();
    expect(screen.getByText("Save Draft")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
  });

  it("renders with initial data", () => {
    render(
      <PostForm
        postId="post-1"
        initialData={{
          title: "Existing Post",
          slug: "existing-post",
          excerpt: "An excerpt",
          content: "Some content",
          coverImage: "/cover.jpg",
          tags: ["typescript"],
          status: "published",
        }}
      />
    );
    expect(screen.getByDisplayValue("Existing Post")).toBeInTheDocument();
    expect(screen.getByDisplayValue("existing-post")).toBeInTheDocument();
  });

  it("auto-generates slug from title", async () => {
    render(<PostForm />);
    const titleInput = screen.getByPlaceholderText("Post title...");
    fireEvent.change(titleInput, { target: { value: "Hello World Post" } });
    await waitFor(() => {
      expect(screen.getByDisplayValue("hello-world-post")).toBeInTheDocument();
    });
  });

  it("allows manual slug override", async () => {
    render(<PostForm />);
    const titleInput = screen.getByPlaceholderText("Post title...");
    fireEvent.change(titleInput, { target: { value: "My Post" } });

    const slugInput = screen.getByPlaceholderText("post-slug");
    fireEvent.change(slugInput, { target: { value: "custom-slug!" } });

    // After manual edit, slug reflects slugified input
    await waitFor(() => {
      expect((slugInput as HTMLInputElement).value).toBe("custom-slug");
    });
  });

  it("resets slug to title when reset button clicked", async () => {
    render(<PostForm />);
    const titleInput = screen.getByPlaceholderText("Post title...");
    fireEvent.change(titleInput, { target: { value: "My Post" } });

    const slugInput = screen.getByPlaceholderText("post-slug");
    fireEvent.change(slugInput, { target: { value: "custom" } });

    fireEvent.click(screen.getByTitle("Reset slug from title"));
    await waitFor(() => {
      expect((slugInput as HTMLInputElement).value).toBe("my-post");
    });
  });

  it("adds tag when + button clicked", async () => {
    render(<PostForm />);
    const tagInput = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(tagInput, { target: { value: "typescript" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("adds tag when Enter pressed in tag input", async () => {
    render(<PostForm />);
    const tagInput = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(tagInput, { target: { value: "react" } });
    fireEvent.keyDown(tagInput, { key: "Enter" });
    expect(screen.getByText("react")).toBeInTheDocument();
  });

  it("does not add duplicate tag", async () => {
    render(<PostForm />);
    const tagInput = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(tagInput, { target: { value: "typescript" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.change(tagInput, { target: { value: "typescript" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    const tags = screen.getAllByText("typescript");
    // "typescript" appears once in tag list (not twice)
    expect(tags.length).toBe(1);
  });

  it("removes tag when × clicked", async () => {
    render(<PostForm />);
    const tagInput = screen.getByPlaceholderText("Add a tag...");
    fireEvent.change(tagInput, { target: { value: "typescript" } });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("typescript")).toBeInTheDocument();

    fireEvent.click(screen.getByText("×"));
    expect(screen.queryByText("typescript")).not.toBeInTheDocument();
  });

  it("shows 'No tags yet' when no tags", () => {
    render(<PostForm />);
    expect(screen.getByText("No tags yet")).toBeInTheDocument();
  });

  it("switches between write and preview tabs", async () => {
    render(<PostForm />);
    const textarea = screen.getByPlaceholderText(/Write your post in Markdown/);
    fireEvent.change(textarea, { target: { value: "Hello world" } });

    fireEvent.click(screen.getByText("preview"));
    expect(screen.getByText("Hello world")).toBeInTheDocument();

    fireEvent.click(screen.getByText("write"));
    expect(screen.getByPlaceholderText(/Write your post in Markdown/)).toBeInTheDocument();
  });

  it("shows 'Nothing to preview yet' when content is empty in preview mode", () => {
    render(<PostForm />);
    fireEvent.click(screen.getByText("preview"));
    expect(screen.getByText("Nothing to preview yet.")).toBeInTheDocument();
  });

  it("shows cover image preview when URL is valid", async () => {
    render(<PostForm />);
    const coverInput = screen.getByPlaceholderText("https://...");
    fireEvent.change(coverInput, { target: { value: "https://example.com/image.jpg" } });
    await waitFor(() => {
      const img = screen.getAllByRole("img").find(
        (el) => el.getAttribute("src") === "https://example.com/image.jpg"
      );
      expect(img).toBeInTheDocument();
    });
  });

  it("shows placeholder when cover image URL is empty", () => {
    render(<PostForm />);
    expect(screen.getByText("Preview will appear here")).toBeInTheDocument();
  });

  it("shows invalid image URL message on image error", async () => {
    render(<PostForm />);
    const coverInput = screen.getByPlaceholderText("https://...");
    fireEvent.change(coverInput, { target: { value: "https://bad-url.com/img.jpg" } });

    await waitFor(() => {
      const img = screen.getAllByRole("img").find(
        (el) => el.getAttribute("src") === "https://bad-url.com/img.jpg"
      );
      expect(img).toBeDefined();
      if (img) fireEvent.error(img);
    });

    expect(screen.getByText("Invalid image URL")).toBeInTheDocument();
  });

  it("shows 'Draft' status badge by default", () => {
    render(<PostForm />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows 'Published' status badge when initialData has status published", () => {
    render(
      <PostForm initialData={{ status: "published" }} />
    );
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("displays word count and reading time estimate", async () => {
    render(<PostForm />);
    const textarea = screen.getByPlaceholderText(/Write your post in Markdown/);
    // 200 words = 1 min read
    const content = "word ".repeat(200).trim();
    fireEvent.change(textarea, { target: { value: content } });
    await waitFor(() => {
      expect(screen.getAllByText(/200/).length).toBeGreaterThan(0);
    });
  });

  it("updates excerpt when changed", () => {
    render(<PostForm />);
    const excerptArea = screen.getByPlaceholderText("A short description shown in the blog listing...");
    fireEvent.change(excerptArea, { target: { value: "My excerpt" } });
    expect((excerptArea as HTMLTextAreaElement).value).toBe("My excerpt");
  });

  it("creates new post when Save Draft clicked (no postId)", async () => {
    vi.mocked(createPost).mockResolvedValue({ success: true, id: "new-post-id" });
    render(<PostForm />);
    fireEvent.click(screen.getByText("Save Draft"));
    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith(expect.objectContaining({ status: "draft" }));
      expect(mockPush).toHaveBeenCalledWith("/admin/posts/new-post-id/edit");
    });
  });

  it("updates post when Save Draft clicked (with postId)", async () => {
    vi.mocked(updatePost).mockResolvedValue({ success: true, id: "post-1" });
    render(<PostForm postId="post-1" initialData={{ title: "Existing" }} />);
    fireEvent.click(screen.getByText("Save Draft"));
    await waitFor(() => {
      expect(updatePost).toHaveBeenCalledWith("post-1", expect.objectContaining({ status: "draft" }));
    });
  });

  it("publishes post when Publish clicked", async () => {
    vi.mocked(createPost).mockResolvedValue({ success: true, id: "new-id" });
    render(<PostForm />);
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith(expect.objectContaining({ status: "published" }));
    });
  });

  it("shows 'Saved!' after successful save", async () => {
    vi.mocked(createPost).mockResolvedValue({ success: true, id: "new-id" });
    render(<PostForm />);
    fireEvent.click(screen.getByText("Save Draft"));
    await waitFor(() => expect(screen.getByText("Saved!")).toBeInTheDocument());
  });

  it("shows error when save fails", async () => {
    vi.mocked(createPost).mockResolvedValue({ success: false, error: "Slug conflict" });
    render(<PostForm />);
    fireEvent.click(screen.getByText("Save Draft"));
    await waitFor(() => {
      expect(screen.getByText("Slug conflict")).toBeInTheDocument();
    });
  });

  it("does not redirect when updating existing post succeeds", async () => {
    vi.mocked(updatePost).mockResolvedValue({ success: true, id: "post-1" });
    render(<PostForm postId="post-1" />);
    fireEvent.click(screen.getByText("Save Draft"));
    await waitFor(() => {
      expect(updatePost).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
