import Link from "next/link";

const FEATURES = [
  "Syllabus Tracker — програма занять: що пройшли і що попереду",
  "Homework Corner — завдання, аудіовідповіді та фідбек",
  "Vocabulary — списки слів після кожного заняття з дедлайном на вивчення",
  "Payment & Attendance — календар занять і статус оплат",
];

export default function AuthSidePanel({
  founderName,
  founderTitle,
  founderPhotoUrl,
  experience,
  teachingExperience,
  specialties,
}: {
  founderName?: string;
  founderTitle?: string;
  founderPhotoUrl?: string | null;
  experience?: string | null;
  teachingExperience?: string | null;
  specialties: string[];
}) {
  return (
    <div className="relative flex flex-col justify-center gap-9 overflow-hidden bg-gradient-to-br from-olive-500 via-olive-700 to-olive-900 px-8 py-16 text-cream sm:px-20">
      {/* Decorative depth — soft blurred shapes, never covering the text. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-cream/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-pink-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <Link href="/" className="text-xs font-medium uppercase tracking-[0.3em] text-cream/70 hover:text-cream">
          ← Школа англійської мови
        </Link>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Glow &amp; Grammar
        </h1>
        <span className="mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-pink to-pink-300 shadow-sm" />

        {founderName && (
          <div className="mt-9 flex items-start gap-4 border-t border-cream/20 pt-7">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-pink bg-olive-900 shadow-soft">
              {founderPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={founderPhotoUrl} alt={founderName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-cream/80">
                  {founderName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">{founderName}</p>
              {founderTitle && <p className="text-sm text-cream/70">{founderTitle}</p>}
              {(experience || teachingExperience) && (
                <p className="mt-1 text-sm font-medium text-pink-300">
                  {[experience, teachingExperience].filter(Boolean).join(" | ")}
                </p>
              )}
            </div>
          </div>
        )}

        {specialties.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-cream/30 bg-cream/5 px-3 py-1 text-xs text-cream/80"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-9 border-t border-cream/20 pt-7">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-cream/60">Що в кабінеті</p>
          <ul className="space-y-2.5 text-sm text-cream/85">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
