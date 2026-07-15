import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api-helpers";

// Public: profile data here has no sensitive info, so no session is required.
export async function GET() {
  return handleApiError(async () => {
    const teachers = await prisma.teacherProfile.findMany({
      orderBy: [{ isFounder: "desc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json(teachers);
  });
}

// Only the founder manages the team roster.
export async function POST(req: NextRequest) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { name, title, bio, photoUrl, credentials, philosophy, specialties, instagram, practicingSince, isFounder, sortOrder } = body;

    if (!name || !title || !bio || !practicingSince) {
      return jsonError("name, title, bio and practicingSince are required");
    }

    const teacher = await prisma.teacherProfile.create({
      data: {
        name,
        title,
        bio,
        photoUrl: photoUrl ?? null,
        credentials: credentials ?? "",
        philosophy: philosophy ?? "",
        specialties: specialties ?? "",
        instagram: instagram ?? null,
        practicingSince: new Date(practicingSince),
        isFounder: isFounder ?? false,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  });
}
