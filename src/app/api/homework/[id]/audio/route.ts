import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { uploadToStorage } from "@/lib/storage";

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

    const ext = file.type.includes("webm") ? "webm" : file.type.includes("mp4") ? "m4a" : "ogg";
    const filename = `${homework.id}-${kind}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToStorage(`audio/${filename}`, buffer, file.type || "audio/webm");

    const updated = await prisma.homework.update({
      where: { id: params.id },
      data: kind === "feedback" ? { feedbackAudioUrl: publicUrl } : { audioUrl: publicUrl },
    });

    return NextResponse.json({ url: publicUrl, homework: updated });
  });
}
