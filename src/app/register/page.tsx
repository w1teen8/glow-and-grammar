import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { experienceLabel, teachingExperienceLabel } from "@/lib/experience";
import AuthSidePanel from "@/components/AuthSidePanel";

// Reads live teacher-profile data — must never be statically cached.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
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
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-olive-300">Реєстрація</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-olive-900">Кабінет створюється вручну</h1>
          <p className="mt-4 text-sm leading-relaxed text-olive-500">
            Щоб отримати доступ до особистого кабінету, напишіть нам в Instagram — ми створимо
            обліковий запис і надішлемо дані для входу.
          </p>

          {founder?.instagram && (
            <a
              href={founder.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block rounded-full bg-pink px-6 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:brightness-95"
            >
              Написати в Instagram →
            </a>
          )}

          <p className="mt-6 text-sm">
            <Link href="/login" className="text-olive-500 underline hover:text-olive-700">
              Вже маєте дані для входу? Увійти
            </Link>
          </p>
          <p className="mt-2 text-sm">
            <Link href="/" className="text-olive-300 underline hover:text-olive-500">
              ← На головну
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
