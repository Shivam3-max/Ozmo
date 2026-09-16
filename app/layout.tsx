import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Public_Sans } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time: no request to Google from a visitor's browser,
// and no third-party stylesheet blocking first paint.
const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage", display: "swap" });
const sans = Public_Sans({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-public-sans", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
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
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${hand.variable}`}>
      <head>
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
