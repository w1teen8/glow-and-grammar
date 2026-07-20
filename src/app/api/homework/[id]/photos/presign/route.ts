import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { getPresignedUploadUrl } from "@/lib/storage";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Step 1 of the direct-to-R2 upload flow — see lessons/[id]/attachment/presign
// for why this exists instead of relaying the file through our server.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!homework) return jsonError("Not found", 404);
    if (homework.studentId !== session.user.id) return jsonError("Forbidden", 403);
    if (homework.status === "DONE") return jsonError("This homework is already marked Done", 409);

    const { contentType, size } = await req.json();
    if (!contentType || !contentType.startsWith("image/")) return jsonError("Only image files are allowed");
    if (typeof size === "number" && size > MAX_SIZE_BYTES) return jsonError("Image is too large (max 10MB)");

    const ext = contentType.split("/")[1] || "jpg";
    const key = `homework-photos/${homework.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, publicUrl });
  });
}
