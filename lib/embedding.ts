import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { postChunks, posts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const CHUNK_SIZE = 600;    // words per chunk
const CHUNK_OVERLAP = 80;  // word overlap between adjacent chunks

function getGenAI() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_API_KEY is not set in environment variables");
  return new GoogleGenerativeAI(key);
}

// ─── Text Chunking ────────────────────────────────────────────────────────────

function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= CHUNK_SIZE) return [text.trim()];

  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + CHUNK_SIZE).join(" ");
    chunks.push(chunk);
    if (i + CHUNK_SIZE >= words.length) break;
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

// ─── Google Embedding ─────────────────────────────────────────────────────────

async function embedText(text: string, taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"): Promise<number[]> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: taskType as never,
    outputDimensionality: 768,
  } as never);
  return result.embedding.values;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Chunk a published post's content, embed each chunk, and store in post_chunks.
 * Any existing chunks for the post are replaced.
 */
export async function indexPost(
  postId: string,
  title: string,
  excerpt: string,
  content: string
): Promise<void> {
  // Delete old chunks first
  await db.delete(postChunks).where(eq(postChunks.postId, postId));

  if (!content.trim()) return;

  // Combine title + excerpt + content so every chunk carries full context
  const fullText = `${title}\n\n${excerpt}\n\n${content}`;
  const chunks = chunkText(fullText);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i], "RETRIEVAL_DOCUMENT");
    await db.insert(postChunks).values({
      postId,
      chunkIndex: i,
      content: chunks[i],
      embedding,
    });
  }
}

/**
 * Remove all indexed chunks for a post (e.g. when deleted or unpublished).
 */
export async function removePostIndex(postId: string): Promise<void> {
  await db.delete(postChunks).where(eq(postChunks.postId, postId));
}

/**
 * Embed a query string and return the most semantically similar published chunks.
 */
export async function searchSimilarChunks(
  query: string,
  limit = 5
): Promise<Array<{ content: string; postId: string; title: string; slug: string }>> {
  const queryEmbedding = await embedText(query, "RETRIEVAL_QUERY");
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const rows = await db.execute(sql`
    SELECT
      pc.content,
      pc.post_id::text  AS "postId",
      p.title,
      p.slug
    FROM post_chunks pc
    JOIN posts p ON p.id = pc.post_id
    WHERE p.status = 'published'
    ORDER BY pc.embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `);

  return rows as unknown as Array<{ content: string; postId: string; title: string; slug: string }>;
}
