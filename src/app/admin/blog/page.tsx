import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { DeleteBlogPostButton } from "@/components/admin/delete-blog-post-button";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function AdminBlogPage() {
  await requireAdmin();

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Panel privado</p>
          <h1 className="mt-1 font-serif text-3xl text-cream">Blog</h1>
        </div>
        <ButtonLink href="/admin/blog/nueva">+ Nueva entrada</ButtonLink>
      </div>

      <div className="mt-10 divide-y divide-cream/10 rounded-xl border border-cream/10">
        {posts.length === 0 && (
          <p className="px-4 py-6 text-sm text-cream-dim/50">
            Todavía no has escrito ninguna entrada.
          </p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-cream">
                {post.title}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    post.published
                      ? "bg-teal/15 text-teal"
                      : "bg-cream/10 text-cream-dim/70"
                  }`}
                >
                  {post.published ? "Publicada" : "Borrador"}
                </span>
              </p>
              <p className="truncate text-xs text-cream-dim/50">/blog/{post.slug}</p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <Link href={`/admin/blog/${post.id}/editar`} className="text-xs text-gold hover:underline">
                Editar
              </Link>
              <DeleteBlogPostButton postId={post.id} title={post.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
