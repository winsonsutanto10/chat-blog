import { describe, it, expect, vi, beforeEach } from "vitest";

const dbState = vi.hoisted(() => ({ result: [] as unknown[] }));

vi.mock("@/db", () => {
  const chain: Record<string, unknown> = {
    get then() {
      return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
        Promise.resolve(dbState.result).then(resolve, reject);
    },
    select: () => chain,
    from: () => chain,
    leftJoin: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
  };
  return { db: chain };
});

vi.mock("@/db/schema", () => ({
  posts: {
    id: "id",
    slug: "slug",
    status: "status",
    featured: "featured",
    publishedAt: "published_at",
    createdAt: "created_at",
    authorId: "author_id",
    tags: "tags",
  },
  authors: { id: "id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  desc: vi.fn((a) => ({ desc: a })),
  and: vi.fn((...args) => ({ and: args })),
  ne: vi.fn((a, b) => ({ ne: [a, b] })),
  arrayOverlaps: vi.fn((a, b) => ({ arrayOverlaps: [a, b] })),
}));

import {
  getAllPublishedPosts,
  getAllPosts,
  getFeaturedPost,
  getPostBySlug,
  getPostById,
  getRelatedPosts,
  getAllPublishedSlugs,
} from "@/db/queries/posts";

// ── Shared mock data ──────────────────────────────────────────────────────────
const mockDate = new Date("2024-01-15T00:00:00Z");
const mockAuthor = {
  id: "author-1",
  name: "Alice",
  avatar: "/avatar.png",
  bio: "Developer bio",
  title: "Developer",
  longBio: "",
  email: "",
  location: "",
  skills: [],
  socialTwitter: "",
  socialGithub: "",
  socialLinkedin: "",
  createdAt: mockDate,
  updatedAt: mockDate,
};

const mockPostRow = {
  id: "post-1",
  slug: "my-post",
  title: "My Post",
  excerpt: "An excerpt",
  content: "Full content here",
  coverImage: "/cover.jpg",
  authorId: "author-1",
  publishedAt: mockDate,
  readingTime: 3,
  tags: ["typescript", "react"],
  featured: false,
  status: "published" as const,
  createdAt: mockDate,
  updatedAt: mockDate,
};

const makeRow = (postOverrides = {}, authorOverrides: typeof mockAuthor | null = mockAuthor) => ({
  posts: { ...mockPostRow, ...postOverrides },
  authors: authorOverrides,
});

describe("db/queries/posts", () => {
  beforeEach(() => {
    dbState.result = [];
  });

  // ── toPost transformation ──────────────────────────────────────────────────
  describe("toPost (via getAllPublishedPosts)", () => {
    it("maps row to BlogPost correctly", async () => {
      dbState.result = [makeRow()];
      const [post] = await getAllPublishedPosts();
      expect(post.id).toBe("post-1");
      expect(post.slug).toBe("my-post");
      expect(post.title).toBe("My Post");
      expect(post.author.name).toBe("Alice");
      expect(post.author.avatar).toBe("/avatar.png");
      expect(post.publishedAt).toBe(mockDate.toISOString());
      expect(post.tags).toEqual(["typescript", "react"]);
    });

    it("uses createdAt when publishedAt is null", async () => {
      dbState.result = [makeRow({ publishedAt: null })];
      const [post] = await getAllPublishedPosts();
      expect(post.publishedAt).toBe(mockDate.toISOString());
    });

    it("uses 'Unknown' author when authors is null", async () => {
      dbState.result = [makeRow({}, null)];
      const [post] = await getAllPublishedPosts();
      expect(post.author.name).toBe("Unknown");
      expect(post.author.avatar).toBe("");
      expect(post.author.bio).toBe("");
    });

    it("defaults tags to empty array when null", async () => {
      dbState.result = [makeRow({ tags: null })];
      const [post] = await getAllPublishedPosts();
      expect(post.tags).toEqual([]);
    });

    it("returns empty array when no posts", async () => {
      dbState.result = [];
      const posts = await getAllPublishedPosts();
      expect(posts).toHaveLength(0);
    });
  });

  // ── getAllPosts ─────────────────────────────────────────────────────────────
  describe("getAllPosts", () => {
    it("returns raw rows with post and author", async () => {
      dbState.result = [makeRow()];
      const rows = await getAllPosts();
      expect(rows).toHaveLength(1);
      expect(rows[0].posts).toBeDefined();
      expect(rows[0].authors).toBeDefined();
    });

    it("returns empty array when no posts", async () => {
      dbState.result = [];
      const rows = await getAllPosts();
      expect(rows).toHaveLength(0);
    });
  });

  // ── getFeaturedPost ─────────────────────────────────────────────────────────
  describe("getFeaturedPost", () => {
    it("returns featured post as BlogPost", async () => {
      dbState.result = [makeRow({ featured: true })];
      const post = await getFeaturedPost();
      expect(post).toBeDefined();
      expect(post!.featured).toBe(true);
    });

    it("returns undefined when no featured post", async () => {
      dbState.result = [];
      const post = await getFeaturedPost();
      expect(post).toBeUndefined();
    });
  });

  // ── getPostBySlug ───────────────────────────────────────────────────────────
  describe("getPostBySlug", () => {
    it("returns post when found", async () => {
      dbState.result = [makeRow()];
      const post = await getPostBySlug("my-post");
      expect(post).toBeDefined();
      expect(post!.slug).toBe("my-post");
    });

    it("returns undefined when not found", async () => {
      dbState.result = [];
      const post = await getPostBySlug("nonexistent");
      expect(post).toBeUndefined();
    });
  });

  // ── getPostById ─────────────────────────────────────────────────────────────
  describe("getPostById", () => {
    it("returns raw row when found", async () => {
      const row = makeRow();
      dbState.result = [row];
      const result = await getPostById("post-1");
      expect(result).toEqual(row);
    });

    it("returns null when not found", async () => {
      dbState.result = [];
      const result = await getPostById("nonexistent");
      expect(result).toBeNull();
    });
  });

  // ── getRelatedPosts ─────────────────────────────────────────────────────────
  describe("getRelatedPosts", () => {
    it("returns empty array immediately when tags is empty", async () => {
      const posts = await getRelatedPosts("my-post", []);
      expect(posts).toEqual([]);
    });

    it("returns related posts when tags provided", async () => {
      dbState.result = [makeRow({ slug: "other-post" })];
      const posts = await getRelatedPosts("my-post", ["typescript"]);
      expect(posts).toHaveLength(1);
      expect(posts[0].slug).toBe("other-post");
    });

    it("returns empty array when no related posts found", async () => {
      dbState.result = [];
      const posts = await getRelatedPosts("my-post", ["typescript"]);
      expect(posts).toHaveLength(0);
    });
  });

  // ── getAllPublishedSlugs ─────────────────────────────────────────────────────
  describe("getAllPublishedSlugs", () => {
    it("returns array of slug strings", async () => {
      dbState.result = [{ slug: "post-1" }, { slug: "post-2" }];
      const slugs = await getAllPublishedSlugs();
      expect(slugs).toEqual(["post-1", "post-2"]);
    });

    it("returns empty array when no published posts", async () => {
      dbState.result = [];
      const slugs = await getAllPublishedSlugs();
      expect(slugs).toEqual([]);
    });
  });
});
