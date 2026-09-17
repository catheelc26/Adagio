import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos de The Adagio Method sobre danza, anatomía, fisioterapia y conciencia corporal.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <SectionHeading
        eyebrow="Blog"
        title="Notas de The Adagio Method"
        description="Reflexiones, guías y novedades sobre danza, ciencia del movimiento y conciencia corporal."
        align="center"
      />

      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-cream/10 bg-navy-900/50 transition-colors hover:border-gold/30"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-linear-to-br from-navy-800 to-navy-950">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-accent italic text-2xl text-gold/50">Adagio</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              {post.publishedAt && (
                <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
                  {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(post.publishedAt)}
                </p>
              )}
              <h2 className="mt-2 font-serif text-xl text-cream">{post.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-cream-dim/70">
                {post.excerpt}
              </p>
              <span className="mt-4 text-sm text-gold opacity-0 transition-opacity group-hover:opacity-100">
                Leer más →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="mt-14 text-center text-sm text-cream-dim/60">
          Todavía no hay entradas publicadas. Vuelve pronto.
        </p>
      )}
    </div>
  );
}
