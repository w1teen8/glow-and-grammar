"use client";

import { useState } from "react";
import type { VocabBlock } from "@/types/models";

export default function VocabBlockCard({
  block,
  canEditDueDate,
  onChanged,
  selectable,
  selectedIds,
  onToggleSelect,
}: {
  block: VocabBlock;
  canEditDueDate: boolean;
  onChanged: () => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (item: { id: string; english: string; translation: string }) => void;
}) {
  const [dueDate, setDueDate] = useState(block.dueDate.slice(0, 10));
  const [savingDate, setSavingDate] = useState(false);
  const [savingLearned, setSavingLearned] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

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

  async function toggleItemLearned(itemId: string, learned: boolean) {
    setSavingItemId(itemId);
    await fetch(`/api/vocab-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learned }),
    });
    setSavingItemId(null);
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

      <div className="divide-y divide-olive/10">
        {block.vocabItems.map((v) => (
          <div key={v.id} className="flex items-center gap-3 px-5 py-2.5">
            {selectable && (
              <input
                type="checkbox"
                checked={selectedIds?.has(v.id) ?? false}
                onChange={() => onToggleSelect?.({ id: v.id, english: v.english, translation: v.translation })}
                className="h-4 w-4 shrink-0 accent-pink"
              />
            )}
            <span className="flex-1 text-sm text-olive-700">{v.english}</span>
            <span className="flex-1 text-sm text-olive-500">{v.translation}</span>
            <button
              onClick={() => toggleItemLearned(v.id, !v.learned)}
              disabled={savingItemId === v.id}
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium transition disabled:opacity-60 ${
                v.learned
                  ? "border-emerald-300 bg-emerald-100 text-emerald-800 hover:brightness-95"
                  : "border-olive/20 bg-white text-olive-400 hover:bg-olive/5"
              }`}
            >
              {v.learned ? "Вивчено ✓" : "Ще вчимо"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
