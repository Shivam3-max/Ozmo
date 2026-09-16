import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Client documents (lab reports, scans) are encrypted with AES-256-GCM before
 * they reach the database, so a leaked backup or SQL dump doesn't expose them.
 * The document id is bound in as associated data: ciphertext copied onto
 * another document's row fails to decrypt instead of showing the wrong file.
 */
export const KEY_VERSION = 1;

export class DocumentKeyMissing extends Error {
  constructor() {
    super("DOCUMENT_ENCRYPTION_KEY is not set or is not 32 bytes of base64.");
    this.name = "DocumentKeyMissing";
  }
}

function key(version: number) {
  if (version !== KEY_VERSION) throw new Error(`No document key for version ${version}.`);
  const raw = process.env.DOCUMENT_ENCRYPTION_KEY?.trim();
  const bytes = raw ? Buffer.from(raw, "base64") : null;
  if (!bytes || bytes.length !== 32) throw new DocumentKeyMissing();
  return bytes;
}

export function documentsConfigured() {
  try {
    key(KEY_VERSION);
    return true;
  } catch {
    return false;
  }
}

export function encryptDocument(documentId: string, plaintext: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(KEY_VERSION), iv);
  cipher.setAAD(Buffer.from(documentId, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { keyVersion: KEY_VERSION, iv, authTag: cipher.getAuthTag(), ciphertext };
}

export function decryptDocument(
  documentId: string,
  file: { keyVersion: number; iv: Uint8Array; authTag: Uint8Array; ciphertext: Uint8Array }
) {
  const decipher = createDecipheriv("aes-256-gcm", key(file.keyVersion), file.iv);
  decipher.setAAD(Buffer.from(documentId, "utf8"));
  decipher.setAuthTag(file.authTag);
  return Buffer.concat([decipher.update(file.ciphertext), decipher.final()]);
}
