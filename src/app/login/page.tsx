import { prisma } from "@/lib/prisma";
import { experienceLabel, teachingExperienceLabel } from "@/lib/experience";
import LoginForm from "@/components/LoginForm";
import AuthSidePanel from "@/components/AuthSidePanel";

// This page reads live teacher-profile data (bio, specialties, experience) —
// it must never be statically cached, or edits in the admin panel won't show.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const founder = await prisma.teacherProfile.findFirst({ where: { isFounder: true } });
  const experience = founder ? experienceLabel(new Date(founder.practicingSince)) : null;
  const teachingExperience = founder ? teachingExperienceLabel() : null;
  const specialties = founder?.specialties.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <div className="grid min-h-screen sm:grid-cols-[2fr_1fr]">
      <AuthSidePanel
        founderName={founder?.name}
        founderTitle={founder?.title}
        founderPhotoUrl={founder?.photoUrl}
        experience={experience}
        teachingExperience={teachingExperience}
        specialties={specialties}
      />

      <div className="flex flex-col justify-center bg-white px-8 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
