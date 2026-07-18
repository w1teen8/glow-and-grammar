"use client";

import { useMemo, useState } from "react";
import type { PaymentEntry } from "@/types/models";

const ATTENDANCE_BG: Record<string, string> = {
  SCHEDULED: "bg-sky-100 text-sky-800 border-sky-300",
  CONDUCTED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  MISSED: "bg-rose-100 text-rose-800 border-rose-300",
  RESCHEDULED: "bg-amber-100 text-amber-800 border-amber-300",
};

const PAYMENT_DOT: Record<string, string> = {
  PAID: "bg-emerald-500",
  UNPAID: "bg-rose-500",
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export default function PaymentCalendar({ entries }: { entries: PaymentEntry[] }) {
  const [cursor, setCursor] = useState(() => {
    const anchor = entries[0] ? new Date(entries[0].date) : new Date();
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });

  // Keyed on the raw "YYYY-MM-DD" prefix of the stored ISO date — both sides
  // stay in UTC so there's no local-timezone day-shift.
  const byDay = useMemo(() => {
    const map = new Map<string, PaymentEntry[]>();
    for (const e of entries) {
      const key = e.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-xl2 border border-olive/15 bg-white/70 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-full px-2 py-1 text-olive-500 transition hover:bg-olive/10"
          aria-label="Попередній місяць"
        >
          ←
        </button>
        <p className="text-sm font-semibold capitalize text-olive-700">
          {cursor.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-full px-2 py-1 text-olive-500 transition hover:bg-olive/10"
          aria-label="Наступний місяць"
        >
          →
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 text-center text-xs text-olive-300">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEntries = byDay.get(key) ?? [];
          const primary = dayEntries[0];

          return (
            <div
              key={i}
              title={primary ? `${primary.lessonLabel} — ${primary.attendanceStatus}, ${primary.paymentStatus}` : undefined}
              className={`relative flex aspect-square items-center justify-center rounded-lg border text-xs ${
                primary ? ATTENDANCE_BG[primary.attendanceStatus] : "border-olive/10 text-olive-300"
              }`}
            >
              {day}
              {primary && (
                <span
                  className={`absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full ${PAYMENT_DOT[primary.paymentStatus]}`}
                />
              )}
              {dayEntries.length > 1 && (
                <span className="absolute left-1 top-1 text-[9px] text-olive-400">+{dayEntries.length - 1}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-olive-400">
        <Legend swatch="border border-sky-300 bg-sky-100" label="Заплановано" />
        <Legend swatch="border border-emerald-300 bg-emerald-100" label="Проведено" />
        <Legend swatch="border border-rose-300 bg-rose-100" label="Пропущено" />
        <Legend swatch="border border-amber-300 bg-amber-100" label="Перенесено" />
        <Legend swatch="bg-emerald-500" label="Оплачено" round />
        <Legend swatch="bg-rose-500" label="Неоплачено" round />
      </div>
    </div>
  );
}

function Legend({ swatch, label, round }: { swatch: string; label: string; round?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 ${round ? "rounded-full" : "rounded"} ${swatch}`} />
      {label}
    </span>
  );
}
