"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PaymentTable from "@/components/PaymentTable";
import PaymentModal from "@/components/PaymentModal";
import PaymentCalendar from "@/components/PaymentCalendar";
import PageHeading from "@/components/PageHeading";
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
    return <EmptyState message="Оберіть учня зверху, щоб побачити оплати та відвідування." />;
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
            className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:brightness-95"
          >
            + Додати запис
          </button>
        )}
      </div>

      {!loading && entries.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <SummaryPill label="Записів" value={String(entries.length)} />
          <SummaryPill label="Оплачено занять" value={String(paidCount)} />
          {totalPaid > 0 && <SummaryPill label="Сума оплат" value={totalPaid.toFixed(0)} />}
        </div>
      )}

      {loading ? (
        <p className="text-olive-400">Завантаження…</p>
      ) : entries.length === 0 ? (
        <EmptyState message="Записів ще немає." />
      ) : (
        <div className="space-y-6">
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

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl2 border border-olive/15 bg-white/70 px-4 py-2 shadow-soft">
      <span className="text-olive-400">{label}: </span>
      <span className="font-medium text-olive-700">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl2 border border-dashed border-olive/25 bg-white/50 px-6 py-16 text-center text-olive-400">
      {message}
    </div>
  );
}
