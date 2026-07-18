import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glowgrammar.com";

// Only the public, unauthenticated routes belong here — everything under
// (app) requires a session and shouldn't be crawled or indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/login", "/register"];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
