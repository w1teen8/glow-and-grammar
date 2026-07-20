import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { uploadToStorage, deleteFromStorage } from "@/lib/storage";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

// Only the founder builds the syllabus, same as editing a lesson's other fields.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
    if (!lesson) return jsonError("Not found", 404);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return jsonError("No file provided");
    if (file.size > MAX_SIZE_BYTES) return jsonError("File is too large (max 20MB)");

    const ext = path.extname(file.name) || "";
    const filename = `${lesson.id}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToStorage(`lessons/${filename}`, buffer, file.type || "application/octet-stream");

    if (lesson.attachmentUrl) await deleteFromStorage(lesson.attachmentUrl);

    const updated = await prisma.lesson.update({
      where: { id: params.id },
      data: { attachmentUrl: publicUrl, attachmentName: file.name },
    });

    return NextResponse.json(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
    if (lesson?.attachmentUrl) await deleteFromStorage(lesson.attachmentUrl);

    const updated = await prisma.lesson.update({
      where: { id: params.id },
      data: { attachmentUrl: null, attachmentName: null },
    });
    return NextResponse.json(updated);
  });
}
