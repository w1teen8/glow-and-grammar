import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { lessonLabel, date, attendanceStatus, tariffPlan, paymentStatus, amount } = body;

    const entry = await prisma.paymentAttendance.update({
      where: { id: params.id },
      data: {
        ...(lessonLabel !== undefined && { lessonLabel }),
        ...(date && { date: new Date(date) }),
        ...(attendanceStatus && { attendanceStatus }),
        ...(tariffPlan && { tariffPlan }),
        ...(paymentStatus && { paymentStatus }),
        ...(amount !== undefined && { amount }),
      },
    });

    return NextResponse.json(entry);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    await prisma.paymentAttendance.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  });
}
