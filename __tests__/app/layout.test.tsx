import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ChatWidgetPortal", () => ({
  default: () => <div data-testid="chat-widget-portal">ChatWidgetPortal</div>,
}));

import RootLayout from "@/app/layout";

describe("app/layout – RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <div>Page Content</div>
      </RootLayout>
    );
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  it("renders ChatWidgetPortal", () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId("chat-widget-portal")).toBeInTheDocument();
  });
});
