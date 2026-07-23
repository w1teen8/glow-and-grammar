import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  return (
    <div className="min-h-screen">
      <header className="animate-fade-in border-b border-olive/10 px-4 py-5 sm:px-8">
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
          <div className="absolute -right-24 -top-24 h-96 w-96 animate-float-slow rounded-full bg-pink-300/15 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 animate-float-slow rounded-full bg-cream/5 blur-3xl [animation-delay:2s]" />
          <div className="absolute left-1/3 top-1/2 h-64 w-64 animate-float rounded-full bg-olive-300/10 blur-3xl [animation-delay:1s]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <span
            className="mb-5 inline-flex animate-fade-in-down items-center gap-1.5 rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-cream/80 backdrop-blur-sm"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 animate-wiggle text-pink-300">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Персональний цифровий кабінет
          </span>
          <h1 className="animate-fade-in-up font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Вільно говори англійською разом із Glow &amp; Grammar
          </h1>
          <p
            className="mt-6 max-w-xl animate-fade-in-up text-base leading-relaxed text-cream/80"
            style={{ animationDelay: "120ms" }}
          >
            Персональний цифровий кабінет для навчання: програма занять, домашні завдання, слова для
            вивчення та фінансовий баланс — в одному місці.
          </p>
          <div className="mt-9 flex flex-wrap animate-fade-in-up gap-3" style={{ animationDelay: "240ms" }}>
            <Link
              href="/register"
              className="rounded-full bg-pink px-7 py-3 text-sm font-semibold text-olive-900 shadow-premium transition-transform hover:-translate-y-0.5 hover:scale-[1.03] hover:brightness-95"
            >
              Записатись на урок
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-cream/40 px-7 py-3 text-sm font-medium text-cream transition-transform hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-cream/10"
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
            {Object.entries(TARIFF_LABELS).map(([key, label], i) => (
              <div
                key={key}
                className="group relative flex animate-fade-in-up flex-col overflow-hidden rounded-xl2 border border-olive/10 bg-white p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-premium"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink to-pink-300" />
                <h3 className="text-base font-semibold text-olive-800">{label}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-olive-400">
                  {TARIFF_DESCRIPTIONS[key as TariffPlan]}
                </p>
                <Link
                  href="/register"
                  className="mt-5 rounded-full bg-pink px-4 py-2 text-center text-xs font-semibold text-olive-900 shadow-soft transition-transform group-hover:scale-[1.02] group-hover:brightness-95"
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
      <section className="relative mx-auto max-w-5xl px-0 py-16 sm:px-0">
        <div className="bg-orb -left-16 top-1/2 hidden h-56 w-56 -translate-y-1/2 animate-float-slow bg-olive-300/10 sm:block" aria-hidden />
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-olive-300">Що всередині кабінету</p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative flex animate-fade-in-up flex-col items-center overflow-hidden rounded-xl2 border border-olive/10 bg-white/70 p-5 text-center shadow-soft transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white hover:shadow-card"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink to-pink-300 bg-[length:200%_100%] transition-[background-position] duration-700 group-hover:animate-gradient-x" />
              <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pink-50 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-110">
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
          <div className="group relative mx-auto max-w-5xl animate-fade-in-up overflow-hidden rounded-xl2 border border-olive/10 bg-white p-8 shadow-card transition-shadow duration-300 hover:shadow-premium sm:p-10">
            <div className="bg-orb -right-16 -top-16 h-52 w-52 animate-float-slow bg-pink-300/15" aria-hidden />
            <div className="relative flex flex-col items-start gap-7 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0">
                <span className="absolute -inset-1.5 animate-pulse rounded-full bg-pink/20 [animation-duration:3s]" aria-hidden />
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-pink shadow-soft transition-transform duration-300 group-hover:scale-105">
                  {founder.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={founder.photoUrl} alt={founder.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-olive-100 text-2xl font-semibold text-olive-500">
                      {founder.name.charAt(0)}
                    </div>
                  )}
                </div>
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

      {/* Closing CTA — gives the stretch between the founder card and the
          footer some purpose instead of leaving it bare. */}
      <section className="px-4 pb-20 sm:px-8">
        <div className="relative mx-auto max-w-5xl animate-fade-in-up overflow-hidden rounded-xl2 bg-gradient-to-br from-olive-700 via-olive-800 to-olive-900 px-6 py-14 text-center text-cream shadow-premium sm:px-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-10 -top-10 h-48 w-48 animate-float rounded-full bg-pink-300/15 blur-3xl" />
            <div className="absolute -right-10 -bottom-10 h-48 w-48 animate-float-slow rounded-full bg-cream/10 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Готові розпочати шлях до вільної англійської?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/75">
              Створіть акаунт — і перший урок можна буде запланувати вже сьогодні.
            </p>
            <Link
              href="/register"
              className="mt-7 inline-flex rounded-full bg-pink px-8 py-3 text-sm font-semibold text-olive-900 shadow-premium transition-transform hover:-translate-y-0.5 hover:scale-[1.03] hover:brightness-95"
            >
              Записатись на урок
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-olive/10 px-4 py-10 text-center text-olive-400 sm:px-8">
        <p className="text-base font-medium text-olive-600">© {new Date().getFullYear()} Glow &amp; Grammar</p>
        <p className="mt-2 text-base">Розробка сайту та адміністрування — Даніїл Заболотний</p>
        <p className="mt-1 text-base">
          <a href="mailto:w1teen111@gmail.com" className="text-olive-500 underline hover:text-olive-700">
            w1teen111@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
