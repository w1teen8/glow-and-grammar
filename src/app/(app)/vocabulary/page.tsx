"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import AddVocabBlockModal from "@/components/AddVocabBlockModal";
import VocabBlockCard from "@/components/VocabBlockCard";
import type { Lesson } from "@/types/models";

export default function VocabularyPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const isTeacher = session?.user.role === "TEACHER";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    if (isTeacher && !studentId) {
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
    return <EmptyState message="Оберіть учня зверху, щоб побачити слова для вивчення." />;
  }

  const groups = lessons.filter((l) => l.vocabBlocks.length > 0);
  const totalWords = groups.reduce(
    (sum, l) => sum + l.vocabBlocks.reduce((s, b) => s + b.vocabItems.length, 0),
    0
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeading
          title="Словник"
          subtitle="Слова, додані на занятті — з датою, до якої їх варто вивчити."
          accent="bg-olive-500"
        />
        {isTeacher && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:brightness-95"
          >
            + Додати слова
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-8 text-olive-400">Завантаження…</p>
      ) : groups.length === 0 ? (
        <EmptyState message="Слів для вивчення поки немає." />
      ) : (
        <>
          <p className="mt-6 text-sm text-olive-400">Всього слів: {totalWords}</p>
          <div className="mt-4 space-y-8">
            {groups.map((lesson) => (
              <div key={lesson.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-300">
                  Заняття {new Date(lesson.date).toLocaleDateString("uk-UA")}
                  {lesson.grammar && ` — ${lesson.grammar}`}
                </p>
                <div className="space-y-3">
                  {lesson.vocabBlocks.map((block) => (
                    <VocabBlockCard key={block.id} block={block} canEditDueDate={!!isTeacher} onChanged={load} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <AddVocabBlockModal
          lessons={lessons}
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
    <div className="mt-8 rounded-xl2 border border-dashed border-olive/25 bg-white/50 px-6 py-16 text-center text-olive-400">
      {message}
    </div>
  );
}
