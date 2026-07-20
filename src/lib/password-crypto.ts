import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Any-length secret from the env is hashed down to a valid 32-byte AES key —
// so PASSWORD_ENCRYPTION_KEY can be any random string, not a precise-length one.
function getKey(): Buffer {
  const secret = process.env.PASSWORD_ENCRYPTION_KEY;
  if (!secret) throw new Error("PASSWORD_ENCRYPTION_KEY is not set");
  return crypto.createHash("sha256").update(secret).digest();
}

// Stored as "iv.authTag.ciphertext", each base64 — reversible only with the
// server-side key, unlike passwordHash which is never decryptable.
export function encryptPassword(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, ciphertext].map((b) => b.toString("base64")).join(".");
}

export function decryptPassword(stored: string): string {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(".");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plain = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, "base64")), decipher.final()]);
  return plain.toString("utf8");
}
