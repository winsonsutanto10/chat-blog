import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockPush, mockRefresh, mockUsePathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockUsePathname: vi.fn(() => "/admin"),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
  useRouter: vi.fn(() => ({ push: mockPush, refresh: mockRefresh })),
}));

import AdminSidebar from "@/components/admin/AdminSidebar";

vi.mock("next/link", () => ({
  default: ({ href, children, className, target }: { href: string; children: React.ReactNode; className?: string; target?: string }) =>
    <a href={href} className={className} target={target}>{children}</a>,
}));

// Mock fetch for logout
vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true })));

describe("components/admin/AdminSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/admin");
  });

  it("renders ChatBlog CMS logo", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("ChatBlog")).toBeInTheDocument();
    expect(screen.getByText("CMS")).toBeInTheDocument();
  });

  it("renders all nav items", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("All Posts")).toBeInTheDocument();
    expect(screen.getByText("New Post")).toBeInTheDocument();
    expect(screen.getByText("About Me")).toBeInTheDocument();
  });

  it("renders View Site link", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("View Site")).toBeInTheDocument();
  });

  it("renders Log Out button", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("applies active style to Dashboard when on /admin", () => {
    mockUsePathname.mockReturnValue("/admin");
    render(<AdminSidebar />);
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink.className).toContain("bg-[#FB5607]");
  });

  it("applies active style to All Posts when on /admin/posts", () => {
    mockUsePathname.mockReturnValue("/admin/posts");
    render(<AdminSidebar />);
    const postsLink = screen.getByRole("link", { name: /all posts/i });
    expect(postsLink.className).toContain("bg-[#FB5607]");
  });

  it("applies active style when pathname starts with nav href for sub-paths", () => {
    mockUsePathname.mockReturnValue("/admin/posts/new");
    render(<AdminSidebar />);
    const newPostLink = screen.getByRole("link", { name: /new post/i });
    expect(newPostLink.className).toContain("bg-[#FB5607]");
  });

  it("applies active style to About Me when on /admin/about", () => {
    mockUsePathname.mockReturnValue("/admin/about");
    render(<AdminSidebar />);
    const aboutLink = screen.getByRole("link", { name: /about me/i });
    expect(aboutLink.className).toContain("bg-[#FB5607]");
  });

  it("calls logout endpoint and redirects on Log Out click", async () => {
    render(<AdminSidebar />);
    fireEvent.click(screen.getByText("Log Out"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
