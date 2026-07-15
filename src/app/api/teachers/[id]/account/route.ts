import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// The founder creates a login for a teacher profile, giving that person
// their own account — scoped (via lib/permissions.ts) to only the students
// later assigned to them.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) return jsonError("email and password are required");

    const profile = await prisma.teacherProfile.findUnique({ where: { id: params.id } });
    if (!profile) return jsonError("Teacher profile not found", 404);

    const existingAccount = await prisma.user.findUnique({ where: { profileId: params.id } });
    if (existingAccount) return jsonError("This teacher already has a login", 409);

    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingEmail) return jsonError("A user with this email already exists", 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const account = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: profile.name,
        role: "TEACHER",
        profileId: profile.id,
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(account, { status: 201 });
  });
}
