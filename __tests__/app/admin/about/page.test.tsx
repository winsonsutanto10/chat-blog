import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/admin/AboutForm", () => ({
  default: ({ initialData }: { initialData: unknown }) => (
    <div data-testid="about-form" data-has-data={initialData ? "true" : "false"}>
      AboutForm
    </div>
  ),
}));

vi.mock("@/db/queries/authors", () => ({
  getAuthor: vi.fn(),
}));

import AdminAboutPage from "@/app/admin/about/page";
import { getAuthor } from "@/db/queries/authors";

describe("app/admin/about/page – AdminAboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders AboutForm when author exists", async () => {
    vi.mocked(getAuthor).mockResolvedValue({
      id: "author-1",
      name: "Alice",
      title: "Developer",
      bio: "A bio",
      avatar: "/av.jpg",
      email: "a@a.com",
      location: "Somewhere",
      skills: ["TypeScript"],
      socialLinks: {},
      postsCount: 5,
      totalReadTime: 20,
      uniqueTopics: 3,
    });
    const jsx = await AdminAboutPage();
    render(jsx);
    const form = screen.getByTestId("about-form");
    expect(form).toBeInTheDocument();
    expect(form.getAttribute("data-has-data")).toBe("true");
  });

  it("renders AboutForm with null when no author", async () => {
    vi.mocked(getAuthor).mockResolvedValue(null);
    const jsx = await AdminAboutPage();
    render(jsx);
    const form = screen.getByTestId("about-form");
    expect(form).toBeInTheDocument();
    expect(form.getAttribute("data-has-data")).toBe("false");
  });
});
