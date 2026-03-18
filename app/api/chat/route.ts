import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchSimilarChunks } from "@/lib/embedding";

function getGenAI() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!messages?.length) {
      return new Response("No messages provided", { status: 400 });
    }

    const userQuery = messages[messages.length - 1].content;

    // ── RAG: retrieve relevant chunks ───────────────────────────────────────
    const chunks = await searchSimilarChunks(userQuery, 5);

    const context =
      chunks.length > 0
        ? chunks
            .map((c, i) => `[Article ${i + 1}: ${c.title}]\n${c.content}`)
            .join("\n\n---\n\n")
        : "No relevant articles found in the blog.";

    const systemInstruction = `You are a helpful assistant for a personal blog. Your job is to answer questions based strictly on the blog articles provided below.

Rules:
- Only answer based on the provided article excerpts.
- If the answer is not in the articles, say so honestly and invite the user to explore the blog.
- Keep answers concise and friendly.
- If relevant, mention the article title so the reader can find it.

Blog content:
${context}`;

    // ── Build conversation history for multi-turn chat ───────────────────────
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : ("model" as "user" | "model"),
      parts: [{ text: m.content }],
    }));

    const model = getGenAI().getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(userQuery);

    // ── Stream plain text back to the client ─────────────────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[chat] error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
