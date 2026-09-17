import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sanitizeBlogContent } from "@/lib/sanitize-blog-content";

type Params = Promise<{ slug: string }>;

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!post || (!post.published && !isAdmin)) notFound();

  const safeContent = sanitizeBlogContent(post.content);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      <nav className="text-xs text-cream-dim/60">
        <Link href="/blog" className="hover:text-gold">Blog</Link>
      </nav>

      {!post.published && (
        <p className="mt-6 rounded-lg border border-gold/30 bg-gold/5 px-4 py-2 text-xs text-gold">
          Borrador — solo visible para ti como administradora.
        </p>
      )}

      {post.coverImageUrl && (
        <div className="mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-cream/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {post.publishedAt && (
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-gold/70">
          {new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(post.publishedAt)}
        </p>
      )}
      <h1 className="mt-2 font-serif text-3xl text-cream sm:text-4xl">{post.title}</h1>

      <div
        className="mt-8 text-base leading-relaxed text-cream-dim/85 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-cream [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:text-cream [&_p]:my-4 [&_strong]:text-cream [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </div>
  );
}
