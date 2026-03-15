import PostForm from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <main className="flex-1 px-6 py-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#38200D]">New Post</h1>
          <p className="text-sm text-[#38200D]/50 mt-0.5">
            Write and publish a new blog article
          </p>
        </div>
      </div>
      <PostForm />
    </main>
  );
}
