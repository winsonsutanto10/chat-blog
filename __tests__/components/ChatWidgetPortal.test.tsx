import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
}));

// Mock ChatWidget so we don't test it here
vi.mock("@/components/ChatWidget", () => ({
  default: () => <div data-testid="chat-widget">ChatWidget</div>,
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

import ChatWidgetPortal from "@/components/ChatWidgetPortal";

describe("components/ChatWidgetPortal", () => {
  it("renders ChatWidget on public routes", () => {
    mockUsePathname.mockReturnValue("/");
    render(<ChatWidgetPortal />);
    expect(screen.getByTestId("chat-widget")).toBeInTheDocument();
  });

  it("renders ChatWidget on blog routes", () => {
    mockUsePathname.mockReturnValue("/blog/my-post");
    render(<ChatWidgetPortal />);
    expect(screen.getByTestId("chat-widget")).toBeInTheDocument();
  });

  it("renders ChatWidget on about page", () => {
    mockUsePathname.mockReturnValue("/about");
    render(<ChatWidgetPortal />);
    expect(screen.getByTestId("chat-widget")).toBeInTheDocument();
  });

  it("returns null on /admin routes", () => {
    mockUsePathname.mockReturnValue("/admin");
    const { container } = render(<ChatWidgetPortal />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null on /admin/posts routes", () => {
    mockUsePathname.mockReturnValue("/admin/posts");
    const { container } = render(<ChatWidgetPortal />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null on /login route", () => {
    mockUsePathname.mockReturnValue("/login");
    const { container } = render(<ChatWidgetPortal />);
    expect(container.firstChild).toBeNull();
  });
});
