import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing email over SMTP — Hostinger mailboxes (smtp.hostinger.com, port 465)
 * or any other provider. Configured entirely through environment variables:
 *
 *   SMTP_HOST, SMTP_PORT (465 = implicit TLS, 587 = STARTTLS), SMTP_USER,
 *   SMTP_PASSWORD, EMAIL_FROM ("Ozmo Diet Clinic <no-reply@ozmodietclinic.com>")
 *
 * Without them, nothing is sent and every notification is recorded as skipped,
 * so staff still see the link to pass on by hand.
 */
export function emailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM);
}

let transporter: Transporter | null = null;

function transport() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const local = host === "localhost" || host === "127.0.0.1";
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    // Real providers must use TLS; only a local relay/test sink may skip it.
    requireTLS: !local && port !== 465,
    ignoreTLS: local,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

export async function sendEmail(message: { to: string; subject: string; text: string }) {
  await transport().sendMail({ from: process.env.EMAIL_FROM, to: message.to, subject: message.subject, text: message.text });
}

/** Addresses we invented for clients without email; never send to them. */
export const isDeliverableEmail = (email: string | null | undefined): email is string =>
  Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.endsWith("@no-email.ozmo.local") && !email.endsWith(".erased.ozmo.local"));
