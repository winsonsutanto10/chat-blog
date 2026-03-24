import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";
import { EMBEDDING_DIMENSIONS } from "@/lib/constants";

const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? EMBEDDING_DIMENSIONS})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return value.slice(1, -1).split(",").map(Number);
  },
});

export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

export const authors = pgTable("authors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  bio: text("bio").notNull().default(""),
  longBio: text("long_bio").notNull().default(""),
  email: text("email").notNull().default(""),
  location: text("location").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  socialTwitter: text("social_twitter").notNull().default(""),
  socialGithub: text("social_github").notNull().default(""),
  socialLinkedin: text("social_linkedin").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  authorId: uuid("author_id")
    .notNull()
    .references(/* c8 ignore next */ () => authors.id, { onDelete: "restrict" }),
  publishedAt: timestamp("published_at"),
  readingTime: integer("reading_time").notNull().default(1),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  status: postStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postChunks = pgTable("post_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(/* c8 ignore next */ () => posts.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostChunk = typeof postChunks.$inferSelect;
