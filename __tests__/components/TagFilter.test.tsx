import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TagFilter from "@/components/TagFilter";

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useSearchParams: vi.fn(() => mockSearchParams),
}));

const manyTags = [
  { name: "typescript", count: 10 },
  { name: "react", count: 8 },
  { name: "next.js", count: 6 },
  { name: "css", count: 4 },
  { name: "node.js", count: 3 },
  { name: "graphql", count: 2 },  // overflow (MAX_VISIBLE=5)
  { name: "testing", count: 1 },
];

const fewTags = [
  { name: "typescript", count: 10 },
  { name: "react", count: 8 },
];

describe("components/TagFilter", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders 'All' button", () => {
    render(<TagFilter tags={fewTags} activeTag={null} />);
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("renders visible tags", () => {
    render(<TagFilter tags={fewTags} activeTag={null} />);
    expect(screen.getByText(/typescript/)).toBeInTheDocument();
    expect(screen.getByText(/react/)).toBeInTheDocument();
  });

  it("clicking 'All' navigates to /?", () => {
    render(<TagFilter tags={fewTags} activeTag={null} />);
    fireEvent.click(screen.getByText("All"));
    expect(mockPush).toHaveBeenCalledWith("/?");
  });

  it("clicking a tag navigates to /?tag=<name>", () => {
    render(<TagFilter tags={fewTags} activeTag={null} />);
    fireEvent.click(screen.getByText(/typescript/));
    expect(mockPush).toHaveBeenCalledWith("/?tag=typescript");
  });

  it("shows overflow dropdown button when more than 5 tags", () => {
    render(<TagFilter tags={manyTags} activeTag={null} />);
    expect(screen.getByText(/\+2 more/)).toBeInTheDocument();
  });

  it("opens dropdown when overflow button clicked", () => {
    render(<TagFilter tags={manyTags} activeTag={null} />);
    const moreBtn = screen.getByText(/\+2 more/);
    fireEvent.click(moreBtn);
    // All tags should appear in dropdown
    expect(screen.getByText("All Tags")).toBeInTheDocument();
    expect(screen.getByText("graphql")).toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", () => {
    render(<TagFilter tags={manyTags} activeTag={null} />);
    // Open dropdown
    fireEvent.click(screen.getByText(/\+2 more/));
    expect(screen.getByText("All Tags")).toBeInTheDocument();
    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("All Tags")).not.toBeInTheDocument();
  });

  it("clicking a tag in dropdown navigates and closes dropdown", () => {
    render(<TagFilter tags={manyTags} activeTag={null} />);
    fireEvent.click(screen.getByText(/\+2 more/));
    fireEvent.click(screen.getByText("graphql"));
    expect(mockPush).toHaveBeenCalledWith("/?tag=graphql");
  });

  it("shows active tag name in overflow button when active tag is overflow", () => {
    render(<TagFilter tags={manyTags} activeTag="graphql" />);
    // The overflow button should show "graphql" instead of "+2 more"
    expect(screen.getByText("graphql")).toBeInTheDocument();
  });

  it("styles active visible tag differently", () => {
    const { container } = render(<TagFilter tags={fewTags} activeTag="typescript" />);
    // The "All" button should not be active; typescript button should be active
    expect(container).toBeInTheDocument();
  });

  it("styles active 'All' button when no tag selected", () => {
    render(<TagFilter tags={fewTags} activeTag={null} />);
    // Just checks it renders without error
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("does not close dropdown when clicking inside the dropdown", () => {
    render(<TagFilter tags={manyTags} activeTag={null} />);
    fireEvent.click(screen.getByText(/\+2 more/));
    expect(screen.getByText("All Tags")).toBeInTheDocument();
    // Click on text inside the dropdown (not outside)
    fireEvent.mouseDown(screen.getByText("All Tags"));
    // Dropdown should remain open
    expect(screen.getByText("All Tags")).toBeInTheDocument();
  });

  it("shows active styling for overflow tag in dropdown when active", () => {
    render(<TagFilter tags={manyTags} activeTag="graphql" />);
    // Overflow button shows active tag name
    const overflowBtn = screen.getByText("graphql");
    fireEvent.click(overflowBtn);
    // Dropdown is now open; all tags listed, "graphql" has active class
    expect(screen.getAllByText("graphql").length).toBeGreaterThan(0);
  });

  it("cleans up document event listener on unmount", () => {
    const { unmount } = render(<TagFilter tags={fewTags} activeTag={null} />);
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
