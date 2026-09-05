import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
export const isEmailConfigured = Boolean(resend);

const FROM = process.env.EMAIL_FROM || "The Adagio Method <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY no configurada. Enlace de restablecimiento para ${to}: ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Restablece tu contraseña de The Adagio Method",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1a1a2e;">
        <h1 style="font-size: 20px;">Restablece tu contraseña</h1>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en The Adagio Method.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #c9a24b; color: #1a1a2e; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600;">
            Elegir una nueva contraseña
          </a>
        </p>
        <p style="font-size: 13px; color: #555;">
          Este enlace caduca en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo con tranquilidad.
        </p>
      </div>
    `,
  });
}
