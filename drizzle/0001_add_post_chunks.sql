-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create post_chunks table
CREATE TABLE IF NOT EXISTS "post_chunks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL,
  "chunk_index" integer NOT NULL,
  "content" text NOT NULL,
  "embedding" vector(768),
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "post_chunks_post_id_posts_id_fk"
    FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action
);

-- HNSW index for fast approximate nearest-neighbour search (cosine distance)
CREATE INDEX IF NOT EXISTS "post_chunks_embedding_idx"
  ON "post_chunks" USING hnsw ("embedding" vector_cosine_ops);
