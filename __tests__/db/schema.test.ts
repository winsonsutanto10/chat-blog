import { describe, it, expect, vi } from "vitest";

// Capture the customType config so we can test its callbacks
let capturedVectorConfig: {
  dataType: (config?: { dimensions?: number }) => string;
  toDriver: (value: number[]) => string;
  fromDriver: (value: string) => number[];
} | null = null;

vi.mock("drizzle-orm/pg-core", async (importOriginal) => {
  const original = await importOriginal<typeof import("drizzle-orm/pg-core")>();
  return {
    ...original,
    customType: (config: typeof capturedVectorConfig) => {
      capturedVectorConfig = config as typeof capturedVectorConfig;
      return original.customType(config as Parameters<typeof original.customType>[0]);
    },
  };
});

// Import after mock so the schema module runs with our mock in place
await import("@/db/schema");

describe("db/schema – vector customType callbacks", () => {
  it("dataType returns correct SQL type with dimensions", () => {
    expect(capturedVectorConfig).not.toBeNull();
    expect(capturedVectorConfig!.dataType({ dimensions: 768 })).toBe("vector(768)");
  });

  it("dataType falls back to EMBEDDING_DIMENSIONS when config is undefined", () => {
    expect(capturedVectorConfig!.dataType(undefined)).toBe("vector(768)");
  });

  it("toDriver converts number array to pgvector string format", () => {
    expect(capturedVectorConfig!.toDriver([1, 2, 3])).toBe("[1,2,3]");
    expect(capturedVectorConfig!.toDriver([])).toBe("[]");
    expect(capturedVectorConfig!.toDriver([0.5, -1.2, 3.14])).toBe("[0.5,-1.2,3.14]");
  });

  it("fromDriver converts pgvector string to number array", () => {
    expect(capturedVectorConfig!.fromDriver("[1,2,3]")).toEqual([1, 2, 3]);
    expect(capturedVectorConfig!.fromDriver("[0.5,-1.2,3.14]")).toEqual([0.5, -1.2, 3.14]);
    expect(capturedVectorConfig!.fromDriver("[]")).toEqual([0]);
  });

  it("exports schema tables and types", async () => {
    const schema = await import("@/db/schema");
    expect(schema.authors).toBeDefined();
    expect(schema.posts).toBeDefined();
    expect(schema.postChunks).toBeDefined();
    expect(schema.postStatusEnum).toBeDefined();
  });
});
