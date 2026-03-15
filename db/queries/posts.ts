import { db } from "@/db";
import { posts, authors } from "@/db/schema";
import { eq, desc, and, ne, arrayOverlaps } from "drizzle-orm";
import type { BlogPost } from "@/types/blog";

// Shape a DB row (post + author join) into the BlogPost interface
// so all existing components work without changes.
function toPost(row: {
  posts: typeof posts.$inferSelect;
  authors: typeof authors.$inferSelect | null;
}): BlogPost {
  const { posts: p, authors: a } = row;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    author: {
      name: a?.name ?? "Unknown",
      avatar: a?.avatar ?? "",
      bio: a?.bio ?? "",
    },
    publishedAt: p.publishedAt?.toISOString() ?? p.createdAt.toISOString(),
    readingTime: p.readingTime,
    tags: p.tags ?? [],
    featured: p.featured,
  };
}

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  const rows = await db
    .select()
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));

  return rows.map(toPost);
}

export async function getAllPosts() {
  return db
    .select()
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .orderBy(desc(posts.createdAt));
}

export async function getFeaturedPost(): Promise<BlogPost | undefined> {
  const rows = await db
    .select()
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(eq(posts.featured, true), eq(posts.status, "published")))
    .limit(1);

  return rows[0] ? toPost(rows[0]) : undefined;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const rows = await db
    .select()
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(eq(posts.slug, slug))
    .limit(1);

  return rows[0] ? toPost(rows[0]) : undefined;
}

export async function getPostById(id: string) {
  const rows = await db
    .select()
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(eq(posts.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export async function getRelatedPosts(slug: string, tags: string[]): Promise<BlogPost[]> {
  if (tags.length === 0) return [];

  const rows = await db
    .select()
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(
      and(
        ne(posts.slug, slug),
        eq(posts.status, "published"),
        arrayOverlaps(posts.tags, tags)
      )
    )
    .limit(3);

  return rows.map(toPost);
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, "published"));

  return rows.map((r) => r.slug);
}
