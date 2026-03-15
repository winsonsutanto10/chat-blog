import { getAuthor } from "@/db/queries/authors";
import AboutForm from "@/components/admin/AboutForm";

export default async function AdminAboutPage() {
  const author = await getAuthor();

  return (
    <main className="flex-1 px-6 py-8 overflow-y-auto">
      <AboutForm initialData={author} />
    </main>
  );
}
