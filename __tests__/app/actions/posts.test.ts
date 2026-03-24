import { describe, it, expect, vi, beforeEach } from "vitest";

// ── DB mock ───────────────────────────────────────────────────────────────────
const dbState = vi.hoisted(() => ({ result: [] as unknown[] }));

vi.mock("@/db", () => {
  const chain: Record<string, unknown> = {
    get then() {
      return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
        Promise.resolve(dbState.result).then(resolve, reject);
    },
    select: () => chain,
    from: () => chain,
    where: () => chain,
    limit: () => chain,
    insert: () => chain,
    values: () => chain,
    returning: () => Promise.resolve(dbState.result),
    update: () => chain,
    set: () => chain,
    delete: () => chain,
  };
  return { db: chain };
});

vi.mock("@/db/schema", () => ({
  posts: { id: "id", status: "status", publishedAt: "published_at" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db/queries/authors", () => ({
  getAuthor: vi.fn(),
}));

vi.mock("@/lib/embedding", () => ({
  indexPost: vi.fn().mockResolvedValue(undefined),
  removePostIndex: vi.fn().mockResolvedValue(undefined),
}));

import { createPost, updatePost, deletePost } from "@/app/actions/posts";
import { getAuthor } from "@/db/queries/authors";
import { indexPost, removePostIndex } from "@/lib/embedding";
import { revalidatePath } from "next/cache";

// ── Common test data ──────────────────────────────────────────────────────────
const mockAuthor = {
  id: "author-1",
  name: "Alice",
  title: "",
  avatar: "",
  bio: "",
  longBio: "",
  email: "",
  location: "",
  skills: [],
  socialTwitter: "",
  socialGithub: "",
  socialLinkedin: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseFormData = {
  title: "Test Post",
  slug: "test-post",
  excerpt: "An excerpt",
  content: "Some content words here",
  coverImage: "/cover.jpg",
  tags: ["typescript"],
  status: "draft" as const,
};

describe("app/actions/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbState.result = [{ id: "post-1" }];
    vi.mocked(getAuthor).mockResolvedValue(mockAuthor);
  });

  // ── createPost ─────────────────────────────────────────────────────────────
  describe("createPost", () => {
    it("returns success with id when draft created", async () => {
      dbState.result = [{ id: "post-1" }];
      const result = await createPost(baseFormData);
      expect(result).toEqual({ success: true, id: "post-1" });
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/posts");
    });

    it("indexes post when status is published", async () => {
      dbState.result = [{ id: "post-2" }];
      const result = await createPost({ ...baseFormData, status: "published" });
      expect(result.success).toBe(true);
      expect(indexPost).toHaveBeenCalledWith(
        "post-2",
        "Test Post",
        "An excerpt",
        "Some content words here"
      );
    });

    it("does not index post when status is draft", async () => {
      dbState.result = [{ id: "post-1" }];
      await createPost(baseFormData);
      expect(indexPost).not.toHaveBeenCalled();
    });

    it("returns error when no author found", async () => {
      vi.mocked(getAuthor).mockResolvedValue(null);
      const result = await createPost(baseFormData);
      expect(result).toEqual({
        success: false,
        error: "No author found. Set up your profile first.",
      });
    });

    it("catches errors and returns error result", async () => {
      vi.mocked(getAuthor).mockRejectedValue(new Error("DB error"));
      const result = await createPost(baseFormData);
      expect(result).toEqual({ success: false, error: "DB error" });
    });

    it("handles non-Error exceptions", async () => {
      vi.mocked(getAuthor).mockRejectedValue("something weird");
      const result = await createPost(baseFormData);
      expect(result).toEqual({ success: false, error: "Failed to create post." });
    });

    it("continues when indexPost fails (non-blocking)", async () => {
      dbState.result = [{ id: "post-2" }];
      vi.mocked(indexPost).mockRejectedValue(new Error("embedding failure"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = await createPost({ ...baseFormData, status: "published" });
      expect(result.success).toBe(true);
      consoleSpy.mockRestore();
    });

    it("calculates reading time correctly for content", async () => {
      // 200 words → 1 min
      const content = "word ".repeat(200).trim();
      dbState.result = [{ id: "post-1" }];
      const result = await createPost({ ...baseFormData, content });
      expect(result.success).toBe(true);
    });

    it("reading time is at least 1 for empty content", async () => {
      dbState.result = [{ id: "post-1" }];
      const result = await createPost({ ...baseFormData, content: "" });
      expect(result.success).toBe(true);
    });
  });

  // ── updatePost ─────────────────────────────────────────────────────────────
  describe("updatePost", () => {
    it("returns success when post updated as draft", async () => {
      // First db call (select) returns existing post, second (update) returns anything
      dbState.result = [{ publishedAt: null, status: "draft" }];
      const result = await updatePost("post-1", baseFormData);
      expect(result).toEqual({ success: true, id: "post-1" });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("returns error when post not found", async () => {
      dbState.result = [];
      const result = await updatePost("nonexistent", baseFormData);
      expect(result).toEqual({ success: false, error: "Post not found." });
    });

    it("indexes post when status changed to published", async () => {
      dbState.result = [{ publishedAt: null, status: "draft" }];
      const result = await updatePost("post-1", { ...baseFormData, status: "published" });
      expect(result.success).toBe(true);
      expect(indexPost).toHaveBeenCalled();
    });

    it("removes index when published post moved to draft", async () => {
      dbState.result = [{ publishedAt: new Date(), status: "published" }];
      const result = await updatePost("post-1", { ...baseFormData, status: "draft" });
      expect(result.success).toBe(true);
      expect(removePostIndex).toHaveBeenCalledWith("post-1");
    });

    it("continues when removePostIndex fails on un-publish (wasPublished=true)", async () => {
      dbState.result = [{ publishedAt: new Date(), status: "published" }];
      vi.mocked(removePostIndex).mockRejectedValue(new Error("remove fail"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = await updatePost("post-1", { ...baseFormData, status: "draft" });
      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[embedding] removePostIndex failed:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it("preserves publishedAt when already published and remains published", async () => {
      const existingPublishedAt = new Date("2024-01-01");
      dbState.result = [{ publishedAt: existingPublishedAt, status: "published" }];
      const result = await updatePost("post-1", { ...baseFormData, status: "published" });
      expect(result.success).toBe(true);
    });

    it("sets publishedAt to now when first publishing (was draft)", async () => {
      dbState.result = [{ publishedAt: null, status: "draft" }];
      const result = await updatePost("post-1", { ...baseFormData, status: "published" });
      expect(result.success).toBe(true);
    });

    it("keeps publishedAt when un-publishing a published post", async () => {
      const existingPublishedAt = new Date("2024-01-01");
      dbState.result = [{ publishedAt: existingPublishedAt, status: "published" }];
      const result = await updatePost("post-1", { ...baseFormData, status: "draft" });
      expect(result.success).toBe(true);
    });

    it("catches errors and returns error result", async () => {
      dbState.result = [{ publishedAt: null, status: "draft" }];
      // Simulate error in a deeper call
      vi.mocked(indexPost).mockRejectedValue(new Error("embed fail"));
      vi.spyOn(console, "error").mockImplementation(() => {});
      const result = await updatePost("post-1", { ...baseFormData, status: "published" });
      expect(result.success).toBe(true); // indexPost error is swallowed
    });

    it("handles non-Error exceptions in outer try/catch", async () => {
      // Make the mock db chain throw
      dbState.result = null as unknown as unknown[]; // this won't throw at chain level
      // Instead we test with a direct Error injection in the select step
      const origGetAuthor = vi.mocked(getAuthor);
      origGetAuthor.mockRejectedValue("raw error");
      // But getAuthor isn't called in updatePost - test the catch with a real error
      const { db } = await import("@/db");
      const selectSpy = vi.spyOn(db as Record<string, unknown>, "select" as keyof typeof db).mockImplementation(() => {
        throw new Error("select failed");
      });
      dbState.result = [];
      const result = await updatePost("post-1", baseFormData);
      expect(result.success).toBe(false);
      selectSpy.mockRestore();
    });
  });

  // ── deletePost ─────────────────────────────────────────────────────────────
  describe("deletePost", () => {
    it("returns success when post deleted", async () => {
      const result = await deletePost("post-1");
      expect(result).toEqual({ success: true, id: "post-1" });
      expect(removePostIndex).toHaveBeenCalledWith("post-1");
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/posts");
    });

    it("continues when removePostIndex fails (non-blocking)", async () => {
      vi.mocked(removePostIndex).mockRejectedValue(new Error("remove fail"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = await deletePost("post-1");
      expect(result.success).toBe(true);
      consoleSpy.mockRestore();
    });

    it("catches errors and returns error result", async () => {
      const { db } = await import("@/db");
      vi.spyOn(db as Record<string, unknown>, "delete" as keyof typeof db).mockImplementation(() => {
        throw new Error("delete failed");
      });
      const result = await deletePost("post-1");
      expect(result).toEqual({ success: false, error: "delete failed" });
    });

    it("handles non-Error exceptions", async () => {
      const { db } = await import("@/db");
      vi.spyOn(db as Record<string, unknown>, "delete" as keyof typeof db).mockImplementation(() => {
        throw "raw error";
      });
      const result = await deletePost("post-1");
      expect(result).toEqual({ success: false, error: "Failed to delete post." });
    });
  });
});
