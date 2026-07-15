import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

// The founder (session.user.isAdmin) manages every student. Any other
// teacher account only manages the students assigned to them — enforced
// here by comparing the student's `teacherId` to the caller's `profileId`.
export async function assertCanManageStudent(session: Session, studentId: string) {
  if (session.user.role !== "TEACHER") throw new Response("Forbidden", { status: 403 });
  if (session.user.isAdmin) return;

  if (!session.user.profileId) throw new Response("Forbidden", { status: 403 });

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { teacherId: true },
  });

  if (!student || student.teacherId !== session.user.profileId) {
    throw new Response("Forbidden", { status: 403 });
  }
}

// Scopes a Prisma `where` filter for a list of students to only the ones a
// non-admin teacher owns. Returns `undefined` for the founder (no filter).
export function studentScopeFilter(session: Session) {
  if (session.user.isAdmin) return undefined;
  return { teacherId: session.user.profileId ?? "__none__" };
}
