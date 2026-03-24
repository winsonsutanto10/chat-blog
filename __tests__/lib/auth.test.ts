import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("lib/auth", () => {
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      ADMIN_USERNAME: "testadmin",
      ADMIN_PASSWORD: "testpass",
      SESSION_SECRET: "testsecret",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("exports SESSION_COOKIE as admin_session", async () => {
    const { SESSION_COOKIE } = await import("@/lib/auth");
    expect(SESSION_COOKIE).toBe("admin_session");
  });

  it("exports SESSION_MAX_AGE as 7 days in seconds", async () => {
    const { SESSION_MAX_AGE } = await import("@/lib/auth");
    expect(SESSION_MAX_AGE).toBe(60 * 60 * 24 * 7);
  });

  it("exports ADMIN_USERNAME from env", async () => {
    const { ADMIN_USERNAME } = await import("@/lib/auth");
    expect(typeof ADMIN_USERNAME).toBe("string");
  });

  it("exports ADMIN_PASSWORD from env", async () => {
    const { ADMIN_PASSWORD } = await import("@/lib/auth");
    expect(typeof ADMIN_PASSWORD).toBe("string");
  });

  it("exports SESSION_SECRET from env", async () => {
    const { SESSION_SECRET } = await import("@/lib/auth");
    expect(typeof SESSION_SECRET).toBe("string");
  });
});
