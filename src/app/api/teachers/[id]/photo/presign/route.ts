import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { getPresignedUploadUrl } from "@/lib/storage";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: params.id } });
    if (!teacher) return jsonError("Teacher profile not found", 404);

    const { contentType, size } = await req.json();
    if (!contentType || !contentType.startsWith("image/")) return jsonError("Only image files are allowed");
    if (typeof size === "number" && size > MAX_SIZE_BYTES) return jsonError("Image is too large (max 10MB)");

    const ext = contentType.split("/")[1] || "jpg";
    const key = `teacher-photos/${teacher.id}-${Date.now()}.${ext}`;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, publicUrl });
  });
}
