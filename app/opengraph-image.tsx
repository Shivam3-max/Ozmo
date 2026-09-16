import { ImageResponse } from "next/og";
import { BRAND, OzmoMark } from "@/lib/brand-mark";

export const alt = "Ozmo Diet Clinic — personalised nutrition programmes with a real dietitian";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default share card for every page that doesn't define its own. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          background: BRAND.navy, color: BRAND.white, padding: "72px 84px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -4, color: BRAND.yellow, display: "flex" }}>OZM</div>
          <OzmoMark size={78} />
          <div style={{ marginLeft: 18, fontSize: 26, letterSpacing: 6, color: BRAND.white, opacity: 0.8, display: "flex" }}>DIET CLINIC</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 940, display: "flex" }}>
            Nutrition built around your body, your kitchen and your reports.
          </div>
          <div style={{ fontSize: 30, opacity: 0.8, display: "flex" }}>
            Personalised programmes · daily tracking · a dietitian who stays with you
          </div>
        </div>
        <div style={{ display: "flex", height: 10, width: 180, background: BRAND.yellow, borderRadius: 999 }} />
      </div>
    ),
    size
  );
}
