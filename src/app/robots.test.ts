import { describe, expect, it } from "vitest";
import robots from "./robots";
import { getSiteUrl } from "@/lib/site-url";

describe("robots.ts (F7A.4)", () => {
  it("allows only public guest routes and disallows internal/auth routes", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;

    expect(rules).toBeDefined();
    expect(rules?.userAgent).toBe("*");
    expect(rules?.allow).toEqual(["/", "/privacy", "/terms"]);

    const disallowed = Array.isArray(rules?.disallow) ? rules.disallow : [rules?.disallow];
    expect(disallowed).toContain("/api/");
    expect(disallowed).toContain("/overview");
    expect(disallowed).toContain("/login");
    expect(disallowed).toContain("/register");
    expect(disallowed).toContain("/forgot-password");
    expect(disallowed).toContain("/reset-password");
    expect(disallowed).toContain("/verify-device");
    expect(disallowed).toContain("/session-expired");
    expect(disallowed).toContain("/forbidden");
  });

  it("points to the sitemap URL using the canonical site URL", () => {
    const siteUrl = getSiteUrl();
    const config = robots();
    expect(config.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });
});
