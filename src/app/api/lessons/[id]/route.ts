import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { deleteFromStorage } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        homework: true,
        vocabBlocks: {
          include: { vocabItems: { orderBy: { sortOrder: "asc" } } },
          orderBy: { dueDate: "asc" },
        },
      },
    });
    if (!lesson) return jsonError("Not found", 404);
    if (session.user.role === "TEACHER") {
      await assertCanManageStudent(session, lesson.studentId);
    } else if (lesson.studentId !== session.user.id) {
      return jsonError("Forbidden", 403);
    }
    return NextResponse.json(lesson);
  });
}

// Only the founder edits the syllabus itself.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { date, grammar, vocabulary, readingListening, speaking, writing, status, lessonLink, attachmentUrl, attachmentName, recordingUrl } = body;

    // Confirms a direct browser→R2 upload (see ./attachment/presign) by
    // saving the resulting URL — clean up whatever was there before.
    if (attachmentUrl !== undefined) {
      const existing = await prisma.lesson.findUnique({ where: { id: params.id }, select: { attachmentUrl: true } });
      if (existing?.attachmentUrl && existing.attachmentUrl !== attachmentUrl) {
        await deleteFromStorage(existing.attachmentUrl);
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(grammar !== undefined && { grammar }),
        ...(vocabulary !== undefined && { vocabulary }),
        ...(readingListening !== undefined && { readingListening }),
        ...(speaking !== undefined && { speaking }),
        ...(writing !== undefined && { writing }),
        ...(status && { status }),
        ...(lessonLink !== undefined && { lessonLink }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
        ...(attachmentName !== undefined && { attachmentName }),
        ...(recordingUrl !== undefined && { recordingUrl }),
      },
    });

    return NextResponse.json(lesson);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    await prisma.lesson.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  });
}
