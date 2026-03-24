import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/admin"),
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}));

vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true })));

import AdminLayout from "@/app/admin/layout";

describe("app/admin/layout – AdminLayout", () => {
  it("renders children content", () => {
    render(
      <AdminLayout>
        <div>Page Content</div>
      </AdminLayout>
    );
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  it("renders AdminSidebar (ChatBlog CMS branding)", () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    expect(screen.getByText("ChatBlog")).toBeInTheDocument();
    expect(screen.getByText("CMS")).toBeInTheDocument();
  });

  it("renders sidebar and main content side by side", () => {
    const { container } = render(
      <AdminLayout>
        <div>Content Here</div>
      </AdminLayout>
    );
    // The outer div should have flex layout
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("flex");
  });
});
