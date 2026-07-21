"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import SyllabusTable from "@/components/SyllabusTable";
import LessonModal from "@/components/LessonModal";
import PageHeading from "@/components/PageHeading";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    return <EmptyState message="Оберіть учня зверху, щоб побачити її/його програму занять." icon="people" />;
  }

  async function handleDelete(lesson: Lesson) {
    if (
      !confirm(
        `Видалити заняття ${new Date(lesson.date).toLocaleDateString("uk-UA")}? Разом з ним видаляться пов'язані домашні завдання та слова. Дію не можна скасувати.`
      )
    )
      return;
    setDeletingId(lesson.id);
    await fetch(`/api/lessons/${lesson.id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
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
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-95"
          >
            + Додати заняття
          </button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : lessons.length === 0 ? (
        <EmptyState message="Занять ще немає." icon="list" />
      ) : (
        <SyllabusTable
          lessons={lessons}
          isTeacher={isAdmin}
          onEdit={(lesson) => {
            setEditing(lesson);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          deletingId={deletingId}
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
