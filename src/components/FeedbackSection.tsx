"use client";

import { useState } from "react";
import AudioRecorder from "./AudioRecorder";
import type { Homework } from "@/types/models";

export default function FeedbackSection({
  homework,
  isTeacher,
  onSaved,
}: {
  homework: Homework;
  isTeacher: boolean;
  onSaved: () => void;
}) {
  const [text, setText] = useState(homework.feedbackText ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const isDone = homework.status === "DONE";

  async function save() {
    setSaving(true);
    await fetch(`/api/homework/${homework.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackText: text }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  if (!isTeacher) {
    return (
      <div className="rounded-xl2 border border-olive/15 bg-cream/60 p-4">
        {homework.feedbackText ? (
          <p className="whitespace-pre-wrap text-sm text-olive-700">{homework.feedbackText}</p>
        ) : (
          <p className="text-sm text-olive-300">Мілєна ще не залишила відгук.</p>
        )}
        {homework.feedbackAudioUrl && <audio controls src={homework.feedbackAudioUrl} className="mt-3 w-full" />}
        {isDone && (
          <p className="mt-2 text-xs text-olive-300">Це завдання завершено — відгук більше не редагується.</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl2 border border-olive/15 bg-cream/60 p-4">
      {editing ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 text-sm outline-none focus:border-olive"
            placeholder="Нотатки: що вийшло добре, над чим ще попрацювати…"
          />
          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-pink px-4 py-1.5 text-xs font-medium text-olive-900 shadow-soft disabled:opacity-60"
            >
              {saving ? "Збереження…" : "Зберегти відгук"}
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-olive-400 underline">
              Скасувати
            </button>
          </div>
        </>
      ) : (
        <>
          {homework.feedbackText ? (
            <p className="mb-3 whitespace-pre-wrap text-sm text-olive-700">{homework.feedbackText}</p>
          ) : (
            <p className="mb-3 text-sm text-olive-300">Відгуку ще немає.</p>
          )}
          <button
            onClick={() => setEditing(true)}
            className="mb-4 text-xs text-olive-500 underline hover:text-olive-700"
          >
            {homework.feedbackText ? "Редагувати відгук" : "Додати відгук"}
          </button>
        </>
      )}

      <div className="mt-2">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-olive-400">Голосовий відгук</p>
        <AudioRecorder
          homeworkId={homework.id}
          kind="feedback"
          existingUrl={homework.feedbackAudioUrl}
          onUploaded={onSaved}
        />
      </div>
    </div>
  );
}
