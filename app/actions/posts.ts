"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthor } from "@/db/queries/authors";
import { indexPost, removePostIndex } from "@/lib/embedding";
import { WORDS_PER_MINUTE } from "@/lib/constants";

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  status: "draft" | "published";
}

type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export async function createPost(data: PostFormData): Promise<ActionResult> {
  try {
    const author = await getAuthor();
    if (!author) {
      return { success: false, error: "No author found. Set up your profile first." };
    }

    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        tags: data.tags,
        status: data.status,
        authorId: author.id,
        readingTime: estimateReadingTime(data.content),
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .returning({ id: posts.id });

    // Index immediately if published
    if (data.status === "published") {
      await indexPost(post.id, data.title, data.excerpt, data.content).catch(
        (err) => console.error("[embedding] indexPost failed:", err)
      );
    }

    revalidatePath("/");
    revalidatePath("/admin/posts");

    return { success: true, id: post.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post.";
    return { success: false, error: message };
  }
}

export async function updatePost(id: string, data: PostFormData): Promise<ActionResult> {
  try {
    const existing = await db
      .select({ publishedAt: posts.publishedAt, status: posts.status })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existing[0]) {
      return { success: false, error: "Post not found." };
    }

    const wasPublished = existing[0].status === "published";
    const publishedAt =
      data.status === "published"
        ? existing[0].publishedAt ?? new Date()
        : wasPublished
          ? existing[0].publishedAt
          : null;

    await db
      .update(posts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        tags: data.tags,
        status: data.status,
        readingTime: estimateReadingTime(data.content),
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    // Re-index if published; remove index if moved back to draft
    if (data.status === "published") {
      await indexPost(id, data.title, data.excerpt, data.content).catch(
        (err) => console.error("[embedding] indexPost failed:", err)
      );
    } else if (wasPublished) {
      await removePostIndex(id).catch(
        (err) => console.error("[embedding] removePostIndex failed:", err)
      );
    }

    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath(`/blog/${data.slug}`);
    revalidatePath(`/admin/posts/${id}/edit`);

    return { success: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update post.";
    return { success: false, error: message };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    // Chunks cascade-delete automatically via FK, but we log errors explicitly
    await removePostIndex(id).catch(
      (err) => console.error("[embedding] removePostIndex failed:", err)
    );

    await db.delete(posts).where(eq(posts.id, id));

    revalidatePath("/");
    revalidatePath("/admin/posts");

    return { success: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post.";
    return { success: false, error: message };
  }
}
