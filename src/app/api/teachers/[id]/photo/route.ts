import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { deleteFromStorage } from "@/lib/storage";

// Confirms a direct browser→R2 upload (see ./presign) by recording the
// resulting URL and cleaning up whatever photo was there before.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: params.id } });
    if (!teacher) return jsonError("Teacher profile not found", 404);

    const { url } = await req.json();
    if (!url) return jsonError("url is required");

    if (teacher.photoUrl) await deleteFromStorage(teacher.photoUrl);

    const updated = await prisma.teacherProfile.update({
      where: { id: params.id },
      data: { photoUrl: url },
    });

    return NextResponse.json(updated);
  });
}
