import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertCanManageStudent } from "@/lib/permissions";
import { handleApiError, jsonError } from "@/lib/api-helpers";
import { getPresignedUploadUrl } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!homework) return jsonError("Not found", 404);

    const { kind = "answer", contentType } = await req.json();
    if (!contentType) return jsonError("contentType is required");

    if (kind === "answer") {
      if (session.user.role === "TEACHER") {
        await assertCanManageStudent(session, homework.studentId);
      } else if (homework.studentId !== session.user.id) {
        return jsonError("Forbidden", 403);
      }
      if (homework.status === "DONE") return jsonError("This homework is already marked Done", 409);
    } else if (kind === "feedback") {
      await assertCanManageStudent(session, homework.studentId);
    }

    const ext = contentType.includes("webm") ? "webm" : contentType.includes("mp4") ? "m4a" : "ogg";
    const key = `audio/${homework.id}-${kind}-${Date.now()}.${ext}`;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType || "audio/webm");

    return NextResponse.json({ uploadUrl, publicUrl });
  });
}
