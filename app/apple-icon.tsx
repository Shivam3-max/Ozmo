import { ImageResponse } from "next/og";
import { BRAND, OzmoMark } from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS adds its own rounded corners, so the background is a full square.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.navy }}>
        <OzmoMark size={120} />
      </div>
    ),
    size
  );
}
