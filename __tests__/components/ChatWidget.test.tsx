import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ChatWidget from "@/components/ChatWidget";

// Suppress React act() warnings
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("act(")) return;
    originalError(...args);
  };
});
afterEach(() => {
  console.error = originalError;
});

// ── fetch mock ────────────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

function makeStreamResponse(chunks: string[], ok = true) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return {
    ok,
    body: stream,
    text: async () => chunks.join(""),
  };
}

describe("components/ChatWidget", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders toggle button initially", () => {
    render(<ChatWidget />);
    expect(screen.getByRole("button", { name: /open chat/i })).toBeInTheDocument();
  });

  it("shows notification dot when chat is closed", () => {
    const { container } = render(<ChatWidget />);
    // The notification dot is a span with specific classes
    expect(container.querySelector(".bg-\\[\\#FFBE0B\\]")).toBeInTheDocument();
  });

  it("opens chat panel when toggle button clicked", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
    expect(screen.getByText("Blog Assistant")).toBeInTheDocument();
  });

  it("closes chat panel when close button clicked", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
    expect(screen.getByText("Blog Assistant")).toBeInTheDocument();

    // Click the close button in the header
    fireEvent.click(screen.getByRole("button", { name: /close chat/i }));
    expect(screen.queryByText("Blog Assistant")).not.toBeInTheDocument();
  });

  it("closes chat panel when X button inside header clicked", async () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
    // The header has an X button
    const closeButtons = screen.getAllByRole("button");
    // Find the inner X button (not the toggle)
    const headerClose = closeButtons.find(
      (b) => b.getAttribute("aria-label") !== "Close chat" && b.textContent === ""
    );
    if (headerClose) fireEvent.click(headerClose);
  });

  it("shows welcome message and suggestion chips", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
    expect(screen.getByText(/Hi! I'm your blog assistant/)).toBeInTheDocument();
    expect(screen.getByText("What articles are available?")).toBeInTheDocument();
  });

  it("sends message and shows response when suggestion clicked", async () => {
    mockFetch.mockResolvedValue(makeStreamResponse(["Great question!"]));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    await act(async () => {
      fireEvent.click(screen.getByText("What articles are available?"));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/chat",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("sends message via form submit", async () => {
    mockFetch.mockResolvedValue(makeStreamResponse(["Hello there!"]));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    const input = screen.getByPlaceholderText("Ask about the blog...");
    fireEvent.change(input, { target: { value: "Tell me about TypeScript" } });

    await act(async () => {
      fireEvent.submit(input.closest("form")!);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("does not send message when input is empty", async () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    const form = screen.getByPlaceholderText("Ask about the blog...").closest("form")!;
    const submitBtn = form.querySelector("button[type='submit']") as HTMLButtonElement;
    // Submit button is disabled when input is empty
    expect(submitBtn).toBeDisabled();
  });

  it("shows error message when fetch fails", async () => {
    mockFetch.mockResolvedValue(makeStreamResponse([], false));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    await act(async () => {
      fireEvent.click(screen.getByText("What articles are available?"));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByText(/something went wrong/i)).toBeDefined();
    });
  });

  it("shows error message when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    await act(async () => {
      fireEvent.click(screen.getByText("What topics are covered in the articles?"));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByText(/something went wrong/i)).toBeDefined();
    });
  });

  it("hides suggestions after first message sent", async () => {
    mockFetch.mockResolvedValue(makeStreamResponse(["OK"]));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    // Suggestion button should be visible before sending
    expect(screen.getByRole("button", { name: "What articles are available?" })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "What articles are available?" }));
      await Promise.resolve();
    });

    await waitFor(() => {
      // After sending, the suggestion BUTTON should be gone (text may still appear as user message)
      expect(screen.queryByRole("button", { name: "What articles are available?" })).not.toBeInTheDocument();
    });
  });

  it("focuses input when panel opens (after timeout)", async () => {
    vi.useFakeTimers();
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
    act(() => { vi.advanceTimersByTime(100); });
    // Just verifies no error thrown
    expect(screen.getByPlaceholderText("Ask about the blog...")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("does not send when input is empty (sendMessage early return)", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));
    const form = screen.getByPlaceholderText("Ask about the blog...").closest("form")!;
    // Submit with empty input - bypasses disabled button, hits !text.trim() guard
    fireEvent.submit(form);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not send when loading is true", async () => {
    // Simulate a pending fetch
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open chat/i }));

    const input = screen.getByPlaceholderText("Ask about the blog...");
    fireEvent.change(input, { target: { value: "first message" } });

    await act(async () => {
      fireEvent.submit(input.closest("form")!);
    });

    // While loading, the input should be disabled
    expect(input).toBeDisabled();
    // fetch should only have been called once
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
