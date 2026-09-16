import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decryptDocument, documentsConfigured, encryptDocument } from "./crypto";
import { downloadName, sniffDocumentType } from "./files";

describe("document encryption", () => {
  const original = process.env.DOCUMENT_ENCRYPTION_KEY;
  beforeEach(() => { process.env.DOCUMENT_ENCRYPTION_KEY = randomBytes(32).toString("base64"); });
  afterEach(() => { process.env.DOCUMENT_ENCRYPTION_KEY = original; });

  it("round-trips the file", () => {
    const plain = Buffer.from("%PDF-1.7 blood test results");
    const enc = encryptDocument("doc-1", plain);
    expect(enc.ciphertext.equals(plain)).toBe(false);
    expect(decryptDocument("doc-1", enc).equals(plain)).toBe(true);
  });

  it("refuses ciphertext moved to another document", () => {
    const enc = encryptDocument("doc-1", Buffer.from("secret"));
    expect(() => decryptDocument("doc-2", enc)).toThrow();
  });

  it("refuses tampered ciphertext", () => {
    const enc = encryptDocument("doc-1", Buffer.from("secret"));
    enc.ciphertext[0] ^= 0xff;
    expect(() => decryptDocument("doc-1", enc)).toThrow();
  });

  it("refuses the wrong key", () => {
    const enc = encryptDocument("doc-1", Buffer.from("secret"));
    process.env.DOCUMENT_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    expect(() => decryptDocument("doc-1", enc)).toThrow();
  });

  it("is off without a 32-byte key", () => {
    process.env.DOCUMENT_ENCRYPTION_KEY = Buffer.from("too short").toString("base64");
    expect(documentsConfigured()).toBe(false);
    delete process.env.DOCUMENT_ENCRYPTION_KEY;
    expect(documentsConfigured()).toBe(false);
    expect(() => encryptDocument("doc-1", Buffer.from("x"))).toThrow(/DOCUMENT_ENCRYPTION_KEY/);
  });
});

describe("sniffDocumentType", () => {
  it("recognises PDF, PNG and JPEG by their bytes", () => {
    expect(sniffDocumentType(Buffer.from("%PDF-1.4"))?.mime).toBe("application/pdf");
    expect(sniffDocumentType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))?.mime).toBe("image/png");
    expect(sniffDocumentType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe("image/jpeg");
  });

  it("rejects anything else, whatever it's called", () => {
    expect(sniffDocumentType(Buffer.from("<html><script>alert(1)</script>"))).toBeNull();
    expect(sniffDocumentType(Buffer.from("<svg xmlns"))).toBeNull();
    expect(sniffDocumentType(Buffer.from("PK\x03\x04"))).toBeNull();
    expect(sniffDocumentType(Buffer.alloc(0))).toBeNull();
  });
});

describe("downloadName", () => {
  it("keeps names header-safe", () => {
    expect(downloadName('Blood "test"\r\nSet-Cookie: x', "pdf")).toBe("Blood-test-Set-Cookie-x.pdf");
    expect(downloadName("   ", "png")).toBe("document.png");
  });
});
