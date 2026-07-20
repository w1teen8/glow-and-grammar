import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { getPresignedUploadUrl } from "@/lib/storage";

// Lesson attachments include recorded video (e.g. a Zoom MP4), not just
// worksheets — 20MB was fine for PDFs but far too small for that. R2's free
// tier is 10GB total storage, so a handful of large recordings will still
// eat into it; overage beyond that is billed at $0.015/GB-month.
const MAX_SIZE_BYTES = 2 * 1024 * 1024 * 1024;

// Step 1 of the direct-to-R2 upload flow: the browser asks us for a signed
// URL, then PUTs the file bytes straight to R2 itself — our server never
// touches the file, so large files don't get buffered through Render's
// free-tier instance (slow, memory-limited, prone to timing out).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
    if (!lesson) return jsonError("Not found", 404);

    const { filename, contentType, size } = await req.json();
    if (!filename || !contentType) return jsonError("filename and contentType are required");
    if (typeof size === "number" && size > MAX_SIZE_BYTES) return jsonError("File is too large (max 2GB)");

    const ext = path.extname(filename) || "";
    const key = `lessons/${lesson.id}-${Date.now()}${ext}`;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, publicUrl });
  });
}
