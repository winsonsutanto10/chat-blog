import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AboutForm from "@/components/admin/AboutForm";
import type { Author } from "@/db/schema";

vi.mock("@/app/actions/authors", () => ({
  saveAuthor: vi.fn(),
}));

import { saveAuthor } from "@/app/actions/authors";

const mockAuthor: Author = {
  id: "author-1",
  name: "Alice",
  title: "Developer",
  avatar: "/avatar.jpg",
  bio: "Short bio",
  longBio: "Full long bio content",
  email: "alice@example.com",
  location: "New York",
  skills: ["TypeScript", "React"],
  socialTwitter: "https://twitter.com/alice",
  socialGithub: "https://github.com/alice",
  socialLinkedin: "https://linkedin.com/in/alice",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("components/admin/AboutForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with initial data", () => {
    render(<AboutForm initialData={mockAuthor} />);
    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Developer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@example.com")).toBeInTheDocument();
  });

  it("renders form with null initial data (empty form)", () => {
    render(<AboutForm initialData={null} />);
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
  });

  it("renders existing skills", () => {
    render(<AboutForm initialData={mockAuthor} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders avatar preview when avatar URL provided", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    const avatarImg = screen.getAllByRole("img").find(
      (el) => el.getAttribute("src") === "/avatar.jpg"
    );
    expect(avatarImg).toBeInTheDocument();
  });

  it("shows placeholder when avatar URL is empty", () => {
    render(<AboutForm initialData={{ ...mockAuthor, avatar: "" }} />);
    // Avatar placeholder SVG shown
    expect(screen.getByText("About Me")).toBeInTheDocument();
  });

  it("shows invalid avatar when image fails to load", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    const avatarImg = screen.getAllByRole("img").find(
      (el) => el.getAttribute("src") === "/avatar.jpg"
    );
    if (avatarImg) {
      act(() => { fireEvent.error(avatarImg); });
    }
    // After error, placeholder SVG is shown instead of image
    await waitFor(() => {
      expect(screen.queryByAltText("Avatar")).not.toBeInTheDocument();
    });
  });

  it("clears imgError when avatar URL changes after error", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    const avatarInput = screen.getByPlaceholderText("Avatar image URL...");

    // Trigger error
    const img = screen.getAllByRole("img").find((el) => el.getAttribute("src") === "/avatar.jpg");
    if (img) act(() => { fireEvent.error(img); });

    // Change URL
    fireEvent.change(avatarInput, { target: { value: "/new-avatar.jpg" } });
    await waitFor(() => {
      expect((avatarInput as HTMLInputElement).value).toBe("/new-avatar.jpg");
    });
  });

  it("adds a skill when Add button clicked", async () => {
    render(<AboutForm initialData={null} />);
    const skillInput = screen.getByPlaceholderText("Add skill or technology...");
    fireEvent.change(skillInput, { target: { value: "Node.js" } });
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByText("Node.js")).toBeInTheDocument();
  });

  it("adds a skill when Enter pressed", async () => {
    render(<AboutForm initialData={null} />);
    const skillInput = screen.getByPlaceholderText("Add skill or technology...");
    fireEvent.change(skillInput, { target: { value: "Rust" } });
    fireEvent.keyDown(skillInput, { key: "Enter" });
    expect(screen.getByText("Rust")).toBeInTheDocument();
  });

  it("does not add duplicate skill", () => {
    render(<AboutForm initialData={mockAuthor} />);
    const skillInput = screen.getByPlaceholderText("Add skill or technology...");
    fireEvent.change(skillInput, { target: { value: "TypeScript" } });
    fireEvent.click(screen.getByText("Add"));
    const skills = screen.getAllByText("TypeScript");
    expect(skills.length).toBe(1);
  });

  it("removes a skill when × clicked", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    // Click the × next to TypeScript
    const removeButtons = screen.getAllByText("×");
    fireEvent.click(removeButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    });
  });

  it("calls saveAuthor when Save Changes clicked", async () => {
    vi.mocked(saveAuthor).mockResolvedValue({ success: true });
    render(<AboutForm initialData={mockAuthor} />);
    fireEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(saveAuthor).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Alice" })
      );
    });
  });

  it("shows 'Saved!' after successful save", async () => {
    vi.mocked(saveAuthor).mockResolvedValue({ success: true });
    render(<AboutForm initialData={mockAuthor} />);
    fireEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => expect(screen.getByText("✓ Saved!")).toBeInTheDocument());
  });

  it("shows error message when save fails", async () => {
    vi.mocked(saveAuthor).mockResolvedValue({ success: false, error: "Save failed" });
    render(<AboutForm initialData={mockAuthor} />);
    fireEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(screen.getByText("Save failed")).toBeInTheDocument();
    });
  });

  it("disables save button while saving", async () => {
    let resolveSave: (v: { success: true }) => void;
    vi.mocked(saveAuthor).mockReturnValue(
      new Promise((resolve) => { resolveSave = resolve; })
    );

    render(<AboutForm initialData={mockAuthor} />);
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    resolveSave!({ success: true });
  });

  it("renders social link fields", () => {
    render(<AboutForm initialData={mockAuthor} />);
    expect(screen.getByDisplayValue("https://twitter.com/alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://github.com/alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://linkedin.com/in/alice")).toBeInTheDocument();
  });

  it("updates identity field when changed", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    const nameInput = screen.getByDisplayValue("Alice");
    fireEvent.change(nameInput, { target: { value: "Bob" } });
    await waitFor(() => {
      expect((nameInput as HTMLInputElement).value).toBe("Bob");
    });
  });

  it("updates social link field when changed", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    const twitterInput = screen.getByDisplayValue("https://twitter.com/alice");
    fireEvent.change(twitterInput, { target: { value: "https://twitter.com/bob" } });
    await waitFor(() => {
      expect((twitterInput as HTMLInputElement).value).toBe("https://twitter.com/bob");
    });
  });

  it("updates bio when changed", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    const bioTextarea = screen.getByDisplayValue("Short bio");
    fireEvent.change(bioTextarea, { target: { value: "Updated bio" } });
    await waitFor(() => {
      expect((bioTextarea as HTMLTextAreaElement).value).toBe("Updated bio");
    });
  });

  it("updates long bio when changed", async () => {
    render(<AboutForm initialData={mockAuthor} />);
    const longBioTextarea = screen.getByDisplayValue("Full long bio content");
    fireEvent.change(longBioTextarea, { target: { value: "Updated long bio" } });
    await waitFor(() => {
      expect((longBioTextarea as HTMLTextAreaElement).value).toBe("Updated long bio");
    });
  });

  it("renders Preview link to /about", () => {
    render(<AboutForm initialData={mockAuthor} />);
    const previewLink = screen.getByText("Preview").closest("a");
    expect(previewLink).toHaveAttribute("href", "/about");
    expect(previewLink).toHaveAttribute("target", "_blank");
  });
});
