"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageHeading from "@/components/PageHeading";

const SECTIONS = [
  {
    href: "/syllabus",
    title: "Syllabus Tracker",
    description: "Програма курсу: теми, які ми вивчаємо зараз та пройшли раніше.",
  },
  {
    href: "/homework",
    title: "Homework Corner",
    description: "Домашні завдання: поточні вправи, списки слів, Quizlet та розмовні треки.",
  },
  {
    href: "/vocabulary",
    title: "Словник",
    description: "Усі слова для вивчення, зібрані з домашніх завдань в одному місці.",
  },
  {
    href: "/payments",
    title: "Payment & Attendance",
    description: "Календар занять та фінансовий трекер: баланс оплачених і проведених уроків.",
  },
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const withStudent = (href: string) => (studentId ? `${href}?studentId=${studentId}` : href);

  return (
    <div>
      <PageHeading
        title="Вітаємо у цифровому кабінеті"
        subtitle="Тут зберігається вся історія нашого навчання, домашні завдання та фінансовий баланс."
      />

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SECTIONS.map((section, i) => (
          <Link
            key={section.href}
            href={withStudent(section.href)}
            className="group animate-fade-in-up rounded-xl2 border border-olive/10 bg-white/70 p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:border-olive/25 hover:bg-white hover:shadow-premium"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <h2 className="font-display text-lg font-semibold text-olive-800 group-hover:text-olive-900">
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-olive-400">{section.description}</p>
            <span className="mt-4 inline-block text-xs font-medium text-pink-700 transition-transform duration-200 group-hover:translate-x-1">
              Перейти →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
