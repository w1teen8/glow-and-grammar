"use client";

import { experienceLabel } from "@/lib/experience";
import type { TeacherProfile } from "@/types/models";

export default function TeacherCard({
  teacher,
  isTeacher,
  onEdit,
}: {
  teacher: TeacherProfile;
  isTeacher: boolean;
  onEdit?: () => void;
}) {
  const credentials = teacher.credentials.split("\n").map((s) => s.trim()).filter(Boolean);
  const philosophy = teacher.philosophy.split("\n").map((s) => s.trim()).filter(Boolean);
  const specialties = teacher.specialties.split(",").map((s) => s.trim()).filter(Boolean);
  // Never a stored number — recalculated on every render from practicingSince.
  const experience = experienceLabel(new Date(teacher.practicingSince));

  return (
    <div className="relative overflow-hidden rounded-xl2 border border-olive/10 bg-white/90 p-6 shadow-card hover:shadow-premium sm:p-8">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-olive-500 to-pink-300" />

      {teacher.isFounder && (
        <span className="absolute right-6 top-6 rounded-full bg-pink px-3 py-1 text-xs font-medium text-olive-900">
          Засновниця
        </span>
      )}

      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-pink bg-white">
          {teacher.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teacher.photoUrl} alt={teacher.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-olive-500">
              {teacher.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="font-display text-xl font-semibold tracking-tight text-olive-900">{teacher.name}</h2>
          <p className="text-sm font-medium text-olive-500">{teacher.title}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-pink-700">{experience}</p>
        </div>
      </div>

      <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-olive-700">{teacher.bio}</p>

      {credentials.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-400">
            Кваліфікація та досвід
          </h3>
          <ul className="space-y-2">
            {credentials.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-olive-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {philosophy.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-400">
            Методологія та цінності
          </h3>
          <ul className="space-y-2">
            {philosophy.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-olive-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {specialties.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {specialties.map((s, i) => (
            <span key={i} className="rounded-full border border-olive/20 bg-cream px-3 py-1 text-xs text-olive-600">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {teacher.instagram ? (
          <a href={teacher.instagram} target="_blank" rel="noreferrer" className="text-sm text-pink-700 underline">
            Instagram →
          </a>
        ) : (
          <span />
        )}
        {isTeacher && onEdit && (
          <button onClick={onEdit} className="text-xs text-olive-400 underline hover:text-olive-600">
            Редагувати
          </button>
        )}
      </div>
    </div>
  );
}
