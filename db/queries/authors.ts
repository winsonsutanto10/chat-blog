import { db } from "@/db";
import { authors } from "@/db/schema";
import type { Author } from "@/db/schema";

// Personal blog: always one author (the first row)
export async function getAuthor(): Promise<Author | null> {
  const rows = await db.select().from(authors).limit(1);
  return rows[0] ?? null;
}
