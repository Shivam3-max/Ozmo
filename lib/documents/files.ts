/** Upload rules shared by the staff and portal upload forms and the API. */
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_MB = MAX_DOCUMENT_BYTES / (1024 * 1024);
export const ACCEPT_ATTRIBUTE = "application/pdf,image/jpeg,image/png";

const SIGNATURES: { mime: string; ext: string; bytes: number[] }[] = [
  { mime: "application/pdf", ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF-
  { mime: "image/png", ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/jpeg", ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
];

/**
 * The file's real type, from its first bytes — never the name or the browser's
 * claimed type, which the uploader controls. Null for anything not allowed.
 */
export function sniffDocumentType(head: Uint8Array) {
  return SIGNATURES.find((s) => s.bytes.every((b, i) => head[i] === b)) ?? null;
}

export const DOCUMENT_TYPES = ["LAB_REPORT", "DIET_PLAN", "PROGRESS_REPORT", "CONSULT_NOTE", "INVOICE", "OTHER"] as const;
export type DocumentTypeValue = (typeof DOCUMENT_TYPES)[number];
/** What a client may label their own uploads as. */
export const CLIENT_DOCUMENT_TYPES = ["LAB_REPORT", "OTHER"] as const satisfies readonly DocumentTypeValue[];

export const DOCUMENT_LABEL: Record<DocumentTypeValue, string> = {
  LAB_REPORT: "Lab report",
  DIET_PLAN: "Diet plan",
  PROGRESS_REPORT: "Progress report",
  CONSULT_NOTE: "Consultation note",
  INVOICE: "Invoice",
  OTHER: "Document",
};

/** A download filename that's safe in a header on every browser. */
export function downloadName(title: string, ext: string) {
  const base = title.normalize("NFKD").replace(/[^\w\- ]+/g, " ").trim().replace(/\s+/g, "-").slice(0, 80) || "document";
  return `${base}.${ext}`;
}

export const extensionFor = (mime: string) => SIGNATURES.find((s) => s.mime === mime)?.ext ?? "bin";
