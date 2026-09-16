/**
 * One stored form for every phone number: "+" and digits only (E.164).
 *
 * People type "98888 77777", "098888-77777" and "+91 (98888) 77777" for the
 * same phone, which used to become three different leads and broke portal
 * sign-in by phone. Numbers without a country code are taken as Indian — the
 * clinic's own market — and anything ambiguous is rejected rather than guessed.
 */
const DEFAULT_COUNTRY = "91";

export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 24 || !/^\+?[\d\s\-().]+$/.test(raw)) return null;

  let digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) {
    // Already international.
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.length === 10 && !digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY + digits;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY + digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith(DEFAULT_COUNTRY)) {
    // "91" typed without the plus.
  } else {
    return null;
  }

  if (digits.length < 8 || digits.length > 15 || digits.startsWith("0")) return null;
  // Indian numbers are always ten digits after the country code.
  if (digits.startsWith(DEFAULT_COUNTRY) && digits.length !== 12) return null;
  return `+${digits}`;
}

/** Readable form for staff screens: "+91 98888 77777". Unknown shapes pass through. */
export function formatPhone(phone: string | null | undefined) {
  if (!phone) return "";
  const m = phone.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}
