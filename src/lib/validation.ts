import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  email: z.string().trim().toLowerCase().email("Introduce un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  bio: z.string().trim().max(600, "La biografía no puede superar los 600 caracteres").optional(),
});
