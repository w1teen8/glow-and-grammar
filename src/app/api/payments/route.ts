import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// Payment & Attendance is a founder-only area — a regular teacher account
// only manages homework for their assigned students.
export async function GET(req: NextRequest) {
  return handleApiError(async () => {
    const session = await requireSession();
    if (session.user.role === "TEACHER" && !session.user.isAdmin) {
      return jsonError("Forbidden", 403);
    }

    const studentIdParam = req.nextUrl.searchParams.get("studentId");
    const studentId =
      session.user.role === "TEACHER" ? studentIdParam ?? undefined : session.user.id;

    if (!studentId) return NextResponse.json([]);

    const entries = await prisma.paymentAttendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  });
}

export async function POST(req: NextRequest) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { studentId, lessonLabel, date, attendanceStatus, tariffPlan, paymentStatus, amount } = body;

    if (!studentId || !lessonLabel || !date || !tariffPlan) {
      return jsonError("studentId, lessonLabel, date and tariffPlan are required");
    }

    const entry = await prisma.paymentAttendance.create({
      data: {
        studentId,
        lessonLabel,
        date: new Date(date),
        attendanceStatus: attendanceStatus ?? "CONDUCTED",
        tariffPlan,
        paymentStatus: paymentStatus ?? "UNPAID",
        amount: amount ?? null,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  });
}
