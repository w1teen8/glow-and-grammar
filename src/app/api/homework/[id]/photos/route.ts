import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { uploadToStorage } from "@/lib/storage";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Photos are part of the student's answer — same permission shape as the
// "answer" kind of audio upload: only the owning student, only while not Done.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!homework) return jsonError("Not found", 404);
    if (homework.studentId !== session.user.id) return jsonError("Forbidden", 403);
    if (homework.status === "DONE") return jsonError("This homework is already marked Done", 409);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return jsonError("No file provided");
    if (!file.type.startsWith("image/")) return jsonError("Only image files are allowed");
    if (file.size > MAX_SIZE_BYTES) return jsonError("Image is too large (max 10MB)");

    const ext = file.type.split("/")[1] || "jpg";
    const filename = `${homework.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToStorage(`homework-photos/${filename}`, buffer, file.type);

    const photo = await prisma.homeworkPhoto.create({
      data: { homeworkId: homework.id, url: publicUrl },
    });

    return NextResponse.json(photo, { status: 201 });
  });
}
