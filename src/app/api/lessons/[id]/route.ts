import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

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
    const { date, grammar, vocabulary, readingListening, speaking, writing, status, lessonLink } = body;

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
