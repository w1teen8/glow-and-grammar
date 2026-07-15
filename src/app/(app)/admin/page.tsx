"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import type { Student, TeacherProfile } from "@/types/models";

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", teacherId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [studentsRes, teachersRes] = await Promise.all([fetch("/api/students"), fetch("/api/teachers")]);
    setStudents(await studentsRes.json());
    setTeachers(await teachersRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Не вдалося створити учня.");
      return;
    }
    setForm({ name: "", email: "", password: "", teacherId: "" });
    setShowForm(false);
    load();
  }

  function teacherName(teacherId?: string | null) {
    return teachers.find((t) => t.id === teacherId)?.name ?? "—";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeading
          title="Учні"
          subtitle="Керування профілями учнів та швидкий перехід до їхніх даних."
          accent="bg-olive-500"
        />
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:brightness-95"
        >
          {showForm ? "Скасувати" : "+ Додати учня"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl2 border border-olive/15 bg-white/70 p-6 shadow-soft">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Ім&apos;я</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">
                Тимчасовий пароль
              </label>
              <input
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Викладач</label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                className="w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
              >
                <option value="">Не обрано</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-full bg-pink px-5 py-2 text-sm font-medium text-olive-900 shadow-soft disabled:opacity-60"
          >
            {saving ? "Створення…" : "Створити учня"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-olive-400">Завантаження…</p>
      ) : students.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-olive/25 bg-white/50 px-6 py-16 text-center text-olive-400">
          Учнів ще немає.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-olive/15 bg-white/70 shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-olive/10 text-xs uppercase tracking-wide text-olive-400">
                <th className="px-4 py-3">Ім&apos;я</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Викладач</th>
                <th className="px-4 py-3">Перейти до</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-olive/10 last:border-0 hover:bg-olive/5">
                  <td className="px-4 py-3 font-medium text-olive-700">{s.name}</td>
                  <td className="px-4 py-3 text-olive-500">{s.email}</td>
                  <td className="px-4 py-3 text-olive-500">{teacherName(s.teacherId)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <Link href={`/syllabus?studentId=${s.id}`} className="text-pink-700 underline">
                        Syllabus
                      </Link>
                      <Link href={`/homework?studentId=${s.id}`} className="text-pink-700 underline">
                        Homework
                      </Link>
                      <Link href={`/payments?studentId=${s.id}`} className="text-pink-700 underline">
                        Payments
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
