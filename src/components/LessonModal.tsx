"use client";

import { useState } from "react";
import type { Lesson, LessonStatus } from "@/types/models";

export default function LessonModal({
  studentId,
  lesson,
  onClose,
  onSaved,
}: {
  studentId: string;
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date: lesson?.date ? lesson.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    grammar: lesson?.grammar ?? "",
    vocabulary: lesson?.vocabulary ?? "",
    readingListening: lesson?.readingListening ?? "",
    speaking: lesson?.speaking ?? "",
    writing: lesson?.writing ?? "",
    status: (lesson?.status ?? "IN_PROGRESS") as LessonStatus,
    lessonLink: lesson?.lessonLink ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = lesson ? `/api/lessons/${lesson.id}` : "/api/lessons";
    const method = lesson ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, studentId }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-30 flex animate-fade-in items-center justify-center bg-olive-900/30 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-xl2 border border-olive/15 bg-cream p-6 shadow-card"
      >
        <h2 className="mb-4 font-sans text-xl font-extrabold uppercase tracking-tight text-olive-900">
          {lesson ? "Редагувати заняття" : "Нове заняття"}
        </h2>

        <Label>Дата</Label>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Grammar</Label>
        <textarea
          value={form.grammar}
          onChange={(e) => set("grammar", e.target.value)}
          rows={2}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Vocabulary</Label>
        <textarea
          value={form.vocabulary}
          onChange={(e) => set("vocabulary", e.target.value)}
          rows={2}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Reading / Listening</Label>
        <textarea
          value={form.readingListening}
          onChange={(e) => set("readingListening", e.target.value)}
          rows={2}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Speaking</Label>
        <textarea
          value={form.speaking}
          onChange={(e) => set("speaking", e.target.value)}
          rows={2}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Writing</Label>
        <textarea
          value={form.writing}
          onChange={(e) => set("writing", e.target.value)}
          rows={2}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Статус</Label>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value as LessonStatus)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        >
          <option value="IN_PROGRESS">In Progress</option>
          <option value="MASTERED">Mastered</option>
          <option value="REVIEW_NEEDED">Review needed</option>
        </select>

        <Label>Посилання на матеріал (Canva / Google Drive)</Label>
        <input
          type="url"
          value={form.lessonLink}
          onChange={(e) => set("lessonLink", e.target.value)}
          placeholder="https://"
          className="mb-5 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-olive/30 px-5 py-2 text-sm text-olive-700"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-pink px-5 py-2 text-sm font-medium text-olive-900 shadow-soft disabled:opacity-60"
          >
            {saving ? "Збереження…" : "Зберегти"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">{children}</label>;
}
