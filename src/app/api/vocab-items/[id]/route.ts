import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// A word belongs either to a VocabBlock (assigned in a lesson) or directly
// to a Homework ("Words to learn" for that task) — resolve the owning
// student through whichever parent is set.
async function resolveStudentId(vocabItemId: string) {
  const item = await prisma.vocabItem.findUnique({
    where: { id: vocabItemId },
    include: {
      block: { include: { lesson: { select: { studentId: true } } } },
      homework: { select: { studentId: true } },
    },
  });
  if (!item) return null;
  return { item, studentId: item.block?.lesson.studentId ?? item.homework?.studentId ?? null };
}

// A teacher (scoped to their own student) can edit the word/translation and
// toggle learned; a student can only toggle their own "learned" status.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const resolved = await resolveStudentId(params.id);
    if (!resolved || !resolved.studentId) return jsonError("Not found", 404);

    const body = await req.json();

    if (session.user.role === "TEACHER") {
      await assertCanManageStudent(session, resolved.studentId);
      const { learned, english, translation } = body;
      const updated = await prisma.vocabItem.update({
        where: { id: params.id },
        data: {
          ...(typeof learned === "boolean" && { learned }),
          ...(typeof english === "string" && english.trim() && { english: english.trim() }),
          ...(typeof translation === "string" && translation.trim() && { translation: translation.trim() }),
        },
      });
      return NextResponse.json(updated);
    }

    if (resolved.studentId !== session.user.id) return jsonError("Forbidden", 403);
    if (typeof body.learned !== "boolean") return jsonError("Students can only update the learned status");

    const updated = await prisma.vocabItem.update({
      where: { id: params.id },
      data: { learned: body.learned },
    });
    return NextResponse.json(updated);
  });
}
