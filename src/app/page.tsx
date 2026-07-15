import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { experienceLabel } from "@/lib/experience";
import { TARIFF_LABELS, type TariffPlan } from "@/types/models";
import FeatureIcon from "@/components/FeatureIcon";

const FEATURES = [
  {
    title: "Syllabus Tracker",
    description: "Програма курсу: теми, які ми вивчаємо зараз та пройшли раніше.",
    icon: "list",
  },
  {
    title: "Homework Corner",
    description: "Завдання, аудіовідповіді та фідбек від викладача.",
    icon: "home",
  },
  {
    title: "Vocabulary",
    description: "Слова, додані на занятті, блоками — щоб вивчити їх до наступного.",
    icon: "book",
  },
  {
    title: "Payments",
    description: "Календар занять та фінансовий баланс: що проведено, що оплачено.",
    icon: "card",
  },
  {
    title: "Teachers",
    description: "Команда, що стоїть за платформою.",
    icon: "people",
  },
] as const;

const TARIFF_DESCRIPTIONS: Record<TariffPlan, string> = {
  INDIVIDUAL_60: "Персональні заняття один на один — повна година у фокусі на ваших цілях.",
  INDIVIDUAL_45: "Компактний формат для щільного графіка — 45 хвилин індивідуальної роботи.",
  PAIR_60: "Заняття у парі — разом веселіше, повна година живої практики.",
  PAIR_45: "Заняття у парі, стислий формат — 45 хвилин активної розмовної практики.",
};

export default async function RootPage() {
  const session = await getSession();
  if (session?.user) redirect(session.user.isAdmin ? "/admin" : "/home");

  const founder = await prisma.teacherProfile.findFirst({ where: { isFounder: true } });
  const experience = founder ? experienceLabel(new Date(founder.practicingSince)) : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-olive/10 px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="font-display text-lg font-semibold tracking-tight text-olive-900">Glow &amp; Grammar</p>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-olive/30 px-4 py-1.5 text-sm text-olive-700 hover:-translate-y-0.5 hover:bg-olive/10"
            >
              Вхід
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-pink px-4 py-1.5 text-sm font-medium text-olive-900 shadow-soft hover:-translate-y-0.5 hover:shadow-card hover:brightness-95"
            >
              Реєстрація
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-olive-700 via-olive-800 to-olive-900 px-4 py-20 text-cream sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-pink-300/15 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-cream/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          {experience && (
            <span className="inline-block rounded-full border border-cream/25 bg-cream/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cream/80">
              {experience}
            </span>
          )}
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Вільно говори англійською разом із Glow &amp; Grammar
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/80">
            Персональний цифровий кабінет для навчання: програма занять, домашні завдання, слова для
            вивчення та фінансовий баланс — в одному місці.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-pink px-7 py-3 text-sm font-semibold text-olive-900 shadow-premium hover:-translate-y-0.5 hover:brightness-95"
            >
              Записатись на урок
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-cream/40 px-7 py-3 text-sm font-medium text-cream hover:-translate-y-0.5 hover:bg-cream/10"
            >
              Увійти в кабінет
            </Link>
          </div>
        </div>
      </section>

      {/* Tariffs */}
      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-olive-400">Формати занять</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-olive-900 sm:text-4xl">
            Оберіть, що підходить саме вам
          </h2>
          <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(TARIFF_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="group relative flex flex-col overflow-hidden rounded-xl2 border border-olive/10 bg-white p-6 shadow-soft hover:-translate-y-1 hover:shadow-premium"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink to-pink-300" />
                <h3 className="text-base font-semibold text-olive-800">{label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-olive-400">
                  {TARIFF_DESCRIPTIONS[key as TariffPlan]}
                </p>
                <Link
                  href="/register"
                  className="mt-5 rounded-full bg-pink px-4 py-2 text-center text-xs font-semibold text-olive-900 shadow-soft group-hover:brightness-95"
                >
                  Дізнатись про доступ
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid — same container as the tariffs above, so both rows
          share the same left/right edges. */}
      <section className="mx-auto max-w-5xl px-0 py-16 sm:px-0">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-olive-300">Що всередині кабінету</p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="relative flex flex-col items-center overflow-hidden rounded-xl2 border border-olive/10 bg-white/70 p-5 text-center shadow-soft hover:-translate-y-1 hover:bg-white hover:shadow-card"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink to-pink-300" />
              <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pink-50">
                <FeatureIcon name={f.icon} />
              </div>
              <h3 className="truncate text-base font-semibold text-olive-800" title={f.title}>
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-olive-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder highlight */}
      {founder && (
        <section className="px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl2 border border-olive/10 bg-white p-8 shadow-card sm:p-10">
            <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-pink shadow-soft">
                {founder.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={founder.photoUrl} alt={founder.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-olive-100 text-2xl font-semibold text-olive-500">
                    {founder.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-olive-900">
                  {founder.name}
                </h2>
                <p className="text-sm font-medium text-pink-700">{founder.title}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-olive-600">{founder.bio}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-olive/10 px-4 py-10 text-center text-olive-400 sm:px-8">
        <p className="text-base font-medium text-olive-600">© {new Date().getFullYear()} Glow &amp; Grammar</p>
        <p className="mt-2 text-base">Розробка сайту та адміністрування — Даніїл Заболотний</p>
      </footer>
    </div>
  );
}
