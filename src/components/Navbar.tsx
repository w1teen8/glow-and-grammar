"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import StudentSwitcher from "./StudentSwitcher";

const TABS = [
  { href: "/home", label: "Кабінет" },
  { href: "/syllabus", label: "Syllabus Tracker" },
  { href: "/homework", label: "Homework Corner" },
  { href: "/vocabulary", label: "Словник" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [studentName, setStudentName] = useState<string | null>(null);

  const isTeacher = session?.user.role === "TEACHER";
  const isAdmin = !!session?.user.isAdmin;
  const studentId = searchParams.get("studentId");

  useEffect(() => {
    if (!isTeacher) {
      setStudentName(session?.user.name ?? null);
      return;
    }
    if (!studentId) {
      setStudentName(null);
      return;
    }
    fetch(`/api/students/${studentId}`)
      .then((r) => r.json())
      .then((s) => setStudentName(s?.name ?? null))
      .catch(() => setStudentName(null));
  }, [isTeacher, studentId, session?.user.name]);

  const withStudent = (href: string) => (studentId ? `${href}?studentId=${studentId}` : href);
  // Payment & Attendance is a founder-only area — a regular teacher account only manages homework.
  const showPayments = !isTeacher || isAdmin;

  return (
    <header className="sticky top-0 z-20 border-b border-olive/10 bg-cream/80 shadow-[0_1px_0_rgba(97,109,78,0.06)] backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-olive-900 sm:text-2xl">
              Glow &amp; Grammar
              {studentName && <span className="font-sans text-base font-normal text-olive-500"> • {studentName}</span>}
            </p>
            {isTeacher && <p className="mt-1 text-xs uppercase tracking-wide text-olive-300">Admin panel</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isTeacher && <StudentSwitcher />}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-full border border-olive/30 px-4 py-1.5 text-sm text-olive-700 hover:-translate-y-0.5 hover:bg-olive/10"
            >
              Вийти
            </button>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2 pb-4">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={withStudent(tab.href)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-pink text-olive-900 shadow-soft" : "text-olive-700 hover:bg-olive/10"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}

          {showPayments && (
            <Link
              href={withStudent("/payments")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname?.startsWith("/payments") ? "bg-pink text-olive-900 shadow-soft" : "text-olive-700 hover:bg-olive/10"
              }`}
            >
              Payment & Attendance
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname?.startsWith("/admin") ? "bg-pink text-olive-900 shadow-soft" : "text-olive-700 hover:bg-olive/10"
              }`}
            >
              Учні
            </Link>
          )}

          {/* Deliberately set apart from the rest of the nav — solid olive, always visible. */}
          <span className="mx-1 hidden h-6 w-px bg-olive/20 sm:inline-block" aria-hidden />
          <Link
            href={withStudent("/teachers")}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-cream shadow-soft hover:-translate-y-0.5 hover:shadow-card ${
              pathname?.startsWith("/teachers") ? "bg-olive-900" : "bg-olive-700 hover:bg-olive-900"
            }`}
          >
            Викладачі
          </Link>
        </nav>
      </div>
    </header>
  );
}
