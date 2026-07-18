import FeatureIcon, { type FeatureIconName } from "./FeatureIcon";

// Shared "nothing here yet" placeholder — replaces the plain dashed-box text
// that used to be copy-pasted into every list page.
export default function EmptyState({
  message,
  icon = "inbox",
}: {
  message: string;
  icon?: FeatureIconName;
}) {
  return (
    <div className="group relative animate-scale-in overflow-hidden rounded-xl2 border border-dashed border-olive/25 bg-white/50 px-6 py-16 text-center">
      <div className="bg-orb -right-10 -top-10 h-32 w-32 animate-float-slow bg-pink-300/20" aria-hidden />
      <div className="bg-orb -bottom-12 -left-10 h-32 w-32 animate-float-slow bg-olive-300/15 [animation-delay:1.5s]" aria-hidden />
      <div className="relative mx-auto mb-4 flex h-14 w-14 animate-float items-center justify-center rounded-full bg-pink-50">
        <FeatureIcon name={icon} className="h-7 w-7 text-pink-700/70" />
      </div>
      <p className="relative text-olive-400">{message}</p>
    </div>
  );
}
