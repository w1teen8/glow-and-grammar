import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return handleApiError(async () => {
    const session = await requireSession();
    const studentIdParam = req.nextUrl.searchParams.get("studentId");

    const studentId =
      session.user.role === "TEACHER" ? studentIdParam ?? undefined : session.user.id;

    if (!studentId) return NextResponse.json([]);
    if (session.user.role === "TEACHER") await assertCanManageStudent(session, studentId);

    const lessons = await prisma.lesson.findMany({
      where: { studentId },
      include: {
        homework: { select: { id: true, title: true, status: true } },
        vocabBlocks: {
          include: { vocabItems: { orderBy: { sortOrder: "asc" } } },
          orderBy: { dueDate: "asc" },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(lessons);
  });
}

// Only the founder builds the syllabus — other teachers manage homework for
// lessons the founder has already created.
export async function POST(req: NextRequest) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { studentId, date, grammar, vocabulary, readingListening, speaking, writing, status, lessonLink, recordingUrl } = body;

    if (!studentId || !date) return jsonError("studentId and date are required");

    const lesson = await prisma.lesson.create({
      data: {
        studentId,
        date: new Date(date),
        grammar: grammar ?? "",
        vocabulary: vocabulary ?? "",
        readingListening: readingListening ?? "",
        speaking: speaking ?? "",
        writing: writing ?? "",
        status: status ?? "IN_PROGRESS",
        lessonLink: lessonLink ?? null,
        recordingUrl: recordingUrl ?? null,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  });
}
