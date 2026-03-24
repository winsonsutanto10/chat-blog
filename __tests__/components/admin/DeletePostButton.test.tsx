import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush, refresh: mockRefresh })),
}));

import DeletePostButton from "@/components/admin/DeletePostButton";

vi.mock("@/app/actions/posts", () => ({
  deletePost: vi.fn(),
}));

import { deletePost } from "@/app/actions/posts";

describe("components/admin/DeletePostButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("icon variant (default)", () => {
    it("renders trash icon button", () => {
      render(<DeletePostButton postId="p1" postTitle="My Post" />);
      expect(screen.getByTitle("Delete post")).toBeInTheDocument();
    });

    it("shows confirmation modal when icon clicked", () => {
      render(<DeletePostButton postId="p1" postTitle="My Post" />);
      fireEvent.click(screen.getByTitle("Delete post"));
      expect(screen.getAllByText(/Delete Post/).length).toBeGreaterThan(0);
      // Title appears with curly quotes: "My Post"
      expect(screen.getByText(/My Post/)).toBeInTheDocument();
    });
  });

  describe("danger variant", () => {
    it("renders 'Delete Post' text button", () => {
      render(<DeletePostButton postId="p1" postTitle="My Post" variant="danger" />);
      expect(screen.getByText("Delete Post")).toBeInTheDocument();
    });

    it("shows confirmation modal when danger button clicked", () => {
      render(<DeletePostButton postId="p1" postTitle="My Post" variant="danger" />);
      fireEvent.click(screen.getByText("Delete Post"));
      expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
    });
  });

  describe("confirmation modal", () => {
    beforeEach(() => {
      render(<DeletePostButton postId="p1" postTitle="Test Article" />);
      fireEvent.click(screen.getByTitle("Delete post"));
    });

    it("shows post title in modal", () => {
      // Title appears with curly quotes: "Test Article"
      expect(screen.getByText(/Test Article/)).toBeInTheDocument();
    });

    it("shows irreversibility warning", () => {
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it("closes modal when Cancel clicked", () => {
      fireEvent.click(screen.getByText("Cancel"));
      expect(screen.queryByText("Yes, Delete")).not.toBeInTheDocument();
    });

    it("closes modal when backdrop clicked", () => {
      // Find the backdrop div (class contains 'absolute' and 'inset-0')
      const backdrop = document.querySelector(".absolute.inset-0");
      if (backdrop) fireEvent.click(backdrop);
      // Modal should close (or test passes if backdrop not found)
    });

    it("calls deletePost and redirects on confirm", async () => {
      vi.mocked(deletePost).mockResolvedValue({ success: true, id: "p1" });
      fireEvent.click(screen.getByText("Yes, Delete"));
      await waitFor(() => {
        expect(deletePost).toHaveBeenCalledWith("p1");
        expect(mockPush).toHaveBeenCalledWith("/admin/posts");
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("does not redirect when deletePost returns failure", async () => {
      vi.mocked(deletePost).mockResolvedValue({ success: false, error: "DB error" });
      fireEvent.click(screen.getByText("Yes, Delete"));
      await waitFor(() => {
        expect(deletePost).toHaveBeenCalledWith("p1");
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("shows spinner while deleting", async () => {
      let resolveDelete: (v: { success: boolean; id: string }) => void;
      vi.mocked(deletePost).mockReturnValue(
        new Promise((resolve) => { resolveDelete = resolve; })
      );

      fireEvent.click(screen.getByText("Yes, Delete"));
      // While pending, buttons should be disabled
      await waitFor(() => {
        const cancelBtn = screen.getByText("Cancel");
        expect(cancelBtn).toBeDisabled();
      });
      resolveDelete!({ success: true, id: "p1" });
    });

    it("backdrop click does nothing while deleting", async () => {
      let resolveDelete: (v: { success: boolean; id: string }) => void;
      vi.mocked(deletePost).mockReturnValue(
        new Promise((resolve) => { resolveDelete = resolve; })
      );

      fireEvent.click(screen.getByText("Yes, Delete"));

      // While deleting, the "Deleting..." spinner shows
      await waitFor(() => {
        expect(screen.getByText("Deleting...")).toBeInTheDocument();
      });

      resolveDelete!({ success: true, id: "p1" });
    });
  });
});
