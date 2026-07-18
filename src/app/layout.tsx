import type { Metadata } from "next";
import { Manrope, Literata } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Serif accent for headlines and brand wordmarks only — never body copy.
const display = Literata({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

// Custom domain is live as of the glowgrammar.com DNS cutover — keep this
// (and NEXTAUTH_URL in Render's env vars) in sync if the domain ever changes.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glowgrammar.com";

// The Cyrillic spellings exist purely so people searching in Russian/Ukrainian
// by ear ("глоу грамар", "глоу граммар", "глоуграмар") can still land on the
// right result — they're real alternate names, not hidden keyword-stuffing.
const ALT_NAMES = [
  "Глоу Грамар",
  "Глоу Граммар",
  "Глоуграмар",
  "Гло енд Грамар",
  "Glow and Grammar",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Glow & Grammar (Глоу Грамар) — школа англійської мови",
    template: "%s · Glow & Grammar",
  },
  description:
    "Glow & Grammar (пишуть також «Глоу Грамар», «Глоу Граммар», «Глоуграмар») — персональний цифровий кабінет школи англійської мови: програма занять, домашні завдання, слова для вивчення та фінансовий баланс в одному місці.",
  keywords: ["Glow & Grammar", ...ALT_NAMES, "школа англійської мови", "вивчення англійської онлайн"],
  openGraph: {
    title: "Glow & Grammar (Глоу Грамар)",
    description: "Персональний цифровий кабінет школи англійської мови Glow & Grammar.",
    url: SITE_URL,
    siteName: "Glow & Grammar",
    locale: "uk_UA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={`${body.variable} ${display.variable} font-sans text-olive-900 antialiased`}>
        <script
          type="application/ld+json"
          // Structured data is the cleanest way to tell search engines about
          // alternate/transliterated names without stuffing them into visible copy.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Glow & Grammar",
              alternateName: ALT_NAMES,
              url: SITE_URL,
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
