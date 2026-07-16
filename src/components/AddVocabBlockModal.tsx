"use client";

import { useState } from "react";
import type { Lesson } from "@/types/models";

function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AddVocabBlockModal({
  lessons,
  onClose,
  onSaved,
}: {
  lessons: Lesson[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [dueDate, setDueDate] = useState(() => (lessons[0] ? addDays(lessons[0].date, 5) : ""));
  const [rows, setRows] = useState([{ english: "", translation: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLessonChange(id: string) {
    setLessonId(id);
    const lesson = lessons.find((l) => l.id === id);
    if (lesson) setDueDate(addDays(lesson.date, 5));
  }

  function updateRow(i: number, field: "english" | "translation", value: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function addRow() {
    setRows((r) => [...r, { english: "", translation: "" }]);
  }
  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const words = rows.filter((r) => r.english.trim() && r.translation.trim());
    if (!lessonId || !dueDate || words.length === 0) {
      setError("Оберіть заняття, дату та хоча б одне слово.");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/lessons/${lessonId}/vocab-blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate, vocabItems: words }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Не вдалося зберегти. Спробуйте ще раз.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-30 flex animate-fade-in items-center justify-center bg-olive-900/30 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-xl2 border border-olive/15 bg-cream p-6 shadow-card"
      >
        <h2 className="mb-1 text-xl font-semibold tracking-tight text-olive-900">Нові слова</h2>
        <p className="mb-4 text-sm text-olive-400">
          Блок слів прив&apos;язується до заняття та має дату, до якої їх треба вивчити.
        </p>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Заняття</label>
        <select
          required
          value={lessonId}
          onChange={(e) => handleLessonChange(e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        >
          {lessons.length === 0 && <option value="">Спершу додайте заняття в Syllabus Tracker</option>}
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {new Date(l.date).toLocaleDateString("uk-UA")} — {l.grammar || "заняття"}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">
          Вивчити до
        </label>
        <input
          required
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mb-4 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-olive-400">Слова</label>
        <div className="mb-3 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={row.english}
                onChange={(e) => updateRow(i, "english", e.target.value)}
                placeholder="English word"
                className="w-1/2 rounded-lg border border-olive/20 px-3 py-2 text-sm outline-none focus:border-olive"
              />
              <input
                value={row.translation}
                onChange={(e) => updateRow(i, "translation", e.target.value)}
                placeholder="Переклад / визначення"
                className="w-1/2 rounded-lg border border-olive/20 px-3 py-2 text-sm outline-none focus:border-olive"
              />
              <button type="button" onClick={() => removeRow(i)} className="px-2 text-olive-400 hover:text-rose-600">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mb-4 rounded-full border border-olive/30 px-4 py-1.5 text-xs text-olive-600 hover:bg-olive/10"
        >
          + Додати рядок
        </button>

        {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

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
            {saving ? "Збереження…" : "Зберегти"}
          </button>
        </div>
      </form>
    </div>
  );
}
