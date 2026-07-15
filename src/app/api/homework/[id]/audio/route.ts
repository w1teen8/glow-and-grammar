import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// NOTE (production): this writes to the local filesystem, which does not
// persist on serverless hosts (e.g. Vercel). Swap this for Vercel Blob / S3
// before deploying there — everything else (the `audioUrl` string on the
// Homework row) stays the same, only where the bytes land changes.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "audio");

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!homework) return jsonError("Not found", 404);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    // "answer" = the student's spoken homework submission, "feedback" = the teacher's voice note.
    const kind = (formData.get("kind") as string) ?? "answer";
    if (!file) return jsonError("No audio file provided");

    if (kind === "answer") {
      if (session.user.role === "TEACHER") {
        await assertCanManageStudent(session, homework.studentId);
      } else if (homework.studentId !== session.user.id) {
        return jsonError("Forbidden", 403);
      }
      if (homework.status === "DONE") return jsonError("This homework is already marked Done", 409);
    } else if (kind === "feedback") {
      // Feedback audio is a teacher-only action, scoped to their own student.
      await assertCanManageStudent(session, homework.studentId);
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = file.type.includes("webm") ? "webm" : file.type.includes("mp4") ? "m4a" : "ogg";
    const filename = `${homework.id}-${kind}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const publicUrl = `/uploads/audio/${filename}`;

    const updated = await prisma.homework.update({
      where: { id: params.id },
      data: kind === "feedback" ? { feedbackAudioUrl: publicUrl } : { audioUrl: publicUrl },
    });

    return NextResponse.json({ url: publicUrl, homework: updated });
  });
}
