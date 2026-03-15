"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions/posts";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
  variant?: "icon" | "danger";
}

export default function DeletePostButton({
  postId,
  postTitle,
  variant = "icon",
}: DeletePostButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const result = await deletePost(postId);
    setDeleting(false);
    setShowModal(false);
    if (result.success) {
      router.push("/admin/posts");
      router.refresh();
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setShowModal(true)}
          className="p-1.5 text-[#38200D]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete post"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors"
        >
          Delete Post
        </button>
      )}

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setShowModal(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Icon */}
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>

            <h2 className="text-center text-lg font-bold text-[#38200D] mb-1">
              Delete Post
            </h2>
            <p className="text-center text-sm text-[#38200D]/60 mb-2">
              Are you sure you want to delete:
            </p>
            <p className="text-center text-sm font-semibold text-[#38200D] bg-[#FFF8F2] rounded-xl px-4 py-2 mb-5 line-clamp-2">
              &ldquo;{postTitle}&rdquo;
            </p>
            <p className="text-center text-xs text-[#38200D]/40 mb-6">
              This action is permanent and cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-[#38200D]/15 text-[#38200D] text-sm font-semibold rounded-xl hover:bg-[#38200D]/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
