import { describe, it, expect, vi, beforeEach } from "vitest";

const dbState = vi.hoisted(() => ({ result: [] as unknown[] }));

vi.mock("@/db", () => {
  const chain: Record<string, unknown> = {
    get then() {
      return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
        Promise.resolve(dbState.result).then(resolve, reject);
    },
    insert: () => chain,
    values: () => chain,
    update: () => chain,
    set: () => chain,
    where: () => chain,
  };
  return { db: chain };
});

vi.mock("@/db/schema", () => ({
  authors: { id: "id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db/queries/authors", () => ({
  getAuthor: vi.fn(),
}));

import { saveAuthor } from "@/app/actions/authors";
import { getAuthor } from "@/db/queries/authors";
import { revalidatePath } from "next/cache";

const baseAuthorData = {
  name: "Alice",
  title: "Developer",
  avatar: "/avatar.png",
  bio: "Short bio",
  longBio: "Long bio content",
  email: "alice@example.com",
  location: "NYC",
  skills: ["TypeScript", "React"],
  social: {
    twitter: "https://twitter.com/alice",
    github: "https://github.com/alice",
    linkedin: "https://linkedin.com/in/alice",
  },
};

const mockExistingAuthor = {
  id: "author-1",
  name: "Alice",
  title: "Developer",
  avatar: "/avatar.png",
  bio: "Bio",
  longBio: "",
  email: "alice@example.com",
  location: "NYC",
  skills: [],
  socialTwitter: "",
  socialGithub: "",
  socialLinkedin: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("app/actions/authors – saveAuthor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbState.result = [];
  });

  it("updates existing author when one exists", async () => {
    vi.mocked(getAuthor).mockResolvedValue(mockExistingAuthor);
    const result = await saveAuthor(baseAuthorData);
    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/about");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/about");
  });

  it("inserts new author when none exists", async () => {
    vi.mocked(getAuthor).mockResolvedValue(null);
    const result = await saveAuthor(baseAuthorData);
    expect(result).toEqual({ success: true });
  });

  it("catches Error and returns error result", async () => {
    vi.mocked(getAuthor).mockRejectedValue(new Error("DB failure"));
    const result = await saveAuthor(baseAuthorData);
    expect(result).toEqual({ success: false, error: "DB failure" });
  });

  it("handles non-Error exceptions", async () => {
    vi.mocked(getAuthor).mockRejectedValue("raw error");
    const result = await saveAuthor(baseAuthorData);
    expect(result).toEqual({ success: false, error: "Failed to save profile." });
  });
});
