import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// A teacher replaces the full "words assigned this lesson" list — the same
// homework-editing right covers this, scoped to their own students.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const lesson = await prisma.lesson.findUnique({ where: { id: params.id }, select: { studentId: true } });
    if (!lesson) return jsonError("Not found", 404);
    await assertCanManageStudent(session, lesson.studentId);

    const body = await req.json();
    const items: { english: string; translation: string }[] = body.vocabItems ?? [];

    await prisma.$transaction([
      prisma.vocabItem.deleteMany({ where: { lessonId: params.id } }),
      prisma.vocabItem.createMany({
        data: items.map((item, i) => ({
          lessonId: params.id,
          english: item.english,
          translation: item.translation,
          sortOrder: i,
        })),
      }),
    ]);

    const vocabItems = await prisma.vocabItem.findMany({
      where: { lessonId: params.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(vocabItems);
  });
}
