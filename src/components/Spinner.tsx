// Dual-ring spinner used everywhere a page is fetching data, instead of a
// plain "Завантаження…" line. `label` is optional — pass null to hide it.
export default function Spinner({
  label = "Завантаження…",
  className = "py-16",
}: {
  label?: string | null;
  className?: string;
}) {
  return (
    <div className={`flex animate-fade-in flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-olive/15" />
        <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-pink border-r-pink/40" />
      </div>
      {label && <p className="text-sm text-olive-400">{label}</p>}
    </div>
  );
}
