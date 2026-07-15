import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({
      where: { id: params.id },
      include: { vocabItems: { orderBy: { sortOrder: "asc" } }, lesson: true },
    });
    if (!homework) return jsonError("Not found", 404);
    if (session.user.role === "TEACHER") {
      await assertCanManageStudent(session, homework.studentId);
    } else if (homework.studentId !== session.user.id) {
      return jsonError("Forbidden", 403);
    }
    return NextResponse.json(homework);
  });
}

// Any teacher (founder or a regular teacher account) can fully manage
// homework for their own students. A student may only move their own task
// through the board (status) and attach their recorded answer (audioUrl) —
// never the feedback fields, and never once the task is marked Done.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const body = await req.json();
    const existing = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!existing) return jsonError("Not found", 404);

    if (session.user.role === "TEACHER") {
      await assertCanManageStudent(session, existing.studentId);

      const { title, deadline, taskContent, status, feedbackText, feedbackAudioUrl } = body;
      const homework = await prisma.homework.update({
        where: { id: params.id },
        data: {
          ...(title !== undefined && { title }),
          ...(deadline && { deadline: new Date(deadline) }),
          ...(taskContent !== undefined && { taskContent }),
          ...(status && { status }),
          ...(feedbackText !== undefined && { feedbackText }),
          ...(feedbackAudioUrl !== undefined && { feedbackAudioUrl }),
        },
        include: { vocabItems: true },
      });
      return NextResponse.json(homework);
    }

    // Student path
    if (existing.studentId !== session.user.id) return jsonError("Forbidden", 403);
    if (existing.status === "DONE") return jsonError("This homework is already marked Done", 409);

    const { status, audioUrl } = body;
    const allowedStatuses = ["TODO", "IN_PROGRESS", "CHECKING"];
    if (status && !allowedStatuses.includes(status)) {
      return jsonError("Students can only move a task between To Do, In Progress and Checking");
    }

    const homework = await prisma.homework.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(audioUrl !== undefined && { audioUrl }),
      },
      include: { vocabItems: true },
    });
    return NextResponse.json(homework);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const existing = await prisma.homework.findUnique({ where: { id: params.id }, select: { studentId: true } });
    if (!existing) return jsonError("Not found", 404);
    await assertCanManageStudent(session, existing.studentId);

    await prisma.homework.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  });
}
