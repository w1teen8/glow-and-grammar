import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/auth";
import { studentScopeFilter } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// GET: the founder gets every student; any other teacher gets only their own
// assigned students; a student gets just themselves.
export async function GET() {
  return handleApiError(async () => {
    const session = await requireSession();

    if (session.user.role === "TEACHER") {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT", ...studentScopeFilter(session) },
        select: { id: true, name: true, email: true, createdAt: true, teacherId: true },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(students);
    }

    const self = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json([self]);
  });
}

// POST: only the founder creates new student accounts and assigns them to a teacher.
export async function POST(req: NextRequest) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { name, email, password, teacherId } = body;

    if (!name || !email || !password) {
      return jsonError("name, email and password are required");
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return jsonError("A user with this email already exists", 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const student = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "STUDENT",
        teacherId: teacherId ?? null,
      },
      select: { id: true, name: true, email: true, createdAt: true, teacherId: true },
    });

    return NextResponse.json(student, { status: 201 });
  });
}
