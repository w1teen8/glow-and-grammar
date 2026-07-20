import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";
import { deleteFromStorage } from "@/lib/storage";

// Uploading itself now goes browser → R2 directly via a presigned URL (see
// ./presign/route.ts) — this route only handles removing an attachment.
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
