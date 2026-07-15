import HomeworkCard from "./HomeworkCard";
import type { Homework, HomeworkStatus } from "@/types/models";

const COLUMNS: { key: HomeworkStatus; label: string }[] = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "CHECKING", label: "Checking" },
  { key: "DONE", label: "Done" },
];

export default function HomeworkBoard({
  items,
  studentId,
}: {
  items: Homework[];
  studentId: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const columnItems = items.filter((h) => h.status === col.key);
        return (
          <div key={col.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-olive-500">{col.label}</h2>
              <span className="rounded-full bg-olive/10 px-2 py-0.5 text-xs text-olive-500">
                {columnItems.length}
              </span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-3 rounded-xl2 border border-dashed border-olive/15 bg-white/40 p-3">
              {columnItems.length === 0 ? (
                <p className="py-6 text-center text-xs text-olive-300">Порожньо</p>
              ) : (
                columnItems.map((hw) => <HomeworkCard key={hw.id} homework={hw} studentId={studentId} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
