import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { createBlogPostAction } from "@/lib/actions/admin-blog";
import { BlogForm } from "@/components/admin/blog-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Nueva entrada",
};

export default async function NewBlogPostPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <Eyebrow>Panel privado</Eyebrow>
      <h1 className="mt-1 font-serif text-3xl text-cream">Nueva entrada</h1>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        <BlogForm action={createBlogPostAction} />
      </div>
    </div>
  );
}
