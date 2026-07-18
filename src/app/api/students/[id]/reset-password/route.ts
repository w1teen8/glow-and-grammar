import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// Excludes visually ambiguous characters (0/O, 1/l/I) since this password is
// meant to be read off a screen and typed in by the student.
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generatePassword(length = 10) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("");
}

// Only the founder can force-reset a student's password. The plaintext value
// is returned exactly once, in this response — it is never stored or logged,
// only its bcrypt hash is persisted (same as on account creation).
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();

    const student = await prisma.user.findUnique({ where: { id: params.id } });
    if (!student || student.role !== "STUDENT") return jsonError("Student not found", 404);

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: params.id }, data: { passwordHash } });

    return NextResponse.json({ email: student.email, password });
  });
}
