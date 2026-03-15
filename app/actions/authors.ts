"use server";

import { db } from "@/db";
import { authors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthor } from "@/db/queries/authors";

interface AuthorFormData {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  longBio: string;
  email: string;
  location: string;
  skills: string[];
  social: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function saveAuthor(data: AuthorFormData): Promise<ActionResult> {
  try {
    const existing = await getAuthor();

    const values = {
      name: data.name,
      title: data.title,
      avatar: data.avatar,
      bio: data.bio,
      longBio: data.longBio,
      email: data.email,
      location: data.location,
      skills: data.skills,
      socialTwitter: data.social.twitter,
      socialGithub: data.social.github,
      socialLinkedin: data.social.linkedin,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(authors).set(values).where(eq(authors.id, existing.id));
    } else {
      await db.insert(authors).values(values);
    }

    revalidatePath("/about");
    revalidatePath("/admin/about");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save profile.";
    return { success: false, error: message };
  }
}
