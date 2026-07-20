"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import AddVocabBlockModal from "@/components/AddVocabBlockModal";
import VocabBlockCard from "@/components/VocabBlockCard";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import type { Lesson } from "@/types/models";

type PickedWord = { english: string; translation: string };

export default function VocabularyPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const homeworkId = searchParams.get("homeworkId");
  const isTeacher = session?.user.role === "TEACHER";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Map<string, PickedWord>>(new Map());
  const [addingToHomework, setAddingToHomework] = useState(false);

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

  function toggleSelect(item: { id: string; english: string; translation: string }) {
    setSelected((s) => {
      const next = new Map(s);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, { english: item.english, translation: item.translation });
      return next;
    });
  }

  async function addSelectedToHomework() {
    if (!homeworkId || selected.size === 0) return;
    setAddingToHomework(true);
    const res = await fetch(`/api/homework/${homeworkId}`);
    const homework = await res.json();
    const existing: PickedWord[] = (homework.vocabItems ?? []).map((v: PickedWord) => ({
      english: v.english,
      translation: v.translation,
    }));
    const seen = new Set(existing.map((w) => w.english.trim().toLowerCase()));
    const merged = [...existing];
    for (const word of selected.values()) {
      const key = word.english.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(word);
      }
    }

    await fetch(`/api/homework/${homeworkId}/vocab`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabItems: merged }),
    });
    setAddingToHomework(false);
    setSelected(new Map());
  }

  if (isTeacher && !studentId) {
    return <EmptyState message="Оберіть учня зверху, щоб побачити слова для вивчення." icon="people" />;
  }

  const groups = lessons.filter((l) => l.vocabBlocks.length > 0);
  const totalWords = groups.reduce(
    (sum, l) => sum + l.vocabBlocks.reduce((s, b) => s + b.vocabItems.length, 0),
    0
  );

  const pickingForHomework = isTeacher && !!homeworkId;

  return (
    <div className={pickingForHomework ? "pb-20" : undefined}>
      {pickingForHomework && (
        <Link
          href={`/homework/${homeworkId}${studentId ? `?studentId=${studentId}` : ""}`}
          className="mb-4 inline-block text-sm text-olive-500 hover:text-olive-700"
        >
          ← Назад до домашки
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeading
          title="Словник"
          subtitle={
            pickingForHomework
              ? "Оберіть слова, які варто додати до цієї домашки — позначте прапорцями."
              : "Слова, додані на занятті — з датою, до якої їх варто вивчити."
          }
          accent="bg-olive-500"
        />
        {isTeacher && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-95"
          >
            + Додати слова
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-8">
          <Spinner />
        </div>
      ) : groups.length === 0 ? (
        <div className="mt-8">
          <EmptyState message="Слів для вивчення поки немає." icon="book" />
        </div>
      ) : (
        <>
          <p className="mt-6 animate-fade-in text-sm text-olive-400">Всього слів: {totalWords}</p>
          <div className="mt-4 space-y-8">
            {groups.map((lesson, i) => (
              <div key={lesson.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-300">
                  Заняття {new Date(lesson.date).toLocaleDateString("uk-UA")}
                  {lesson.grammar && ` — ${lesson.grammar}`}
                </p>
                <div className="space-y-3">
                  {lesson.vocabBlocks.map((block) => (
                    <VocabBlockCard
                      key={block.id}
                      block={block}
                      canEditDueDate={!!isTeacher}
                      onChanged={load}
                      selectable={pickingForHomework}
                      selectedIds={new Set(selected.keys())}
                      onToggleSelect={toggleSelect}
                    />
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

      {pickingForHomework && selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex animate-fade-in-up justify-center px-4 pb-5">
          <div className="flex items-center gap-4 rounded-full border border-olive/15 bg-cream px-5 py-3 shadow-premium">
            <span className="text-sm text-olive-600">Обрано слів: {selected.size}</span>
            <button
              onClick={addSelectedToHomework}
              disabled={addingToHomework}
              className="rounded-full bg-pink px-5 py-2 text-sm font-medium text-olive-900 shadow-soft disabled:opacity-60"
            >
              {addingToHomework ? "Додавання…" : "Додати до домашки"}
            </button>
            <button onClick={() => setSelected(new Map())} className="text-xs text-olive-400 underline">
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
