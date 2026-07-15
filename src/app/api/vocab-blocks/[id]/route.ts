import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// A teacher can change the due date and/or the learned status. A student can
// only toggle "learned" on their own block — the due date stays teacher-set.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const block = await prisma.vocabBlock.findUnique({
      where: { id: params.id },
      include: { lesson: { select: { studentId: true } } },
    });
    if (!block) return jsonError("Not found", 404);

    const body = await req.json();

    if (session.user.role === "TEACHER") {
      await assertCanManageStudent(session, block.lesson.studentId);
      const { dueDate, learned } = body;
      const updated = await prisma.vocabBlock.update({
        where: { id: params.id },
        data: {
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(learned !== undefined && { learned }),
        },
        include: { vocabItems: { orderBy: { sortOrder: "asc" } } },
      });
      return NextResponse.json(updated);
    }

    if (block.lesson.studentId !== session.user.id) return jsonError("Forbidden", 403);
    if (body.learned === undefined) return jsonError("Students can only update the learned status");

    const updated = await prisma.vocabBlock.update({
      where: { id: params.id },
      data: { learned: body.learned },
      include: { vocabItems: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json(updated);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const block = await prisma.vocabBlock.findUnique({
      where: { id: params.id },
      include: { lesson: { select: { studentId: true } } },
    });
    if (!block) return jsonError("Not found", 404);
    await assertCanManageStudent(session, block.lesson.studentId);

    await prisma.vocabBlock.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  });
}
