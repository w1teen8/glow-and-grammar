import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacher, requireAdmin } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// Only the founder edits/removes student accounts and their teacher assignment.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { name, email, teacherId } = body;

    const student = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(teacherId !== undefined && { teacherId: teacherId || null }),
      },
      select: { id: true, name: true, email: true, teacherId: true },
    });

    return NextResponse.json(student);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  });
}

// GET is scoped: the founder can look up anyone, a regular teacher only their own students.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireTeacher();
    await assertCanManageStudent(session, params.id);

    const student = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!student) return jsonError("Not found", 404);
    return NextResponse.json(student);
  });
}
