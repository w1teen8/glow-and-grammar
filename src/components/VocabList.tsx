"use client";

import { useState } from "react";
import type { VocabItem } from "@/types/models";

function ReadonlyGrid({ items }: { items: VocabItem[] }) {
  if (items.length === 0) return <p className="text-sm text-olive-300">Слів поки немає.</p>;
  return (
    <div className="overflow-hidden rounded-xl2 border border-olive/15 bg-white/70">
      <div className="grid grid-cols-2 divide-x divide-olive/10">
        <div className="divide-y divide-olive/10">
          {items.map((i) => (
            <p key={i.id} className="px-4 py-2 text-sm text-olive-700">
              {i.english}
            </p>
          ))}
        </div>
        <div className="divide-y divide-olive/10">
          {items.map((i) => (
            <p key={i.id} className="px-4 py-2 text-sm text-olive-500">
              {i.translation}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VocabList({
  homeworkId,
  items,
  editable,
  onSaved,
}: {
  homeworkId: string;
  items: VocabItem[];
  editable: boolean;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState(items.map((i) => ({ english: i.english, translation: i.translation })));
  const [saving, setSaving] = useState(false);

  function updateRow(index: number, field: "english" | "translation", value: string) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((r) => [...r, { english: "", translation: "" }]);
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/homework/${homeworkId}/vocab`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabItems: rows.filter((r) => r.english.trim() || r.translation.trim()) }),
    });
    setSaving(false);
    setEditing(false);
    onSaved();
  }

  if (!editable) return <ReadonlyGrid items={items} />;

  if (!editing) {
    return (
      <div>
        <div className="mb-3">
          <ReadonlyGrid items={items} />
        </div>
        <button onClick={() => setEditing(true)} className="text-sm text-olive-500 underline hover:text-olive-700">
          Редагувати слова
        </button>
      </div>
    );
  }

  return (
    <div>
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
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-olive/30 px-4 py-1.5 text-xs text-olive-600 hover:bg-olive/10"
        >
          + Додати слово
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-pink px-4 py-1.5 text-xs font-medium text-olive-900 shadow-soft disabled:opacity-60"
        >
          {saving ? "Збереження…" : "Зберегти"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-olive-400 underline">
          Скасувати
        </button>
      </div>
    </div>
  );
}
