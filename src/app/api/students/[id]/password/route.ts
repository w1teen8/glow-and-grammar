import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { encryptPassword, decryptPassword } from "@/lib/password-crypto";

// Excludes visually ambiguous characters (0/O, 1/l/I) — only used to
// backfill a password for accounts created before passwordEncrypted existed.
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generatePassword(length = 10) {
  return Array.from(crypto.randomBytes(length), (b) => CHARSET[b % CHARSET.length]).join("");
}

// Returns the student's actual, static login password — decrypted from
// passwordEncrypted rather than reset, so it stays the same across repeat
// views. Legacy accounts that predate this field get one generated and
// saved here, once, after which it's stable too.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();

    const student = await prisma.user.findUnique({ where: { id: params.id } });
    if (!student || student.role !== "STUDENT") return jsonError("Student not found", 404);

    if (student.passwordEncrypted) {
      return NextResponse.json({ email: student.email, password: decryptPassword(student.passwordEncrypted) });
    }

    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: params.id },
      data: { passwordHash, passwordEncrypted: encryptPassword(password) },
    });

    return NextResponse.json({ email: student.email, password });
  });
}
