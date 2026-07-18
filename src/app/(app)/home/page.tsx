"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import FeatureIcon, { type FeatureIconName } from "@/components/FeatureIcon";

const SECTIONS: {
  href: string;
  title: string;
  description: string;
  icon: FeatureIconName;
}[] = [
  {
    href: "/syllabus",
    title: "Syllabus Tracker",
    description: "Програма курсу: теми, які ми вивчаємо зараз та пройшли раніше.",
    icon: "list",
  },
  {
    href: "/homework",
    title: "Homework Corner",
    description: "Домашні завдання: поточні вправи, списки слів, Quizlet та розмовні треки.",
    icon: "home",
  },
  {
    href: "/vocabulary",
    title: "Словник",
    description: "Усі слова для вивчення, зібрані з домашніх завдань в одному місці.",
    icon: "book",
  },
  {
    href: "/payments",
    title: "Payment & Attendance",
    description: "Календар занять та фінансовий трекер: баланс оплачених і проведених уроків.",
    icon: "card",
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Доброї ночі";
  if (hour < 12) return "Доброго ранку";
  if (hour < 18) return "Доброго дня";
  return "Доброго вечора";
}

export default function HomePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const withStudent = (href: string) => (studentId ? `${href}?studentId=${studentId}` : href);
  const firstName = session?.user.name?.split(" ")[0];

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl2 border border-olive/10 bg-gradient-to-br from-white via-white to-pink-50/60 px-6 py-9 shadow-soft sm:px-10 sm:py-11">
        <div className="bg-orb -right-16 -top-20 h-56 w-56 animate-float-slow bg-pink-300/20" aria-hidden />
        <div className="bg-orb -bottom-16 left-1/4 h-40 w-40 animate-float bg-olive-300/10" aria-hidden />
        <div className="relative">
          <p className="animate-fade-in-down text-xs font-medium uppercase tracking-[0.3em] text-pink-700">
            {greeting()}{firstName ? `, ${firstName}` : ""}
          </p>
          <div className="mt-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <PageHeading
              title="Вітаємо у цифровому кабінеті"
              subtitle="Тут зберігається вся історія нашого навчання, домашні завдання та фінансовий баланс."
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SECTIONS.map((section, i) => (
          <Link
            key={section.href}
            href={withStudent(section.href)}
            className="group relative flex animate-fade-in-up items-start gap-4 overflow-hidden rounded-xl2 border border-olive/10 bg-white/70 p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-olive/25 hover:bg-white hover:shadow-premium"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="absolute inset-x-0 top-0 h-1 scale-x-0 bg-gradient-to-r from-pink to-pink-300 transition-transform duration-300 ease-out origin-left group-hover:scale-x-100" />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-50 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110">
              <FeatureIcon name={section.icon} className="h-6 w-6 text-pink-700" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-olive-800 group-hover:text-olive-900">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-olive-400">{section.description}</p>
              <span className="mt-4 inline-block text-xs font-medium text-pink-700 transition-transform duration-200 group-hover:translate-x-1">
                Перейти →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
