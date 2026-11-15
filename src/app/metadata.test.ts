import { describe, expect, it } from "vitest";
import { metadata as rootMetadata, viewport as rootViewport } from "./layout";
import { metadata as homeMetadata } from "./(guest)/page";
import { metadata as privacyMetadata } from "./(guest)/privacy/page";
import { metadata as termsMetadata } from "./(guest)/terms/page";
import { metadata as authMetadata } from "./(auth)/layout";
import { metadata as dashboardMetadata } from "./(dashboard)/layout";
import { GUEST_CONTENT } from "@/config/guest-content";

describe("Next.js Metadata API (F7A.4)", () => {
  describe("Root Metadata & Viewport", () => {
    it("defines metadataBase as a valid URL", () => {
      expect(rootMetadata.metadataBase).toBeInstanceOf(URL);
    });

    it("configures title template and default brand title", () => {
      const title = rootMetadata.title as { template: string; default: string };
      expect(title.template).toContain("%s");
      expect(title.default).toContain("Korak Digitals");
    });

    it("configures theme-color for light and dark modes in viewport", () => {
      const themeColor = rootViewport.themeColor as Array<{
        media: string;
        color: string;
      }>;
      expect(themeColor).toEqual([
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#09090b" },
      ]);
    });
  });

  describe("Per-page Metadata (Guest Pages)", () => {
    it("configures unique title, description, canonical URL, and OG for Homepage (/)", () => {
      expect(homeMetadata.title).toBe("Digital Services & Marketplace");
      expect(homeMetadata.description).toBe(GUEST_CONTENT.hero.support);
      expect(homeMetadata.alternates?.canonical).toBe("/");

      const og = homeMetadata.openGraph as Record<string, unknown>;
      expect(og?.title).toContain("Korak Digitals");
      expect(og?.type).toBe("website");

      const tw = homeMetadata.twitter as Record<string, unknown>;
      expect(tw?.card).toBe("summary");
    });

    it("configures unique title, description, canonical URL, and OG for /privacy", () => {
      expect(privacyMetadata.title).toBe("Privacy Policy");
      expect(privacyMetadata.description).toBe(
        GUEST_CONTENT.privacyPolicy.description
      );
      expect(privacyMetadata.alternates?.canonical).toBe("/privacy");

      const og = privacyMetadata.openGraph as Record<string, unknown>;
      expect(og?.title).toContain("Privacy Policy");
      expect(og?.type).toBe("article");
    });

    it("configures unique title, description, canonical URL, and OG for /terms", () => {
      expect(termsMetadata.title).toBe("Terms of Service");
      expect(termsMetadata.description).toBe(
        GUEST_CONTENT.termsOfService.description
      );
      expect(termsMetadata.alternates?.canonical).toBe("/terms");

      const og = termsMetadata.openGraph as Record<string, unknown>;
      expect(og?.title).toContain("Terms of Service");
      expect(og?.type).toBe("article");
    });
  });

  describe("Search Engine Indexing Protection (noindex / nofollow)", () => {
    it("sets robots: { index: false, follow: false } on (auth) layout", () => {
      const robots = authMetadata.robots as { index: boolean; follow: boolean };
      expect(robots).toBeDefined();
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(false);
    });

    it("sets robots: { index: false, follow: false } on (dashboard) layout", () => {
      const robots = dashboardMetadata.robots as {
        index: boolean;
        follow: boolean;
      };
      expect(robots).toBeDefined();
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(false);
    });
  });
});
