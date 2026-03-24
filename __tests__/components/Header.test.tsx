import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}));

describe("components/Header", () => {
  it("renders the ChatBlog brand name", () => {
    render(<Header />);
    expect(screen.getByText("ChatBlog")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("links to correct hrefs", () => {
    render(<Header />);
    const homeLinks = screen.getAllByRole("link", { name: /chatblog/i });
    expect(homeLinks[0]).toHaveAttribute("href", "/");

    const aboutLink = screen.getByRole("link", { name: "About" });
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  it("renders hamburger menu button for mobile", () => {
    render(<Header />);
    // There's a button (hamburger icon) for mobile nav
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
