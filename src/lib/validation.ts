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

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  bio: z.string().trim().max(600, "La biografía no puede superar los 600 caracteres").optional(),
});

export const videoSchema = z.object({
  levelId: z.string().trim().min(1, "Elige un nivel"),
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().trim().min(3, "Añade una descripción breve"),
  videoUrl: z.string().trim().url("Introduce un enlace de vídeo válido"),
  durationMinutes: z.coerce.number().int().min(0).max(600).default(0),
  durationSeconds: z.coerce.number().int().min(0).max(59).default(0),
  isPreview: z.boolean().default(false),
});
