import { describe, it, expect, vi, beforeEach } from "vitest";

const dbState = vi.hoisted(() => ({ result: [] as unknown[] }));

vi.mock("@/db", () => {
  const chain: Record<string, unknown> = {
    get then() {
      return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
        Promise.resolve(dbState.result).then(resolve, reject);
    },
    select: () => chain,
    from: () => chain,
    limit: () => chain,
  };
  return { db: chain };
});

vi.mock("@/db/schema", () => ({
  authors: { id: "id", name: "name" },
}));

import { getAuthor } from "@/db/queries/authors";

describe("db/queries/authors – getAuthor", () => {
  beforeEach(() => {
    dbState.result = [];
  });

  it("returns the first author when one exists", async () => {
    const mockAuthor = {
      id: "author-1",
      name: "Alice",
      title: "Developer",
      avatar: "/avatar.png",
      bio: "Bio",
      longBio: "Long bio",
      email: "alice@example.com",
      location: "NYC",
      skills: ["TypeScript"],
      socialTwitter: "",
      socialGithub: "",
      socialLinkedin: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dbState.result = [mockAuthor];

    const result = await getAuthor();
    expect(result).toEqual(mockAuthor);
  });

  it("returns null when no author exists", async () => {
    dbState.result = [];
    const result = await getAuthor();
    expect(result).toBeNull();
  });
});
