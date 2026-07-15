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

export const metadata: Metadata = {
  title: "Glow & Grammar",
  description: "Персональний освітній простір для учнів школи англійської мови Glow & Grammar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={`${body.variable} ${display.variable} font-sans text-olive-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
