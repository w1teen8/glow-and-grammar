"use client";

import { useState } from "react";
import { TARIFF_LABELS, type AttendanceStatus, type PaymentEntry, type PaymentStatus, type TariffPlan } from "@/types/models";

export default function PaymentModal({
  studentId,
  entry,
  onClose,
  onSaved,
}: {
  studentId: string;
  entry: PaymentEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    lessonLabel: entry?.lessonLabel ?? "",
    date: entry?.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    attendanceStatus: (entry?.attendanceStatus ?? "CONDUCTED") as AttendanceStatus,
    tariffPlan: (entry?.tariffPlan ?? "INDIVIDUAL_60") as TariffPlan,
    paymentStatus: (entry?.paymentStatus ?? "UNPAID") as PaymentStatus,
    amount: entry?.amount != null ? String(entry.amount) : "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = entry ? `/api/payments/${entry.id}` : "/api/payments";
    const method = entry ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        studentId,
        amount: form.amount ? Number(form.amount) : null,
      }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-olive-900/30 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl2 border border-olive/15 bg-cream p-6 shadow-card"
      >
        <h2 className="mb-4 font-sans text-xl font-extrabold uppercase tracking-tight text-olive-900">
          {entry ? "Редагувати запис" : "Новий запис"}
        </h2>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Заняття</label>
        <input
          required
          value={form.lessonLabel}
          onChange={(e) => set("lessonLabel", e.target.value)}
          placeholder="Наприклад: Lesson #12"
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Дата</label>
        <input
          required
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">
          Статус відвідування
        </label>
        <select
          value={form.attendanceStatus}
          onChange={(e) => set("attendanceStatus", e.target.value as AttendanceStatus)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        >
          <option value="CONDUCTED">Проведено</option>
          <option value="MISSED">Пропущено (списання 100%)</option>
          <option value="RESCHEDULED">Перенесено (безкоштовно)</option>
        </select>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Тарифний план</label>
        <select
          value={form.tariffPlan}
          onChange={(e) => set("tariffPlan", e.target.value as TariffPlan)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        >
          {Object.entries(TARIFF_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">Статус оплати</label>
        <select
          value={form.paymentStatus}
          onChange={(e) => set("paymentStatus", e.target.value as PaymentStatus)}
          className="mb-3 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
        >
          <option value="PAID">Оплачено</option>
          <option value="UNPAID">Неоплачено</option>
        </select>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-olive-400">
          Сума (опціонально)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          className="mb-5 w-full rounded-lg border border-olive/20 px-3 py-2 outline-none focus:border-olive"
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
