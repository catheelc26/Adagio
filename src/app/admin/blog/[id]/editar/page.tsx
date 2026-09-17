import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateBlogPostAction } from "@/lib/actions/admin-blog";
import { BlogForm } from "@/components/admin/blog-form";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Editar entrada",
};

type Params = Promise<{ id: string }>;

export default async function EditBlogPostPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      coverImageUrl: true,
      published: true,
    },
  });

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <Eyebrow>Panel privado</Eyebrow>
      <h1 className="mt-1 font-serif text-3xl text-cream">Editar entrada</h1>

      <div className="mt-8 rounded-2xl border border-cream/10 bg-navy-900/60 p-8">
        <BlogForm action={updateBlogPostAction} post={post} />
      </div>
    </div>
  );
}
