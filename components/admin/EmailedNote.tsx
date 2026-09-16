/** What happened to the email sent alongside an action, in words staff can act on. */
export type Emailed = "QUEUED" | "SENT" | "FAILED" | "SKIPPED" | "NO_ADDRESS" | null | undefined;

export function emailedText(status: Emailed, what: string) {
  switch (status) {
    case "SENT": return `We've emailed ${what}.`;
    case "QUEUED": return `The email with ${what} is queued.`;
    case "FAILED": return `The email with ${what} couldn't be sent — share it directly. It can be retried from Notifications.`;
    case "SKIPPED": return `Email isn't set up yet, so nothing was sent — share ${what} directly.`;
    case "NO_ADDRESS": return `There's no email address on file, so nothing was sent — share ${what} directly.`;
    default: return null;
  }
}

export default function EmailedNote({ status, what }: { status: Emailed; what: string }) {
  const text = emailedText(status, what);
  if (!text) return null;
  const good = status === "SENT" || status === "QUEUED";
  return (
    <p role="status" className={`text-[12.5px] leading-relaxed ${good ? "text-[var(--good)]" : "text-[var(--ink-2)]"}`}>
      {text}
    </p>
  );
}
