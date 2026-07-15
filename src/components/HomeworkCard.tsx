import Link from "next/link";
import StatusBadge from "./StatusBadge";
import type { Homework } from "@/types/models";

export default function HomeworkCard({
  homework,
  studentId,
}: {
  homework: Homework;
  studentId: string | null;
}) {
  const href = studentId ? `/homework/${homework.id}?studentId=${studentId}` : `/homework/${homework.id}`;
  const overdue = new Date(homework.deadline) < new Date() && homework.status !== "DONE";

  return (
    <Link
      href={href}
      className="block rounded-xl2 border border-olive/15 bg-white p-4 shadow-soft transition hover:shadow-card"
    >
      <p className="mb-2 text-sm font-medium text-olive-700">{homework.title}</p>
      <p className={`mb-3 text-xs ${overdue ? "text-rose-600" : "text-olive-400"}`}>
        Дедлайн: {new Date(homework.deadline).toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <StatusBadge kind="homework" value={homework.status} />
    </Link>
  );
}
