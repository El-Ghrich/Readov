import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/profile", 
        "/settings", 
        "/api", 
        "/auth", 
        "/login", 
        "/signup",
        "/create",
        "/editor",
        "/stories",
        "/feed",
        "/vision-ink",
        "/dual-verse",
        "/vocabulary",
        "/payment"
      ],
    },
    sitemap: "https://readov.com/sitemap.xml",
  };
}
