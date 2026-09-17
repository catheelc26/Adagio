"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { blogPostSchema } from "@/lib/validation";
import { slugify } from "@/lib/slugify";
import type { FormState } from "@/lib/actions/auth";

function parseBlogPostForm(formData: FormData) {
  return blogPostSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl") || "",
    published: formData.get("published") === "on",
  });
}

async function uniqueSlugFor(title: string, excludeId?: string) {
  const base = slugify(title) || "entrada";
  let slug = base;
  let counter = 2;

  while (
    await prisma.blogPost.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function createBlogPostAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parseBlogPostForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { title, excerpt, content, coverImageUrl, published } = parsed.data;
  const slug = await uniqueSlugFor(title);

  await prisma.blogPost.create({
    data: {
      slug,
      title,
      excerpt,
      content,
      coverImageUrl,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updateBlogPostAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const postId = formData.get("postId");
  if (typeof postId !== "string" || !postId) {
    return { error: "Falta el identificador de la entrada." };
  }

  const parsed = parseBlogPostForm(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!existing) return { error: "Esa entrada ya no existe. Recarga la página." };

  const { title, excerpt, content, coverImageUrl, published } = parsed.data;
  const slug = title === existing.title ? existing.slug : await uniqueSlugFor(title, postId);

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      slug,
      title,
      excerpt,
      content,
      coverImageUrl,
      published,
      publishedAt: published ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  if (slug !== existing.slug) revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireAdmin();

  const postId = formData.get("postId");
  if (typeof postId !== "string" || !postId) return;

  await prisma.blogPost.delete({ where: { id: postId } });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
