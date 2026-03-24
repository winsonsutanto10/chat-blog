import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    <a href={href}>{children}</a>,
}));

describe("components/Footer", () => {
  it("renders brand name", () => {
    render(<Footer />);
    expect(screen.getByText("ChatBlog")).toBeInTheDocument();
  });

  it("renders copyright with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("renders Quick Links section", () => {
    render(<Footer />);
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Footer />);
    const homeLinks = screen.getAllByRole("link", { name: "Home" });
    expect(homeLinks[0]).toHaveAttribute("href", "/");

    const aboutLinks = screen.getAllByRole("link", { name: "About" });
    expect(aboutLinks[0]).toHaveAttribute("href", "/about");
  });

  it("renders tagline text", () => {
    render(<Footer />);
    expect(screen.getByText(/personal space for ideas/i)).toBeInTheDocument();
  });

  it("renders tech credit", () => {
    render(<Footer />);
    expect(screen.getByText(/Next\.js & Tailwind CSS/i)).toBeInTheDocument();
  });
});
