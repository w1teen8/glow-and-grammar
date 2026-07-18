type BadgeKind = "lesson" | "homework" | "attendance" | "payment";

const MAPS: Record<BadgeKind, Record<string, { label: string; className: string }>> = {
  lesson: {
    IN_PROGRESS: { label: "In Progress", className: "bg-amber-100 text-amber-800 border-amber-200" },
    MASTERED: { label: "Mastered", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    REVIEW_NEEDED: { label: "Review needed", className: "bg-rose-100 text-rose-800 border-rose-200" },
  },
  homework: {
    TODO: { label: "To Do", className: "bg-olive-100 text-olive-700 border-olive-300" },
    IN_PROGRESS: { label: "In Progress", className: "bg-amber-100 text-amber-800 border-amber-200" },
    CHECKING: { label: "Checking", className: "bg-pink-50 text-pink-700 border-pink-300" },
    DONE: { label: "Done", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  },
  attendance: {
    SCHEDULED: { label: "Заплановано", className: "bg-sky-100 text-sky-800 border-sky-200" },
    CONDUCTED: { label: "Проведено", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    MISSED: { label: "Пропущено (списання 100%)", className: "bg-rose-100 text-rose-800 border-rose-200" },
    RESCHEDULED: { label: "Перенесено (безкоштовно)", className: "bg-amber-100 text-amber-800 border-amber-200" },
  },
  payment: {
    PAID: { label: "Оплачено", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    UNPAID: { label: "Неоплачено", className: "bg-rose-100 text-rose-800 border-rose-200" },
  },
};

export default function StatusBadge({ kind, value }: { kind: BadgeKind; value: string }) {
  const entry = MAPS[kind][value] ?? {
    label: value,
    className: "bg-olive-100 text-olive-700 border-olive-300",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${entry.className}`}
    >
      {entry.label}
    </span>
  );
}
