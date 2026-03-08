import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/settings", "/api", "/auth", "/login", "/signup"],
    },
    sitemap: "https://readov.com/sitemap.xml",
  };
}
