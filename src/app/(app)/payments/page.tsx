"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PaymentTable from "@/components/PaymentTable";
import PaymentModal from "@/components/PaymentModal";
import PaymentCalendar from "@/components/PaymentCalendar";
import PageHeading from "@/components/PageHeading";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import type { PaymentEntry } from "@/types/models";

export default function PaymentsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const isTeacher = session?.user.role === "TEACHER";

  const [entries, setEntries] = useState<PaymentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentEntry | null>(null);

  async function load() {
    if (isTeacher && !studentId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const qs = isTeacher && studentId ? `?studentId=${studentId}` : "";
    const res = await fetch(`/api/payments${qs}`);
    setEntries(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, isTeacher]);

  if (isTeacher && !studentId) {
    return <EmptyState message="Оберіть учня зверху, щоб побачити оплати та відвідування." icon="people" />;
  }

  const paidCount = entries.filter((e) => e.paymentStatus === "PAID").length;
  const totalPaid = entries
    .filter((e) => e.paymentStatus === "PAID")
    .reduce((sum, e) => sum + (e.amount ?? 0), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <PageHeading title="Payment & Attendance" subtitle="Облік занять, відвідуваності та оплат." />
        {isTeacher && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-95"
          >
            + Додати запис
          </button>
        )}
      </div>

      {!isTeacher && (
        <p className="mb-6 text-sm text-olive-500">
          Питання щодо оплати — пишіть Мілєні особисто в{" "}
          <a
            href="https://www.instagram.com/glowwgrammar"
            target="_blank"
            rel="noreferrer"
            className="text-pink-700 underline hover:text-pink-500"
          >
            Instagram
          </a>
          .
        </p>
      )}

      {!loading && entries.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <SummaryPill label="Записів" value={String(entries.length)} delay={0} />
          <SummaryPill label="Оплачено занять" value={String(paidCount)} delay={70} />
          {totalPaid > 0 && <SummaryPill label="Сума оплат" value={totalPaid.toFixed(0)} delay={140} />}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : entries.length === 0 ? (
        <EmptyState message="Записів ще немає." icon="card" />
      ) : (
        <div className="animate-fade-in-up space-y-6">
          <PaymentCalendar entries={entries} />
          <PaymentTable
            entries={entries}
            isTeacher={!!isTeacher}
            onEdit={(entry) => {
              setEditing(entry);
              setModalOpen(true);
            }}
          />
        </div>
      )}

      {modalOpen && isTeacher && studentId && (
        <PaymentModal
          studentId={studentId}
          entry={editing}
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

function SummaryPill({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <div
      className="animate-scale-in rounded-xl2 border border-olive/15 bg-white/70 px-4 py-2 shadow-soft transition-shadow duration-300 hover:shadow-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-olive-400">{label}: </span>
      <span className="font-medium text-olive-700">{value}</span>
    </div>
  );
}
