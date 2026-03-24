import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const { mockSendMessageStream, mockStartChat, mockGetGenerativeModel } = vi.hoisted(() => {
  const mockSendMessageStream = vi.fn();
  const mockStartChat = vi.fn(() => ({ sendMessageStream: mockSendMessageStream }));
  const mockGetGenerativeModel = vi.fn(() => ({ startChat: mockStartChat }));
  return { mockSendMessageStream, mockStartChat, mockGetGenerativeModel };
});

vi.mock("@/lib/embedding", () => ({
  searchSimilarChunks: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: function(this: unknown) {
    return { getGenerativeModel: mockGetGenerativeModel };
  },
}));

import { POST } from "@/app/api/chat/route";
import { searchSimilarChunks } from "@/lib/embedding";

function makeRequest(body: Record<string, unknown>) {
  return {
    json: async () => body,
  } as unknown as Parameters<typeof POST>[0];
}

async function readStream(response: Response): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }
  return result;
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_AI_API_KEY = "test-key";
    vi.mocked(searchSimilarChunks).mockResolvedValue([]);
  });

  it("returns 400 when messages is empty", async () => {
    const req = makeRequest({ messages: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toBe("No messages provided");
  });

  it("returns 400 when messages is missing", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns streamed response when chunks found", async () => {
    vi.mocked(searchSimilarChunks).mockResolvedValue([
      { content: "chunk content", postId: "p1", title: "Post 1", slug: "post-1" },
    ]);

    mockSendMessageStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => "Hello " };
        yield { text: () => "World" };
      })(),
    });

    const req = makeRequest({
      messages: [{ role: "user", content: "Tell me about Post 1" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    const text = await readStream(res);
    expect(text).toBe("Hello World");
  });

  it("builds context from multiple chunks", async () => {
    vi.mocked(searchSimilarChunks).mockResolvedValue([
      { content: "chunk 1", postId: "p1", title: "Article A", slug: "a" },
      { content: "chunk 2", postId: "p2", title: "Article B", slug: "b" },
    ]);

    mockSendMessageStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => "answer" };
      })(),
    });

    const req = makeRequest({
      messages: [
        { role: "user", content: "first" },
        { role: "assistant", content: "ok" },
        { role: "user", content: "second" },
      ],
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // Verify history was built from prior messages
    expect(mockStartChat).toHaveBeenCalledWith({
      history: [
        { role: "user", parts: [{ text: "first" }] },
        { role: "model", parts: [{ text: "ok" }] },
      ],
    });
  });

  it("uses no-relevant-articles message when chunks empty", async () => {
    vi.mocked(searchSimilarChunks).mockResolvedValue([]);

    mockSendMessageStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => "no articles" };
      })(),
    });

    const req = makeRequest({
      messages: [{ role: "user", content: "anything" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // The system instruction should contain "No relevant articles found"
    const modelCall = mockGetGenerativeModel.mock.calls[0][0];
    expect(modelCall.systemInstruction).toContain("No relevant articles found");
  });

  it("skips empty text chunks in stream", async () => {
    vi.mocked(searchSimilarChunks).mockResolvedValue([]);

    mockSendMessageStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => "" };
        yield { text: () => "real" };
        yield { text: () => "" };
      })(),
    });

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
    });

    const res = await POST(req);
    const text = await readStream(res);
    expect(text).toBe("real");
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(searchSimilarChunks).mockRejectedValue(new Error("DB down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });

  it("throws when GOOGLE_AI_API_KEY is not set", async () => {
    const key = process.env.GOOGLE_AI_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
    });
    const res = await POST(req);
    expect(res.status).toBe(500);

    process.env.GOOGLE_AI_API_KEY = key;
    consoleSpy.mockRestore();
  });
});
