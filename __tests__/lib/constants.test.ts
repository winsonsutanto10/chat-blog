import { describe, it, expect } from "vitest";
import {
  WORDS_PER_MINUTE,
  EMBEDDING_DIMENSIONS,
  RAG_CHUNK_LIMIT,
  SAVE_SUCCESS_MS,
} from "@/lib/constants";

describe("lib/constants", () => {
  it("exports WORDS_PER_MINUTE as 200", () => {
    expect(WORDS_PER_MINUTE).toBe(200);
  });

  it("exports EMBEDDING_DIMENSIONS as 768", () => {
    expect(EMBEDDING_DIMENSIONS).toBe(768);
  });

  it("exports RAG_CHUNK_LIMIT as 5", () => {
    expect(RAG_CHUNK_LIMIT).toBe(5);
  });

  it("exports SAVE_SUCCESS_MS as 3000", () => {
    expect(SAVE_SUCCESS_MS).toBe(3000);
  });
});
