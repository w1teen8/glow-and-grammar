"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import FeatureIcon, { type FeatureIconName } from "@/components/FeatureIcon";
import type { Student, TeacherProfile } from "@/types/models";

// How long a revealed password stays on screen before hiding itself again.
const REVEAL_MS = 20_000;

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", teacherId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ id: string; password: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleResetPassword(student: Student) {
    if (!confirm(`Показати пароль для ${student.name}? Буде згенеровано новий пароль — старий одразу перестане працювати.`)) return;
    setResettingId(student.id);
    const res = await fetch(`/api/students/${student.id}/reset-password`, { method: "POST" });
    setResettingId(null);
    if (!res.ok) {
      alert("Не вдалося скинути пароль.");
      return;
    }
    const data = await res.json();
    setRevealed({ id: student.id, password: data.password });
    // Best-effort — clipboard access can be denied by the browser, the
    // password is still shown on screen either way.
    navigator.clipboard?.writeText(data.password).catch(() => {});
    setTimeout(() => {
      setRevealed((r) => (r?.id === student.id ? null : r));
    }, REVEAL_MS);
  }

  async function handleDeleteStudent(student: Student) {
    if (
      !confirm(
        `Видалити учня ${student.name}? Це також видалить усі його заняття, домашні завдання та записи про оплати. Дію не можна скасувати.`
      )
    )
      return;
    setDeletingId(student.id);
    const res = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      alert("Не вдалося видалити учня.");
      return;
    }
    load();
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
          className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-95"
        >
          {showForm ? "Скасувати" : "+ Додати учня"}
        </button>
      </div>

      {!loading && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon="people" label="Учнів" value={students.length} delay={0} />
          <StatCard icon="sparkle" label="Викладачів" value={teachers.length} delay={90} />
          <StatCard
            icon="chart"
            label="Без викладача"
            value={students.filter((s) => !s.teacherId).length}
            delay={180}
          />
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 animate-scale-in rounded-xl2 border border-olive/15 bg-white/70 p-6 shadow-soft"
        >
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
        <Spinner label="Завантажуємо учнів…" />
      ) : students.length === 0 ? (
        <EmptyState message="Учнів ще немає." icon="people" />
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-olive/15 bg-white/70 shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-olive/10 text-xs uppercase tracking-wide text-olive-400">
                <th className="px-4 py-3">Ім&apos;я</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Викладач</th>
                <th className="px-4 py-3">Логін і пароль</th>
                <th className="px-4 py-3">Перейти до</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className="animate-fade-in-left border-b border-olive/10 transition-colors last:border-0 hover:bg-olive/5"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-xs font-semibold text-pink-700">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-olive-700">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-olive-500">{s.email}</td>
                  <td className="px-4 py-3 text-olive-500">{teacherName(s.teacherId)}</td>
                  <td className="px-4 py-3">
                    {revealed?.id === s.id ? (
                      <div className="flex animate-scale-in items-center gap-2">
                        <span className="rounded-md border border-pink/30 bg-pink-50 px-2 py-1 font-mono text-xs font-semibold tracking-wide text-olive-900">
                          {revealed.password}
                        </span>
                        <span className="text-xs text-olive-400">Скопійовано ✓</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleResetPassword(s)}
                        disabled={resettingId === s.id}
                        className="text-xs font-medium text-olive-500 underline decoration-olive-300 underline-offset-2 transition hover:text-olive-700 disabled:opacity-50"
                      >
                        {resettingId === s.id ? "Зачекайте…" : "Показати пароль"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <Link
                        href={`/syllabus?studentId=${s.id}`}
                        className="text-pink-700 underline decoration-pink-300 underline-offset-2 hover:text-pink-500"
                      >
                        Syllabus
                      </Link>
                      <Link
                        href={`/homework?studentId=${s.id}`}
                        className="text-pink-700 underline decoration-pink-300 underline-offset-2 hover:text-pink-500"
                      >
                        Homework
                      </Link>
                      <Link
                        href={`/payments?studentId=${s.id}`}
                        className="text-pink-700 underline decoration-pink-300 underline-offset-2 hover:text-pink-500"
                      >
                        Payments
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteStudent(s)}
                      disabled={deletingId === s.id}
                      className="text-xs font-medium text-rose-500 underline decoration-rose-300 underline-offset-2 transition hover:text-rose-700 disabled:opacity-50"
                    >
                      {deletingId === s.id ? "Видалення…" : "Видалити"}
                    </button>
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

function StatCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: FeatureIconName;
  label: string;
  value: number;
  delay: number;
}) {
  return (
    <div
      className="group flex animate-fade-in-up items-center gap-4 rounded-xl2 border border-olive/10 bg-white/70 p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-50 transition-transform duration-300 group-hover:scale-110">
        <FeatureIcon name={icon} className="h-6 w-6 text-pink-700" />
      </div>
      <div>
        <p className="animate-count-up font-display text-2xl font-semibold text-olive-900">{value}</p>
        <p className="text-xs uppercase tracking-wide text-olive-400">{label}</p>
      </div>
    </div>
  );
}
