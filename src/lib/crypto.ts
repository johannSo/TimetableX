import crypto from "crypto";

function resolveKey(): Buffer {
  const raw = process.env.TIMETABLE_CREDENTIALS_KEY;
  if (!raw) {
    throw new Error("TIMETABLE_CREDENTIALS_KEY is not set");
  }

  const base64 = Buffer.from(raw, "base64");
  if (base64.length === 32) return base64;

  return crypto.createHash("sha256").update(raw).digest();
}

const KEY = resolveKey();

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  tag: string;
}

export function encryptString(plainText: string): EncryptedPayload {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const cipherText = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    cipherText: cipherText.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptString(payload: EncryptedPayload): string {
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([
    decipher.update(Buffer.from(payload.cipherText, "base64")),
    decipher.final(),
  ]);
  return plain.toString("utf8");
}
