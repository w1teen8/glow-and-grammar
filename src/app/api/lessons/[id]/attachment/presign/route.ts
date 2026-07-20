import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { getPresignedUploadUrl } from "@/lib/storage";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

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
    if (typeof size === "number" && size > MAX_SIZE_BYTES) return jsonError("File is too large (max 20MB)");

    const ext = path.extname(filename) || "";
    const key = `lessons/${lesson.id}-${Date.now()}${ext}`;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, publicUrl });
  });
}
