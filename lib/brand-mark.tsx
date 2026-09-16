/**
 * The Ozmo "O" — a yellow disc with the running figure knocked out — for
 * generated images (favicon, app icon, share card). Same geometry as the
 * wordmark in components/Logo.tsx, re-centred on a 56×56 box.
 */
export const BRAND = { navy: "#0F2E3D", yellow: "#F7D117", white: "#FFFFFF" };

export function OzmoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="28" fill={BRAND.yellow} />
      <circle cx="23.5" cy="16.5" r="5.6" fill={BRAND.navy} />
      <path
        d="M9.5 41.8c6.2-1.1 10.3-3.7 12.4-7.9 2.1-4.2 6-6.3 11.7-6.3 3.4 0 6.4 1 9 3.1-4.3.9-7.3 3-9.1 6.3-1.8 3.3-5 5.5-9.6 6.5-4.6 1-9.5.8-14.4-1.7z"
        fill={BRAND.navy}
      />
    </svg>
  );
}
