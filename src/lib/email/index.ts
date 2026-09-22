import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { after } from "next/server";
import type { RenderedEmail } from "./templates";

/**
 * SMTP email delivery.
 *
 * Env:
 *   SMTP_HOST, SMTP_PORT (465 = SSL, 587 = STARTTLS), SMTP_USER, SMTP_PASS
 *   SMTP_SECURE ("true"/"false" — defaults to true when port is 465)
 *   MAIL_FROM   e.g. "glee.ng <hello@glee.ng>"
 *   APP_URL     public site URL used in links, e.g. https://glee.ng
 *
 * If SMTP isn't configured, emails are printed to the server console instead (handy in development).
 */

let transporter: Transporter | null = null;

export const emailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    pool: true,
    maxConnections: 3,
  });
  return transporter;
}

export async function sendEmail(to: string, email: RenderedEmail): Promise<boolean> {
  if (!to) return false;
  if (!emailConfigured()) {
    console.info(`[email:dev] SMTP not configured — would send "${email.subject}" to ${to}\n${email.text}\n`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || `glee.ng <${process.env.SMTP_USER}>`,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return true;
  } catch (e) {
    console.error(`[email] Failed to send "${email.subject}" to ${to}:`, (e as Error).message);
    return false;
  }
}

/**
 * Send after the HTTP response has gone out, so a slow mail server never delays the user.
 * Build the email inside `make` — it runs after the response too.
 */
export function sendLater(to: string | undefined, make: () => RenderedEmail | null) {
  if (!to) return;
  after(async () => {
    const email = make();
    if (email) await sendEmail(to, email);
  });
}
