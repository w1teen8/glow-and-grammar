"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import AudioRecorder from "@/components/AudioRecorder";
import PhotoAnswer from "@/components/PhotoAnswer";
import VocabList from "@/components/VocabList";
import FeedbackSection from "@/components/FeedbackSection";
import NewHomeworkModal from "@/components/NewHomeworkModal";
import type { Homework, HomeworkStatus } from "@/types/models";

const STATUS_OPTIONS: { value: HomeworkStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CHECKING", label: "Checking" },
  { value: "DONE", label: "Done" },
];

export default function HomeworkDetailPage() {
  const { data: session } = useSession();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("studentId");
  const isTeacher = session?.user.role === "TEACHER";

  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [savingText, setSavingText] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/homework/${params.id}`);
    if (res.ok) setHomework(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    setAnswerText(homework?.answerText ?? "");
  }, [homework?.id, homework?.answerText]);

  async function updateStatus(status: HomeworkStatus) {
    if (!homework) return;
    await fetch(`/api/homework/${homework.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function saveAnswerText() {
    if (!homework) return;
    setSavingText(true);
    await fetch(`/api/homework/${homework.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerText }),
    });
    setSavingText(false);
    load();
  }

  const backHref = studentId ? `/homework?studentId=${studentId}` : "/homework";

  async function handleDelete() {
    if (!homework) return;
    if (!confirm(`Видалити завдання «${homework.title}»? Дію не можна скасувати.`)) return;
    setDeleting(true);
    await fetch(`/api/homework/${homework.id}`, { method: "DELETE" });
    router.push(backHref);
  }

  if (loading) return <p className="text-olive-400">Завантаження…</p>;
  if (!homework) return <p className="text-rose-600">Завдання не знайдено.</p>;

  const isDone = homework.status === "DONE";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={backHref} className="mb-6 inline-block text-sm text-olive-500 hover:text-olive-700">
        ← Homework Corner
      </Link>

      <div className="rounded-xl2 border border-olive/15 bg-white/70 p-6 shadow-soft sm:p-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-sans text-2xl font-extrabold uppercase tracking-tight text-olive-900">
              {homework.title}
            </h1>
            <p className="mt-1 text-sm text-olive-400">
              Дедлайн:{" "}
              {new Date(homework.deadline).toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {isTeacher && (
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="text-xs text-olive-500 underline hover:text-olive-700"
                >
                  Редагувати
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-rose-500 underline hover:text-rose-700 disabled:opacity-50"
                >
                  {deleting ? "Видалення…" : "Видалити"}
                </button>
              </div>
            )}
          </div>
          <StatusBadge kind="homework" value={homework.status} />
        </div>

        {homework.taskContent && (
          <div className="mb-6 whitespace-pre-wrap rounded-lg bg-cream/60 p-4 text-sm text-olive-700">
            {homework.taskContent}
          </div>
        )}

        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-olive-400">Статус</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const disabled = isTeacher ? false : isDone || opt.value === "DONE";
              const active = homework.status === opt.value;
              return (
                <button
                  key={opt.value}
                  disabled={disabled}
                  onClick={() => updateStatus(opt.value)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    active ? "border-olive bg-pink text-olive-900" : "border-olive/25 text-olive-600 hover:bg-olive/10"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 font-sans text-lg font-bold uppercase tracking-tight text-olive-800">Текстова відповідь</h2>
          {isDone || isTeacher ? (
            homework.answerText ? (
              <p className="whitespace-pre-wrap rounded-lg bg-cream/60 p-4 text-sm text-olive-700">
                {homework.answerText}
              </p>
            ) : (
              <p className="text-sm text-olive-300">Тексту немає.</p>
            )
          ) : (
            <div>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                placeholder="Напишіть свою відповідь тут…"
                className="mb-2 w-full rounded-lg border border-olive/20 px-3 py-2 text-sm outline-none focus:border-olive"
              />
              <button
                type="button"
                onClick={saveAnswerText}
                disabled={savingText || answerText === (homework.answerText ?? "")}
                className="rounded-full bg-pink px-4 py-1.5 text-xs font-medium text-olive-900 shadow-soft disabled:opacity-60"
              >
                {savingText ? "Збереження…" : "Зберегти текст"}
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="mb-3 font-sans text-lg font-bold uppercase tracking-tight text-olive-800">Аудіовідповідь</h2>
          <AudioRecorder
            homeworkId={homework.id}
            kind="answer"
            existingUrl={homework.audioUrl}
            disabled={isDone || isTeacher}
            onUploaded={load}
          />
        </div>

        <div className="mb-8">
          <h2 className="mb-3 font-sans text-lg font-bold uppercase tracking-tight text-olive-800">Фото відповіді</h2>
          <PhotoAnswer
            homeworkId={homework.id}
            photos={homework.photos}
            disabled={isDone || isTeacher}
            onChanged={load}
          />
        </div>

        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-sans text-lg font-bold uppercase tracking-tight text-olive-800">Words to learn</h2>
            <Link
              href={`/vocabulary?${new URLSearchParams({
                ...(studentId ? { studentId } : {}),
                homeworkId: homework.id,
              }).toString()}`}
              className="text-xs font-medium text-pink-700 underline decoration-pink-300 underline-offset-2 hover:text-pink-500"
            >
              Перейти до слів →
            </Link>
          </div>
          <VocabList homeworkId={homework.id} items={homework.vocabItems} editable={!!isTeacher} onSaved={load} />
        </div>

        <div>
          <h2 className="mb-3 font-sans text-lg font-bold uppercase tracking-tight text-olive-800">Teacher&apos;s Feedback</h2>
          <FeedbackSection homework={homework} isTeacher={!!isTeacher} onSaved={load} />
        </div>
      </div>

      {editModalOpen && (
        <NewHomeworkModal
          studentId={homework.studentId}
          homework={homework}
          onClose={() => setEditModalOpen(false)}
          onCreated={() => {
            setEditModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
