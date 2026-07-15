"use client";

import { useState } from "react";
import type { VocabBlock } from "@/types/models";

export default function VocabBlockCard({
  block,
  canEditDueDate,
  onChanged,
}: {
  block: VocabBlock;
  canEditDueDate: boolean;
  onChanged: () => void;
}) {
  const [dueDate, setDueDate] = useState(block.dueDate.slice(0, 10));
  const [savingDate, setSavingDate] = useState(false);
  const [savingLearned, setSavingLearned] = useState(false);

  async function saveDueDate() {
    setSavingDate(true);
    await fetch(`/api/vocab-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate }),
    });
    setSavingDate(false);
    onChanged();
  }

  async function toggleLearned() {
    setSavingLearned(true);
    await fetch(`/api/vocab-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learned: !block.learned }),
    });
    setSavingLearned(false);
    onChanged();
  }

  const dateChanged = dueDate !== block.dueDate.slice(0, 10);

  return (
    <div className="overflow-hidden rounded-xl2 border border-olive/15 bg-white/70 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-olive/10 px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-olive-700">Вивчити до:</span>
          {canEditDueDate ? (
            <>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg border border-olive/20 px-2 py-1 text-sm outline-none focus:border-olive"
              />
              {dateChanged && (
                <button
                  onClick={saveDueDate}
                  disabled={savingDate}
                  className="text-xs font-medium text-pink-700 underline disabled:opacity-60"
                >
                  {savingDate ? "Збереження…" : "Зберегти"}
                </button>
              )}
            </>
          ) : (
            <span className="text-olive-600">{new Date(block.dueDate).toLocaleDateString("uk-UA")}</span>
          )}
        </div>

        <button
          onClick={toggleLearned}
          disabled={savingLearned}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
            block.learned
              ? "border-emerald-300 bg-emerald-100 text-emerald-800 hover:brightness-95"
              : "border-rose-300 bg-rose-100 text-rose-800 hover:brightness-95"
          }`}
        >
          {block.learned ? "Вивчено ✓" : "Ще вчимо"}
        </button>
      </div>

      <div className="grid grid-cols-2 divide-x divide-olive/10">
        <div className="divide-y divide-olive/10">
          {block.vocabItems.map((v) => (
            <p key={v.id} className="px-5 py-2.5 text-sm text-olive-700">
              {v.english}
            </p>
          ))}
        </div>
        <div className="divide-y divide-olive/10">
          {block.vocabItems.map((v) => (
            <p key={v.id} className="px-5 py-2.5 text-sm text-olive-500">
              {v.translation}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
