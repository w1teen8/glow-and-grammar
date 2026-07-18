"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TeacherCard from "@/components/TeacherCard";
import TeacherModal from "@/components/TeacherModal";
import PageHeading from "@/components/PageHeading";
import Spinner from "@/components/Spinner";
import type { TeacherProfile } from "@/types/models";

export default function TeachersPage() {
  const { data: session } = useSession();
  const isAdmin = !!session?.user.isAdmin;

  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherProfile | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/teachers");
    setTeachers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <PageHeading title="Викладачі" subtitle="Команда, що стоїть за Glow & Grammar." />
        {isAdmin && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-95"
          >
            + Додати викладача
          </button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {teachers.map((t, i) => (
            <div key={t.id} style={{ animationDelay: `${i * 90}ms` }} className="animate-fade-in-up">
              <TeacherCard
                teacher={t}
                isTeacher={isAdmin}
                onEdit={() => {
                  setEditing(t);
                  setModalOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TeacherModal
          teacher={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
