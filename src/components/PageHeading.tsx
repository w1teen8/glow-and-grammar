// Clean page heading with a serif accent, generous spacing, a single
// gradient-tipped accent bar — no busy decorative motifs.
export default function PageHeading({
  title,
  subtitle,
  accent = "bg-pink",
}: {
  title: string;
  subtitle?: string;
  accent?: string;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-olive-900 sm:text-4xl">
        {title}
      </h1>
      <span className={`mt-3 block h-1 w-12 rounded-full shadow-sm ${accent}`} />
      {subtitle && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-olive-500">{subtitle}</p>}
    </div>
  );
}
