"use client";

import StatusBadge from "./StatusBadge";
import { TARIFF_LABELS, type PaymentEntry } from "@/types/models";

export default function PaymentTable({
  entries,
  isTeacher,
  onEdit,
}: {
  entries: PaymentEntry[];
  isTeacher: boolean;
  onEdit: (entry: PaymentEntry) => void;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl2 border border-olive/15 bg-white/70 shadow-soft sm:block">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-olive/10 text-xs uppercase tracking-wide text-olive-400">
              <th className="px-4 py-3">Заняття</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Відвідування</th>
              <th className="px-4 py-3">Тариф</th>
              <th className="px-4 py-3">Оплата</th>
              {isTeacher && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-olive/10 last:border-0 hover:bg-olive/5">
                <td className="px-4 py-3 font-medium text-olive-700">{entry.lessonLabel}</td>
                <td className="whitespace-nowrap px-4 py-3 text-olive-700">
                  {new Date(entry.date).toLocaleDateString("uk-UA")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge kind="attendance" value={entry.attendanceStatus} />
                </td>
                <td className="px-4 py-3 text-olive-700">{TARIFF_LABELS[entry.tariffPlan]}</td>
                <td className="px-4 py-3">
                  <StatusBadge kind="payment" value={entry.paymentStatus} />
                </td>
                {isTeacher && (
                  <td className="px-4 py-3">
                    <button onClick={() => onEdit(entry)} className="text-olive-500 hover:text-olive-700">
                      Редагувати
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 sm:hidden">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl2 border border-olive/15 bg-white/70 p-4 shadow-soft">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-olive-700">{entry.lessonLabel}</span>
              <span className="text-xs text-olive-400">{new Date(entry.date).toLocaleDateString("uk-UA")}</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusBadge kind="attendance" value={entry.attendanceStatus} />
              <StatusBadge kind="payment" value={entry.paymentStatus} />
            </div>
            <p className="text-sm text-olive-500">{TARIFF_LABELS[entry.tariffPlan]}</p>
            {isTeacher && (
              <button onClick={() => onEdit(entry)} className="mt-3 text-xs text-olive-500 underline">
                Редагувати
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
