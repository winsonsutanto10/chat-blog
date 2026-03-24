import { describe, it, expect, vi } from "vitest";

vi.mock("next/server", () => {
  class MockCookies {
    private store = new Map<string, string>();
    set(name: string, value: string) { this.store.set(name, value); }
    delete(name: string) { this.store.delete(name); }
    has(name: string) { return this.store.has(name); }
  }

  class MockNextResponse {
    status: number;
    body: string;
    cookies = new MockCookies();

    constructor(body: string, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }

    async json() { return JSON.parse(this.body); }

    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(JSON.stringify(data), init);
    }
  }

  return { NextResponse: MockNextResponse };
});

vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE: "admin_session",
}));

import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  it("returns 200 with ok:true", async () => {
    const res = await POST();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });
  });

  it("deletes the session cookie", async () => {
    const res = await POST();
    const cookies = (res as unknown as { cookies: { has: (n: string) => boolean } }).cookies;
    // After delete, the cookie should not be in the store
    expect(cookies.has("admin_session")).toBe(false);
  });
});
