"use client";

import { useEffect, useState } from "react";
import type { Lesson } from "@/types/models";

export default function NewHomeworkModal({
  studentId,
  onClose,
  onCreated,
}: {
  studentId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState({ lessonId: "", title: "", deadline: "", taskContent: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons?studentId=${studentId}`)
      .then((r) => r.json())
      .then(setLessons);
  }, [studentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lessonId) return;
    setSaving(true);
    await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, studentId, vocabItems: [] }),
    });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-olive-900/30 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl2 border border-olive/15 bg-cream p-6 shadow-card"
      >
        <h2 className="mb-4 font-sans text-xl font-extrabold uppercase tracking-tight text-olive-900">
          Нове домашнє завдання
        </h2>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Заняття</label>
        <select
          required
          value={form.lessonId}
          onChange={(e) => setForm((f) => ({ ...f, lessonId: e.target.value }))}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        >
          <option value="">
            {lessons.length === 0 ? "Спершу додайте заняття в Syllabus Tracker" : "Оберіть заняття…"}
          </option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {new Date(l.date).toLocaleDateString("uk-UA")} — {l.grammar || "заняття"}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Назва завдання</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
          placeholder="Наприклад: Present Perfect — вправи"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Дедлайн</label>
        <input
          required
          type="datetime-local"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Завдання</label>
        <textarea
          value={form.taskContent}
          onChange={(e) => setForm((f) => ({ ...f, taskContent: e.target.value }))}
          rows={4}
          className="mb-5 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
          placeholder="Опис вправ, посилання на матеріали…"
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
            disabled={saving || lessons.length === 0}
            className="rounded-full bg-pink px-5 py-2 text-sm font-medium text-olive-900 shadow-soft disabled:opacity-60"
          >
            {saving ? "Збереження…" : "Створити"}
          </button>
        </div>
      </form>
    </div>
  );
}
