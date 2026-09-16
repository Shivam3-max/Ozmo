"use client";

// Replaces the root layout when it fails, so it can't rely on globals.css.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", color: "#0F2E3D", background: "#FFFFFF" }}>
        <title>Something went wrong | Ozmo Diet Clinic</title>
        <main role="alert" style={{ maxWidth: 560, margin: "0 auto", padding: "64px 24px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B3402F" }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: 34, lineHeight: 1.15, margin: "16px 0 0" }}>Ozmo didn&rsquo;t load</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#4E6672" }}>
            Please try again. If it keeps happening, contact the clinic and quote the reference below.
          </p>
          {error.digest && (
            <p style={{ fontSize: 14, color: "#4E6672" }}>
              Reference <code>{error.digest}</code>
            </p>
          )}
          <button
            onClick={() => retry()}
            style={{ marginTop: 24, minHeight: 46, padding: "0 24px", borderRadius: 999, border: 0, background: "#0F2E3D", color: "#FFFFFF", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
