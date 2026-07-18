import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glow-and-grammar.onrender.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/home", "/syllabus", "/homework", "/vocabulary", "/payments", "/api"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
