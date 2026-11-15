import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      disallow: [
        "/api/",
        "/overview",
        "/profile",
        "/settings",
        "/notifications",
        "/transactions",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-device",
        "/session-expired",
        "/forbidden",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
