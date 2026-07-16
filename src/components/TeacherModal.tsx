"use client";

import { useState } from "react";
import type { TeacherProfile } from "@/types/models";

export default function TeacherModal({
  teacher,
  onClose,
  onSaved,
}: {
  teacher: TeacherProfile | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: teacher?.name ?? "",
    title: teacher?.title ?? "",
    bio: teacher?.bio ?? "",
    photoUrl: teacher?.photoUrl ?? "",
    credentials: teacher?.credentials ?? "",
    philosophy: teacher?.philosophy ?? "",
    specialties: teacher?.specialties ?? "",
    instagram: teacher?.instagram ?? "",
    practicingSince: teacher?.practicingSince ? teacher.practicingSince.slice(0, 10) : new Date().toISOString().slice(0, 10),
    isFounder: teacher?.isFounder ?? false,
  });
  const [account, setAccount] = useState({ email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = teacher ? `/api/teachers/${teacher.id}` : "/api/teachers";
    const method = teacher ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setSaving(false);
      setError(data?.error ?? "Не вдалося зберегти профіль.");
      return;
    }

    // Creating a brand-new (non-founder) profile can also set up that
    // person's login in the same step.
    if (!teacher && account.email && account.password) {
      const { id } = await res.json();
      const accountRes = await fetch(`/api/teachers/${id}/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      if (!accountRes.ok) {
        const data = await accountRes.json().catch(() => null);
        setSaving(false);
        setError(data?.error ?? "Профіль створено, але логін — ні. Спробуйте ще раз нижче.");
        return;
      }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-30 flex animate-fade-in items-center justify-center bg-olive-900/30 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-xl2 border border-olive/15 bg-cream p-6 shadow-card"
      >
        <h2 className="mb-4 font-sans text-xl font-extrabold uppercase tracking-tight text-olive-900">
          {teacher ? "Редагувати профіль" : "Новий викладач"}
        </h2>

        <Label>Ім&apos;я</Label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Посада</Label>
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
          placeholder="Засновниця платформи & Senior Methodologist"
        />

        <Label>Коротко про себе</Label>
        <textarea
          required
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          rows={3}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Фото (URL)</Label>
        <input
          value={form.photoUrl}
          onChange={(e) => set("photoUrl", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
          placeholder="https://"
        />

        <Label>Кваліфікація (один пункт на рядок)</Label>
        <textarea
          value={form.credentials}
          onChange={(e) => set("credentials", e.target.value)}
          rows={4}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Методологія (один пункт на рядок)</Label>
        <textarea
          value={form.philosophy}
          onChange={(e) => set("philosophy", e.target.value)}
          rows={4}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Спеціалізації (через кому)</Label>
        <input
          value={form.specialties}
          onChange={(e) => set("specialties", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <Label>Instagram (посилання)</Label>
        <input
          value={form.instagram}
          onChange={(e) => set("instagram", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
          placeholder="https://instagram.com/..."
        />

        <Label>Практикує з</Label>
        <input
          required
          type="date"
          value={form.practicingSince}
          onChange={(e) => set("practicingSince", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <label className="mb-4 flex items-center gap-2 text-sm text-olive-700">
          <input type="checkbox" checked={form.isFounder} onChange={(e) => set("isFounder", e.target.checked)} />
          Засновниця (показувати першою, з бейджем)
        </label>

        {!teacher && !form.isFounder && (
          <div className="mb-4 rounded-lg border border-olive/15 bg-white/60 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-olive-400">
              Логін для цього викладача (опційно)
            </p>
            <Label>Email</Label>
            <input
              type="email"
              value={account.email}
              onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
              placeholder="teacher@example.com"
            />
            <Label>Тимчасовий пароль</Label>
            <input
              value={account.password}
              onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
              className="w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
            />
            <p className="mt-2 text-xs text-olive-300">
              Цей викладач зможе редагувати лише домашні завдання своїх учнів — після створення призначте йому
              учнів у розділі «Учні».
            </p>
          </div>
        )}

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
