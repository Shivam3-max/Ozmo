import { ImageResponse } from "next/og";
import { BRAND, OzmoMark } from "@/lib/brand-mark";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.navy, borderRadius: 10 }}>
        <OzmoMark size={38} />
      </div>
    ),
    size
  );
}
