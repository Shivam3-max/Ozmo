import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ozmodietclinic.com"),
  title: {
    default: "Ozmo Diet Clinic — Personalised Nutrition Programmes with a Real Dietitian",
    template: "%s | Ozmo Diet Clinic",
  },
  description:
    "Personalised diet and lifestyle programmes built around your body, your kitchen and your reports — with daily tracking, follow-ups and a dietitian who stays with you.",
  openGraph: {
    type: "website",
    siteName: "Ozmo Diet Clinic",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Caveat:wght@500;600&family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#FFFFFF" />
        {/* Scroll reveals are progressive enhancement — without JS the content must still be visible. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
