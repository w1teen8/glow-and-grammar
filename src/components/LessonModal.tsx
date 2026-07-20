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
  const [file, setFile] = useState<File | null>(null);
  const [attachment, setAttachment] = useState(
    lesson?.attachmentUrl ? { url: lesson.attachmentUrl, name: lesson.attachmentName } : null
  );
  const [removingAttachment, setRemovingAttachment] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = lesson ? `/api/lessons/${lesson.id}` : "/api/lessons";
    const method = lesson ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, studentId }),
    });

    if (file && res.ok) {
      const saved = await res.json();
      try {
        setUploadStage("Завантаження файлу…");
        // Ask our server for a signed R2 URL, then upload the bytes straight
        // from the browser to R2 — no relaying through our server.
        const presignRes = await fetch(`/api/lessons/${saved.id}/attachment/presign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream", size: file.size }),
        });
        if (!presignRes.ok) throw new Error("presign failed");
        const { uploadUrl, publicUrl } = await presignRes.json();

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!putRes.ok) throw new Error("upload failed");

        setUploadStage("Збереження…");
        await fetch(`/api/lessons/${saved.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attachmentUrl: publicUrl, attachmentName: file.name }),
        });
      } catch {
        // The lesson itself is already saved — only the file failed, so we
        // still close normally rather than blocking the whole save.
      }
    }

    setUploadStage(null);
    setSaving(false);
    onSaved();
  }

  async function handleRemoveAttachment() {
    if (!lesson) {
      setFile(null);
      setAttachment(null);
      return;
    }
    setRemovingAttachment(true);
    await fetch(`/api/lessons/${lesson.id}/attachment`, { method: "DELETE" });
    setRemovingAttachment(false);
    setAttachment(null);
    setFile(null);
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
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Файл до заняття (PDF, зображення тощо)</Label>
        {attachment && !file ? (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-olive/20 bg-white px-3 py-2 text-sm">
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-pink-700 underline decoration-pink-300"
            >
              {attachment.name ?? "Відкрити файл"}
            </a>
            <button
              type="button"
              onClick={handleRemoveAttachment}
              disabled={removingAttachment}
              className="shrink-0 text-xs text-rose-500 underline decoration-rose-300 hover:text-rose-700 disabled:opacity-50"
            >
              {removingAttachment ? "Видалення…" : "Видалити"}
            </button>
          </div>
        ) : (
          <div className="mb-5">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-olive/20 bg-white px-3 py-2 text-sm outline-none focus:border-olive"
            />
            {file && (
              <p className="mt-1 text-xs text-olive-400">
                Буде завантажено разом зі збереженням: {file.name}
              </p>
            )}
          </div>
        )}

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
            {saving ? uploadStage ?? "Збереження…" : "Зберегти"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">{children}</label>;
}
