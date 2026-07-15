import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return handleApiError(async () => {
    const session = await requireSession();
    const studentIdParam = req.nextUrl.searchParams.get("studentId");
    const lessonId = req.nextUrl.searchParams.get("lessonId") ?? undefined;

    const studentId =
      session.user.role === "TEACHER" ? studentIdParam ?? undefined : session.user.id;

    if (!studentId && !lessonId) return NextResponse.json([]);

    if (session.user.role === "TEACHER") {
      if (studentId) await assertCanManageStudent(session, studentId);
      else if (!session.user.isAdmin) return jsonError("Forbidden", 403);
    }

    const homework = await prisma.homework.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(lessonId && { lessonId }),
      },
      include: { vocabItems: { orderBy: { sortOrder: "asc" } }, lesson: { select: { id: true, date: true, grammar: true } } },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json(homework);
  });
}

// Homework is the one area every teacher account manages — scoped to their
// own students; the founder can create it for anyone.
export async function POST(req: NextRequest) {
  return handleApiError(async () => {
    const session = await requireSession();
    const body = await req.json();
    const { lessonId, studentId, title, deadline, taskContent, vocabItems } = body;

    if (!lessonId || !studentId || !title || !deadline) {
      return jsonError("lessonId, studentId, title and deadline are required");
    }
    await assertCanManageStudent(session, studentId);

    const homework = await prisma.homework.create({
      data: {
        lessonId,
        studentId,
        title,
        deadline: new Date(deadline),
        taskContent: taskContent ?? "",
        vocabItems: {
          create: (vocabItems ?? []).map(
            (v: { english: string; translation: string }, i: number) => ({
              english: v.english,
              translation: v.translation,
              sortOrder: i,
            })
          ),
        },
      },
      include: { vocabItems: true },
    });

    return NextResponse.json(homework, { status: 201 });
  });
}
