import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// Step 2: confirms a direct browser→R2 upload (see ./presign) by recording
// the resulting URL — the file itself never passes through this route.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    const session = await requireSession();
    const homework = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!homework) return jsonError("Not found", 404);
    if (homework.studentId !== session.user.id) return jsonError("Forbidden", 403);
    if (homework.status === "DONE") return jsonError("This homework is already marked Done", 409);

    const { url } = await req.json();
    if (!url) return jsonError("url is required");

    const photo = await prisma.homeworkPhoto.create({
      data: { homeworkId: homework.id, url },
    });

    return NextResponse.json(photo, { status: 201 });
  });
}
