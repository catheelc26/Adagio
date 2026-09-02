"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validation";
import { signIn } from "@/auth";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con este email. Prueba a iniciar sesión." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      subscription: { create: {} },
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/biblioteca",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No hemos podido iniciar sesión automáticamente. Prueba a entrar manualmente." };
    }
    throw error;
  }

  return {};
}

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/biblioteca",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }

  return {};
}
