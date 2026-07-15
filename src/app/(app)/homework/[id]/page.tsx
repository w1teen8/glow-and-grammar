"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import AudioRecorder from "@/components/AudioRecorder";
import VocabList from "@/components/VocabList";
import FeedbackSection from "@/components/FeedbackSection";
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
  const studentId = searchParams.get("studentId");
  const isTeacher = session?.user.role === "TEACHER";

  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function updateStatus(status: HomeworkStatus) {
    if (!homework) return;
    await fetch(`/api/homework/${homework.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return <p className="text-olive-400">Завантаження…</p>;
  if (!homework) return <p className="text-rose-600">Завдання не знайдено.</p>;

  const isDone = homework.status === "DONE";
  const backHref = studentId ? `/homework?studentId=${studentId}` : "/homework";

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
          <h2 className="mb-3 font-sans text-lg font-bold uppercase tracking-tight text-olive-800">Words to learn</h2>
          <VocabList homeworkId={homework.id} items={homework.vocabItems} editable={!!isTeacher} onSaved={load} />
        </div>

        <div>
          <h2 className="mb-3 font-sans text-lg font-bold uppercase tracking-tight text-olive-800">Teacher&apos;s Feedback</h2>
          <FeedbackSection homework={homework} isTeacher={!!isTeacher} onSaved={load} />
        </div>
      </div>
    </div>
  );
}
