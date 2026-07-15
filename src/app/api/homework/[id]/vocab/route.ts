import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// A teacher replaces the full "Words to learn" list for their own student's homework entry.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({ where: { id: params.id }, select: { studentId: true } });
    if (!homework) return jsonError("Not found", 404);
    await assertCanManageStudent(session, homework.studentId);

    const body = await req.json();
    const items: { english: string; translation: string }[] = body.vocabItems ?? [];

    await prisma.$transaction([
      prisma.vocabItem.deleteMany({ where: { homeworkId: params.id } }),
      prisma.vocabItem.createMany({
        data: items.map((item, i) => ({
          homeworkId: params.id,
          english: item.english,
          translation: item.translation,
          sortOrder: i,
        })),
      }),
    ]);

    const vocabItems = await prisma.vocabItem.findMany({
      where: { homeworkId: params.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(vocabItems);
  });
}
