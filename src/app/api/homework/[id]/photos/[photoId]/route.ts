import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { deleteFromStorage } from "@/lib/storage";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!homework) return jsonError("Not found", 404);
    if (homework.studentId !== session.user.id) return jsonError("Forbidden", 403);
    if (homework.status === "DONE") return jsonError("This homework is already marked Done", 409);

    const photo = await prisma.homeworkPhoto.findUnique({ where: { id: params.photoId } });
    if (!photo || photo.homeworkId !== params.id) return jsonError("Not found", 404);

    await deleteFromStorage(photo.url);
    await prisma.homeworkPhoto.delete({ where: { id: params.photoId } });

    return NextResponse.json({ ok: true });
  });
}
