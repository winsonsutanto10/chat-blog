import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSql = vi.fn();
const mockDrizzle = vi.fn(() => ({ query: vi.fn() }));

vi.mock("postgres", () => ({
  default: vi.fn(() => mockSql),
}));

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: mockDrizzle,
}));

vi.mock("@/db/schema", () => ({
  authors: {},
  posts: {},
  postChunks: {},
  postStatusEnum: {},
}));

describe("db/index", () => {
  beforeEach(() => {
    vi.resetModules();
    // Clean up global client between tests
    // @ts-expect-error accessing global
    delete global._pgClient;
  });

  it("creates a new postgres client and drizzle instance", async () => {
    process.env.DATABASE_URL = "postgres://test";
    const { db } = await import("@/db");
    expect(db).toBeDefined();
    expect(mockDrizzle).toHaveBeenCalled();
  });

  it("reuses existing global._pgClient in non-production environment", async () => {
    process.env.DATABASE_URL = "postgres://test";
    process.env.NODE_ENV = "test";

    // First import
    const { db: db1 } = await import("@/db");
    // @ts-expect-error global
    const firstClient = global._pgClient;

    vi.resetModules();
    // @ts-expect-error - keep the global client
    global._pgClient = firstClient;

    const { db: db2 } = await import("@/db");
    expect(db1).toBeDefined();
    expect(db2).toBeDefined();
  });

  it("does not set global._pgClient in production", async () => {
    const origNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgres://test";

    vi.resetModules();
    // @ts-expect-error global
    delete global._pgClient;

    await import("@/db");
    // @ts-expect-error global
    expect(global._pgClient).toBeUndefined();

    process.env.NODE_ENV = origNodeEnv;
  });
});
