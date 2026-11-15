import { describe, expect, it } from "vitest";
import { GUEST_CONTENT, type GuestContent } from "./guest-content";

describe("guest-content dictionary", () => {
  it("marks all prose copy as DRAFT", () => {
    expect(GUEST_CONTENT.hero.h1).toContain("[DRAFT]");
    expect(GUEST_CONTENT.hero.support).toContain("[DRAFT]");
    expect(GUEST_CONTENT.services.sectionTitle).toContain("[DRAFT]");
    expect(GUEST_CONTENT.services.sectionDescription).toContain("[DRAFT]");
    expect(GUEST_CONTENT.howItWorks.sectionTitle).toContain("[DRAFT]");
    expect(GUEST_CONTENT.howItWorks.sectionDescription).toContain("[DRAFT]");
    expect(GUEST_CONTENT.security.sectionTitle).toContain("[DRAFT]");
    expect(GUEST_CONTENT.security.sectionDescription).toContain("[DRAFT]");
    expect(GUEST_CONTENT.closingCta.title).toContain("[DRAFT]");
    expect(GUEST_CONTENT.closingCta.description).toContain("[DRAFT]");

    GUEST_CONTENT.services.items.forEach((item) => {
      expect(item.description).toContain("[DRAFT]");
    });

    GUEST_CONTENT.howItWorks.steps.forEach((step) => {
      expect(step.description).toContain("[DRAFT]");
    });

    GUEST_CONTENT.security.items.forEach((item) => {
      expect(item.description).toContain("[DRAFT]");
    });
  });

  it("contains no forbidden buzzwords or non-standard claims", () => {
    const serialized = JSON.stringify(GUEST_CONTENT).toLowerCase();
    expect(serialized).not.toContain("bank-grade");
    expect(serialized).not.toContain("100% safe");
    expect(serialized).not.toContain("unbreakable");
    expect(serialized).not.toContain("guaranteed speed");
    expect(serialized).not.toContain("instant delivery");
  });

  it("does not name specific payment methods", () => {
    const serialized = JSON.stringify(GUEST_CONTENT.howItWorks).toLowerCase();
    expect(serialized).not.toContain("card");
    expect(serialized).not.toContain("stripe");
    expect(serialized).not.toContain("paypal");
    expect(serialized).not.toContain("crypto");
    expect(serialized).not.toContain("paystack");
    expect(serialized).not.toContain("flutterwave");
  });

  it("defines exactly five services with required titles", () => {
    expect(GUEST_CONTENT.services.items).toHaveLength(5);
    const titles = GUEST_CONTENT.services.items.map((s) => s.title);
    expect(titles).toEqual([
      "Airtime",
      "Data",
      "VPN",
      "Buy social media accounts",
      "Boost social media accounts",
    ]);
  });

  it("defines exactly three how-it-works steps in sequence", () => {
    expect(GUEST_CONTENT.howItWorks.steps).toHaveLength(3);
    expect(GUEST_CONTENT.howItWorks.steps[0].title).toBe("Create an account");
    expect(GUEST_CONTENT.howItWorks.steps[1].title).toBe("Add funds to your wallet");
    expect(GUEST_CONTENT.howItWorks.steps[2].title).toBe(
      "Choose a service and place your order"
    );
  });

  it("defines only the three Doc 08 security protections", () => {
    expect(GUEST_CONTENT.security.items).toHaveLength(3);
    const titles = GUEST_CONTENT.security.items.map((p) => p.title);
    expect(titles).toEqual([
      "Verification on new devices",
      "Protection against repeated login attempts",
      "Sensitive details hidden by default",
    ]);
  });

  it("specifies complete photo slot metadata for the hero", () => {
    const slot = GUEST_CONTENT.hero.photoSlot;
    expect(slot.fileName).toBe("hero-dashboard-preview.png");
    expect(slot.pixelSize).toBe("1280x800");
    expect(slot.aspectRatio).toBe("16:10");
    expect(slot.subject).toBeTruthy();
    expect(slot.altText).toBeTruthy();
  });

  /* -------------------------------------------------------------
   * F7A.3 Legal Content & Review Guardrails
   * ------------------------------------------------------------- */
  it("keeps legalReviewed flag set to false by default", () => {
    expect(GUEST_CONTENT.legalReviewed).toBe(false);
  });

  it("fails if legalReviewed is true while any '[TO BE CONFIRMED' text remains", () => {
    function validateLegalContent(content: GuestContent) {
      const legalText = JSON.stringify({
        privacy: content.privacyPolicy,
        terms: content.termsOfService,
      });

      if (content.legalReviewed && legalText.includes("[TO BE CONFIRMED")) {
        throw new Error(
          "Safety Invariant Violation: legalReviewed flag cannot be set to true while '[TO BE CONFIRMED' placeholders remain in legal documents."
        );
      }
      return true;
    }

    // Must pass in current state (legalReviewed: false)
    expect(validateLegalContent(GUEST_CONTENT)).toBe(true);

    // Must fail if legalReviewed is set to true with unconfirmed placeholders
    const mockReviewedWithTbc: GuestContent = {
      ...GUEST_CONTENT,
      legalReviewed: true,
    };
    expect(() => validateLegalContent(mockReviewedWithTbc)).toThrow(
      /Safety Invariant Violation/
    );
  });

  it("does not claim compliance with any named legal regulations in legal drafts", () => {
    const legalText = JSON.stringify({
      privacy: GUEST_CONTENT.privacyPolicy,
      terms: GUEST_CONTENT.termsOfService,
    }).toLowerCase();

    expect(legalText).not.toContain("gdpr");
    expect(legalText).not.toContain("ccpa");
    expect(legalText).not.toContain("ndpr");
    expect(legalText).not.toContain("hipaa");
  });

  it("covers all required Privacy Policy sections with unconfirmed items marked TBC", () => {
    const sectionIds = GUEST_CONTENT.privacyPolicy.sections.map((s) => s.id);
    expect(sectionIds).toContain("account-data");
    expect(sectionIds).toContain("device-verification");
    expect(sectionIds).toContain("orders-transactions");
    expect(sectionIds).toContain("security-audit-logs");
    expect(sectionIds).toContain("cookies");
    expect(sectionIds).toContain("data-retention");
    expect(sectionIds).toContain("contact");

    const privacyJson = JSON.stringify(GUEST_CONTENT.privacyPolicy);
    expect(privacyJson).toContain("[TO BE CONFIRMED");
  });

  it("covers all required Terms of Service sections with unconfirmed items marked TBC", () => {
    const sectionIds = GUEST_CONTENT.termsOfService.sections.map((s) => s.id);
    expect(sectionIds).toContain("account-responsibilities");
    expect(sectionIds).toContain("acceptable-use");
    expect(sectionIds).toContain("wallet-orders");
    expect(sectionIds).toContain("refunds");
    expect(sectionIds).toContain("service-availability");
    expect(sectionIds).toContain("limitation-liability");
    expect(sectionIds).toContain("governing-law");
    expect(sectionIds).toContain("contact");

    const termsJson = JSON.stringify(GUEST_CONTENT.termsOfService);
    expect(termsJson).toContain("[TO BE CONFIRMED");
  });
});
