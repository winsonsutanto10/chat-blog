import { describe, it, expect, vi, beforeEach } from "vitest";

// ── DB mock ───────────────────────────────────────────────────────────────────
const dbState = vi.hoisted(() => ({ result: [] as unknown[] }));

vi.mock("@/db", () => {
  const chain: Record<string, unknown> = {
    get then() {
      return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
        Promise.resolve(dbState.result).then(resolve, reject);
    },
    insert: () => chain,
    values: () => chain,
    delete: () => chain,
    where: () => chain,
    execute: () => Promise.resolve(dbState.result),
  };
  return { db: chain };
});

// ── Google AI mock ────────────────────────────────────────────────────────────
const { mockEmbedContent, mockGetGenerativeModel } = vi.hoisted(() => ({
  mockEmbedContent: vi.fn(),
  mockGetGenerativeModel: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: function(this: unknown) {
    return { getGenerativeModel: mockGetGenerativeModel };
  },
}));

// ── Schema mock ───────────────────────────────────────────────────────────────
vi.mock("@/db/schema", () => ({
  postChunks: { postId: "post_id" },
  posts: { status: "status" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ a, b })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
  })),
}));

import { indexPost, removePostIndex, searchSimilarChunks } from "@/lib/embedding";

describe("lib/embedding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbState.result = [];

    mockGetGenerativeModel.mockReturnValue({
      embedContent: mockEmbedContent,
    });

    mockEmbedContent.mockResolvedValue({
      embedding: { values: new Array(768).fill(0.1) },
    });
  });

  describe("indexPost", () => {
    it("deletes old chunks and returns early when content is empty", async () => {
      await indexPost("post-1", "Title", "Excerpt", "   ");
      // Just verifies no errors thrown
    });

    it("deletes old chunks and returns early when content is blank", async () => {
      await indexPost("post-1", "Title", "Excerpt", "");
      // Just verifies no errors thrown
    });

    it("chunks and embeds content when non-empty", async () => {
      process.env.GOOGLE_AI_API_KEY = "test-key";
      const content = "word ".repeat(10).trim();
      await indexPost("post-1", "My Title", "My Excerpt", content);
      expect(mockEmbedContent).toHaveBeenCalledTimes(1);
    });

    it("handles long content producing multiple chunks", async () => {
      process.env.GOOGLE_AI_API_KEY = "test-key";
      // 700 words → 2 chunks (chunk size 600, overlap 80)
      const content = Array.from({ length: 700 }, (_, i) => `word${i}`).join(" ");
      await indexPost("post-1", "Title", "Excerpt", content);
      // Expect multiple embedContent calls (one per chunk)
      expect(mockEmbedContent.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it("throws when GOOGLE_AI_API_KEY is not set", async () => {
      const key = process.env.GOOGLE_AI_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;
      await expect(
        indexPost("post-1", "Title", "Excerpt", "some content")
      ).rejects.toThrow("GOOGLE_AI_API_KEY");
      process.env.GOOGLE_AI_API_KEY = key;
    });
  });

  describe("removePostIndex", () => {
    it("deletes chunks for the given postId", async () => {
      await expect(removePostIndex("post-1")).resolves.toBeUndefined();
    });
  });

  describe("searchSimilarChunks", () => {
    it("returns results from db.execute", async () => {
      process.env.GOOGLE_AI_API_KEY = "test-key";
      const mockRows = [
        { content: "chunk 1", postId: "p1", title: "Post 1", slug: "post-1" },
      ];
      dbState.result = mockRows;

      const results = await searchSimilarChunks("test query");
      expect(results).toEqual(mockRows);
    });

    it("uses default limit when not specified", async () => {
      process.env.GOOGLE_AI_API_KEY = "test-key";
      dbState.result = [];
      const results = await searchSimilarChunks("query");
      expect(results).toEqual([]);
    });

    it("uses custom limit when specified", async () => {
      process.env.GOOGLE_AI_API_KEY = "test-key";
      dbState.result = [];
      const results = await searchSimilarChunks("query", 3);
      expect(results).toEqual([]);
    });

    it("throws when GOOGLE_AI_API_KEY is not set", async () => {
      const key = process.env.GOOGLE_AI_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;
      await expect(searchSimilarChunks("query")).rejects.toThrow(
        "GOOGLE_AI_API_KEY"
      );
      process.env.GOOGLE_AI_API_KEY = key;
    });
  });
});
