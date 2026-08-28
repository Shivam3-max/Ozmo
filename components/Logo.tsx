type Props = {
  variant?: "onLight" | "onDark";
  size?: number;
  showTagline?: boolean;
  /** Navy rounded-square lockup — keeps the brand's real yellow-on-navy colours on a white page. */
  badge?: boolean;
};

/**
 * Recreation of the Ozmo wordmark: heavy geometric "OZM" with the final O as a
 * filled disc carrying an active figure in negative space.
 *
 * This is an approximation. Drop the client's vector at public/ozmo-logo.svg
 * and swap this for an <Image>/<img> when it arrives.
 */
export default function Logo({
  variant = "onLight",
  size = 26,
  showTagline = false,
  badge = false,
}: Props) {
  const onDark = variant === "onDark" || badge;
  const word = onDark ? "#F7D117" : "var(--ink)";
  const disc = onDark ? "#F7D117" : "var(--ink)";
  const figure = onDark ? "#0F2E3D" : "var(--accent)";
  const tagline = onDark ? "#FFFFFF" : "var(--ink)";

  const mark = (
    <span className="inline-flex flex-col" style={{ lineHeight: 1 }}>
      <svg
        height={size}
        viewBox="0 0 196 56"
        role="img"
        aria-label="Ozmo Diet Clinic"
        style={{ display: "block", overflow: "visible" }}
      >
        <text
          x="0"
          y="45"
          textLength="134"
          lengthAdjust="spacingAndGlyphs"
          fill={word}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "56px",
            fontWeight: 800,
            letterSpacing: "-0.055em",
          }}
        >
          OZM
        </text>

        {/* final O — a solid disc with the figure knocked out */}
        <circle cx="164" cy="27" r="28" fill={disc} />
        {/* head */}
        <circle cx="159.5" cy="15.5" r="5.6" fill={figure} />
        {/* body: a crescent sweeping up to the right, reading as a figure in motion */}
        <path
          d="M145.5 40.8c6.2-1.1 10.3-3.7 12.4-7.9 2.1-4.2 6-6.3 11.7-6.3 3.4 0 6.4 1 9 3.1-4.3.9-7.3 3-9.1 6.3-1.8 3.3-5 5.5-9.6 6.5-4.6 1-9.5.8-14.4-1.7z"
          fill={figure}
        />
      </svg>

      {showTagline && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: size * 0.44,
            letterSpacing: "0.13em",
            color: tagline,
            marginTop: size * 0.26,
          }}
        >
          DIET CLINIC
        </span>
      )}
    </span>
  );

  if (!badge) return mark;

  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl bg-[#0F2E3D]"
      style={{ padding: `${size * 0.5}px ${size * 0.62}px` }}
    >
      {mark}
    </span>
  );
}
