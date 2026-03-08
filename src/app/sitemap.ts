import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://readov.com";

  const routes = [
    "",
    "/about",
    "/contact",
    "/feed",
    "/leaderboard",
    "/privacy",
    "/terms",
    "/vision-ink",
    "/dual-verse",
    "/vocabulary",
    "/sentences",
    "/support",
    "/payment",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
