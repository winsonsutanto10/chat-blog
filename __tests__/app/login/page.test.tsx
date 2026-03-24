import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Suspense } from "react";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush, refresh: mockRefresh })),
  useSearchParams: vi.fn(() => mockSearchParams),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import LoginPage from "@/app/login/page";

describe("app/login/page – LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login page heading", () => {
    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );
    expect(screen.getByText("ChatBlog CMS")).toBeInTheDocument();
  });

  it("renders username and password fields", () => {
    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("renders Sign In button", () => {
    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    expect(passwordInput).toHaveAttribute("type", "password");

    // Find the toggle button (eye icon button)
    const toggleBtn = passwordInput.parentElement!.querySelector("button");
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute("type", "text");

      // Toggle back
      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute("type", "password");
    }
  });

  it("submits form and redirects on success", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({ method: "POST" })
      );
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("shows error message on failed login", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows generic error on failed login without error field", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Login failed.")).toBeInTheDocument();
    });
  });

  it("shows error on network failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    });
  });

  it("shows loading spinner while submitting", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves

    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });
  });

  it("uses 'from' query param for redirect destination", async () => {
    const { useSearchParams } = await import("next/navigation");
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("from=/admin/posts") as ReturnType<typeof useSearchParams>
    );

    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    render(
      <Suspense>
        <LoginPage />
      </Suspense>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/posts");
    });
  });
});
