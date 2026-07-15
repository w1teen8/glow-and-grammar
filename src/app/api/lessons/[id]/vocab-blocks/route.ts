import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// A teacher assigns a new batch of words for this lesson, with a shared
// "learn by" date — the same homework-editing right covers this.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const lesson = await prisma.lesson.findUnique({ where: { id: params.id }, select: { studentId: true } });
    if (!lesson) return jsonError("Not found", 404);
    await assertCanManageStudent(session, lesson.studentId);

    const body = await req.json();
    const { dueDate, vocabItems } = body;
    const items: { english: string; translation: string }[] = vocabItems ?? [];

    if (!dueDate || items.length === 0) {
      return jsonError("dueDate and at least one word are required");
    }

    const block = await prisma.vocabBlock.create({
      data: {
        lessonId: params.id,
        dueDate: new Date(dueDate),
        vocabItems: {
          create: items.map((item, i) => ({
            english: item.english,
            translation: item.translation,
            sortOrder: i,
          })),
        },
      },
      include: { vocabItems: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(block, { status: 201 });
  });
}
