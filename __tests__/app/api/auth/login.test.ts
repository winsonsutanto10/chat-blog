import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server before imports
vi.mock("next/server", () => {
  class MockCookies {
    private store = new Map<string, { value: string; options?: Record<string, unknown> }>();
    set(name: string, value: string, options?: Record<string, unknown>) {
      this.store.set(name, { value, options });
    }
    get(name: string) { return this.store.get(name); }
    getAll() { return Array.from(this.store.entries()); }
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

  return {
    NextRequest: class {
      body: string;
      constructor(_url: string, init?: { body?: string }) {
        this.body = init?.body ?? "{}";
      }
      async json() { return JSON.parse(this.body); }
    },
    NextResponse: MockNextResponse,
  };
});

vi.mock("@/lib/auth", () => ({
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD: "secret",
  SESSION_COOKIE: "admin_session",
  SESSION_SECRET: "my-session-secret",
  SESSION_MAX_AGE: 604800,
}));

import { POST } from "@/app/api/auth/login/route";

function makeRequest(body: Record<string, string>) {
  const { NextRequest } = require("next/server") as { NextRequest: new (url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) => { json: () => Promise<Record<string, string>> } };
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and sets session cookie on valid credentials", async () => {
    const req = makeRequest({ username: "admin", password: "secret" });
    const res = await POST(req as Parameters<typeof POST>[0]);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });
    // Cookie should be set
    const cookies = (res as unknown as { cookies: { getAll: () => Array<[string, unknown]> } }).cookies.getAll();
    expect(cookies.some(([name]) => name === "admin_session")).toBe(true);
  });

  it("returns 401 on invalid credentials", async () => {
    const req = makeRequest({ username: "admin", password: "wrong" });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid username or password.");
  });

  it("returns 401 on wrong username", async () => {
    const req = makeRequest({ username: "hacker", password: "secret" });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);
  });

  it("sets cookie with correct max age and httpOnly", async () => {
    const req = makeRequest({ username: "admin", password: "secret" });
    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const cookies = (res as unknown as { cookies: { getAll: () => Array<[string, { value: string; options?: Record<string, unknown> }]> } }).cookies.getAll();
    const sessionCookie = cookies.find(([name]) => name === "admin_session");
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie![1].options?.httpOnly).toBe(true);
    expect(sessionCookie![1].options?.maxAge).toBe(604800);
  });

  it("sets sameSite lax on cookie", async () => {
    const req = makeRequest({ username: "admin", password: "secret" });
    const res = await POST(req as Parameters<typeof POST>[0]);
    const cookies = (res as unknown as { cookies: { getAll: () => Array<[string, { value: string; options?: Record<string, unknown> }]> } }).cookies.getAll();
    const sessionCookie = cookies.find(([name]) => name === "admin_session");
    expect(sessionCookie![1].options?.sameSite).toBe("lax");
  });
});
