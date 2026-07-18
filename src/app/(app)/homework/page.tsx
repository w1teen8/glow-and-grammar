"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import HomeworkBoard from "@/components/HomeworkBoard";
import NewHomeworkModal from "@/components/NewHomeworkModal";
import PageHeading from "@/components/PageHeading";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import type { Homework } from "@/types/models";

export default function HomeworkPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const isTeacher = session?.user.role === "TEACHER";

  const [items, setItems] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    if (isTeacher && !studentId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const qs = isTeacher && studentId ? `?studentId=${studentId}` : "";
    const res = await fetch(`/api/homework${qs}`);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, isTeacher]);

  if (isTeacher && !studentId) {
    return <EmptyState message="Оберіть учня зверху, щоб побачити домашні завдання." icon="people" />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeading
          title="Homework Corner"
          subtitle="Прогрес виконання завдань — від «To Do» до «Done»."
          accent="bg-olive-500"
        />
        {isTeacher && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-95"
          >
            + Нове завдання
          </button>
        )}
      </div>

      {loading ? <Spinner /> : <HomeworkBoard items={items} studentId={studentId} />}

      {modalOpen && studentId && (
        <NewHomeworkModal
          studentId={studentId}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
