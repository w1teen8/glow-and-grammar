import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { uploadToStorage, deleteFromStorage } from "@/lib/storage";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Only the founder manages the team roster, same as the rest of a profile.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: params.id } });
    if (!teacher) return jsonError("Teacher profile not found", 404);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return jsonError("No file provided");
    if (!file.type.startsWith("image/")) return jsonError("Only image files are allowed");
    if (file.size > MAX_SIZE_BYTES) return jsonError("Image is too large (max 10MB)");

    const ext = file.type.split("/")[1] || "jpg";
    const filename = `${teacher.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToStorage(`teacher-photos/${filename}`, buffer, file.type);

    if (teacher.photoUrl) await deleteFromStorage(teacher.photoUrl);

    const updated = await prisma.teacherProfile.update({
      where: { id: params.id },
      data: { photoUrl: publicUrl },
    });

    return NextResponse.json(updated);
  });
}
