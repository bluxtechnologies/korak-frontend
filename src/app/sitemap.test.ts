import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { getSiteUrl } from "@/lib/site-url";

describe("sitemap.ts (F7A.4)", () => {
  it("includes only /, /privacy, and /terms entries with correct canonical URLs", () => {
    const siteUrl = getSiteUrl();
    const entries = sitemap();

    expect(entries).toHaveLength(3);

    const urls = entries.map((e) => e.url);
    expect(urls).toEqual([
      `${siteUrl}/`,
      `${siteUrl}/privacy`,
      `${siteUrl}/terms`,
    ]);
  });

  it("assigns appropriate priorities and change frequencies", () => {
    const entries = sitemap();
    const home = entries.find((e) => e.url.endsWith("/"));
    const privacy = entries.find((e) => e.url.endsWith("/privacy"));
    const terms = entries.find((e) => e.url.endsWith("/terms"));

    expect(home?.priority).toBe(1.0);
    expect(home?.changeFrequency).toBe("weekly");

    expect(privacy?.priority).toBe(0.5);
    expect(privacy?.changeFrequency).toBe("monthly");

    expect(terms?.priority).toBe(0.5);
    expect(terms?.changeFrequency).toBe("monthly");
  });
});
