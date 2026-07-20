import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-compatible — same SDK, just a different endpoint.
// Falls back to null (caller must handle) if env vars aren't set yet, so the
// app doesn't crash at import time before R2 is configured in Render.
function getClient() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function isStorageConfigured(): boolean {
  return !!getClient() && !!process.env.R2_BUCKET_NAME && !!process.env.R2_PUBLIC_URL;
}

// `key` is the path within the bucket, e.g. "lessons/abc123-1699999999.pdf".
// Returns the public URL to store on the row (audioUrl, photoUrl, etc.).
export async function uploadToStorage(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const client = getClient();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBase = process.env.R2_PUBLIC_URL;
  if (!client || !bucket || !publicBase) {
    throw new Error("R2 storage is not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_URL)");
  }

  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType })
  );

  return `${publicBase.replace(/\/$/, "")}/${key}`;
}

// Best-effort — callers don't need to fail the request if cleanup of the old
// file fails (e.g. it was already gone).
export async function deleteFromStorage(publicUrl: string): Promise<void> {
  const client = getClient();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBase = process.env.R2_PUBLIC_URL;
  if (!client || !bucket || !publicBase) return;
  if (!publicUrl.startsWith(publicBase)) return;

  const key = publicUrl.slice(publicBase.replace(/\/$/, "").length + 1);
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    // Ignore — non-critical cleanup.
  }
}
