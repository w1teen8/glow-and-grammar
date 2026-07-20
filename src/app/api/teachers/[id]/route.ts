import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    const body = await req.json();
    const { name, title, bio, photoUrl, credentials, philosophy, specialties, instagram, zoomLink, practicingSince, sortOrder } = body;

    const teacher = await prisma.teacherProfile.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(bio !== undefined && { bio }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(credentials !== undefined && { credentials }),
        ...(philosophy !== undefined && { philosophy }),
        ...(specialties !== undefined && { specialties }),
        ...(instagram !== undefined && { instagram }),
        ...(zoomLink !== undefined && { zoomLink }),
        ...(practicingSince && { practicingSince: new Date(practicingSince) }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(teacher);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handleApiError(async () => {
    await requireAdmin();
    await prisma.teacherProfile.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  });
}
