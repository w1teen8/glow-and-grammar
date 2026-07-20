"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "@/types/models";

const DRAG_MIME = "application/x-vocab-word";

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
  const [dragOver, setDragOver] = useState(false);

  // Every word the student already has, across all lessons — deduplicated by
  // English spelling so the same word doesn't show up over and over just
  // because it was assigned in several blocks.
  const existingWords = useMemo(() => {
    const seen = new Set<string>();
    const words: { english: string; translation: string }[] = [];
    for (const lesson of lessons) {
      for (const block of lesson.vocabBlocks) {
        for (const item of block.vocabItems) {
          const key = item.english.trim().toLowerCase();
          if (key && !seen.has(key)) {
            seen.add(key);
            words.push({ english: item.english, translation: item.translation });
          }
        }
      }
    }
    return words;
  }, [lessons]);

  function addWord(word: { english: string; translation: string }) {
    setRows((r) => {
      // Drop it into the first empty row instead of always appending, so
      // dragging into a fresh block doesn't leave a blank row above it.
      const emptyIndex = r.findIndex((row) => !row.english.trim() && !row.translation.trim());
      if (emptyIndex !== -1) {
        return r.map((row, i) => (i === emptyIndex ? word : row));
      }
      return [...r, word];
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const data = e.dataTransfer.getData(DRAG_MIME);
    if (!data) return;
    try {
      addWord(JSON.parse(data));
    } catch {
      // Ignore malformed drag payloads.
    }
  }

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

        {existingWords.length > 0 && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-olive-400">
              Наявні слова — перетягніть у список нижче
            </label>
            <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-dashed border-olive/25 bg-white/50 p-2">
              {existingWords.map((word) => (
                <span
                  key={word.english}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData(DRAG_MIME, JSON.stringify(word))}
                  onClick={() => addWord(word)}
                  title="Перетягніть або натисніть, щоб додати"
                  className="cursor-grab select-none rounded-full border border-olive/20 bg-cream px-3 py-1 text-xs text-olive-600 transition hover:border-pink hover:bg-pink-50 active:cursor-grabbing"
                >
                  {word.english}
                </span>
              ))}
            </div>
          </div>
        )}

        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-olive-400">Слова</label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mb-3 space-y-2 rounded-lg p-1.5 transition-colors ${
            dragOver ? "bg-pink-50 ring-2 ring-pink/40" : ""
          }`}
        >
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
