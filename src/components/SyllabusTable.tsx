"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StatusBadge from "./StatusBadge";
import VideoModal from "./VideoModal";
import type { Lesson } from "@/types/models";

export default function SyllabusTable({
  lessons,
  isTeacher,
  onEdit,
}: {
  lessons: Lesson[];
  isTeacher: boolean;
  onEdit: (lesson: Lesson) => void;
}) {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const hwSuffix = studentId ? `?studentId=${studentId}` : "";
  const [openVideoUrl, setOpenVideoUrl] = useState<string | null>(null);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl2 border border-olive/15 bg-white/70 shadow-soft sm:block">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-olive/10 text-xs uppercase tracking-wide text-olive-400">
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Grammar</th>
              <th className="px-4 py-3">Vocabulary</th>
              <th className="px-4 py-3">Reading / Listening</th>
              <th className="px-4 py-3">Speaking</th>
              <th className="px-4 py-3">Writing</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Матеріал</th>
              <th className="px-4 py-3">Запис</th>
              <th className="px-4 py-3">Homework</th>
              {isTeacher && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-b border-olive/10 last:border-0 hover:bg-olive/5">
                <td className="whitespace-nowrap px-4 py-3 text-olive-700">
                  {new Date(lesson.date).toLocaleDateString("uk-UA")}
                </td>
                <td className="max-w-[160px] px-4 py-3 text-olive-700">{lesson.grammar}</td>
                <td className="max-w-[160px] px-4 py-3 text-olive-700">{lesson.vocabulary}</td>
                <td className="max-w-[160px] px-4 py-3 text-olive-700">{lesson.readingListening}</td>
                <td className="max-w-[140px] px-4 py-3 text-olive-700">{lesson.speaking}</td>
                <td className="max-w-[140px] px-4 py-3 text-olive-700">{lesson.writing}</td>
                <td className="px-4 py-3">
                  <StatusBadge kind="lesson" value={lesson.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {lesson.lessonLink && (
                      <a
                        href={lesson.lessonLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-700 underline decoration-pink-300 underline-offset-2"
                      >
                        Відкрити
                      </a>
                    )}
                    {lesson.attachmentUrl && (
                      <a
                        href={lesson.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-pink-700 underline decoration-pink-300 underline-offset-2"
                      >
                        {lesson.attachmentName ?? "Файл"}
                      </a>
                    )}
                    {!lesson.lessonLink && !lesson.attachmentUrl && <span className="text-olive-300">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {lesson.recordingUrl ? (
                    <button
                      onClick={() => setOpenVideoUrl(lesson.recordingUrl)}
                      className="inline-flex items-center gap-1 text-pink-700 underline decoration-pink-300 underline-offset-2 hover:text-pink-500"
                    >
                      ▶ Переглянути
                    </button>
                  ) : (
                    <span className="text-olive-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lesson.homework[0] ? (
                    <Link
                      href={`/homework/${lesson.homework[0].id}${hwSuffix}`}
                      className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700 transition hover:bg-pink-100"
                    >
                      {lesson.homework[0].title}
                    </Link>
                  ) : (
                    <span className="text-olive-300">—</span>
                  )}
                </td>
                {isTeacher && (
                  <td className="px-4 py-3">
                    <button onClick={() => onEdit(lesson)} className="text-olive-500 hover:text-olive-700">
                      Редагувати
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 sm:hidden">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-xl2 border border-olive/15 bg-white/70 p-4 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-olive-700">
                {new Date(lesson.date).toLocaleDateString("uk-UA")}
              </span>
              <StatusBadge kind="lesson" value={lesson.status} />
            </div>
            <dl className="space-y-1 text-sm text-olive-700">
              <Field label="Grammar" value={lesson.grammar} />
              <Field label="Vocabulary" value={lesson.vocabulary} />
              <Field label="Reading / Listening" value={lesson.readingListening} />
              <Field label="Speaking" value={lesson.speaking} />
              <Field label="Writing" value={lesson.writing} />
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {lesson.lessonLink && (
                <a href={lesson.lessonLink} target="_blank" rel="noreferrer" className="text-xs text-pink-700 underline">
                  Матеріал заняття
                </a>
              )}
              {lesson.attachmentUrl && (
                <a href={lesson.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-pink-700 underline">
                  {lesson.attachmentName ?? "Файл"}
                </a>
              )}
              {lesson.recordingUrl && (
                <button
                  onClick={() => setOpenVideoUrl(lesson.recordingUrl)}
                  className="text-xs text-pink-700 underline"
                >
                  ▶ Запис уроку
                </button>
              )}
              {lesson.homework[0] && (
                <Link
                  href={`/homework/${lesson.homework[0].id}${hwSuffix}`}
                  className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700"
                >
                  {lesson.homework[0].title}
                </Link>
              )}
              {isTeacher && (
                <button onClick={() => onEdit(lesson)} className="ml-auto text-xs text-olive-500 underline">
                  Редагувати
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {openVideoUrl && <VideoModal url={openVideoUrl} onClose={() => setOpenVideoUrl(null)} />}
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-36 shrink-0 text-olive-400">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
