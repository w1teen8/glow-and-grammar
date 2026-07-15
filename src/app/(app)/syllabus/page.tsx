"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import SyllabusTable from "@/components/SyllabusTable";
import LessonModal from "@/components/LessonModal";
import PageHeading from "@/components/PageHeading";
import type { Lesson } from "@/types/models";

export default function SyllabusPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const isTeacher = session?.user.role === "TEACHER";
  const isAdmin = !!session?.user.isAdmin;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const canLoad = !isTeacher || !!studentId;

  async function load() {
    if (!canLoad) {
      setLessons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const qs = isTeacher && studentId ? `?studentId=${studentId}` : "";
    const res = await fetch(`/api/lessons${qs}`);
    setLessons(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, isTeacher]);

  if (isTeacher && !studentId) {
    return <EmptyState message="Оберіть учня зверху, щоб побачити її/його програму занять." />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeading title="Syllabus Tracker" subtitle="Граматика, лексика та навички за кожним заняттям." />

        {isAdmin && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:brightness-95"
          >
            + Додати заняття
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-olive-400">Завантаження…</p>
      ) : lessons.length === 0 ? (
        <EmptyState message="Занять ще немає." />
      ) : (
        <SyllabusTable
          lessons={lessons}
          isTeacher={isAdmin}
          onEdit={(lesson) => {
            setEditing(lesson);
            setModalOpen(true);
          }}
        />
      )}

      {modalOpen && isAdmin && studentId && (
        <LessonModal
          studentId={studentId}
          lesson={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl2 border border-dashed border-olive/25 bg-white/50 px-6 py-16 text-center text-olive-400">
      {message}
    </div>
  );
}
