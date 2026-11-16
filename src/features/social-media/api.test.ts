import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAvailableAccounts,
  buySocialAccount,
  getBoostServices,
  createSocialBoostOrder,
  revealSocialCredentials,
  MOCK_SOCIAL_ACCOUNTS,
  MOCK_BOOST_SERVICES,
} from "./api";
import { api } from "@/lib/api";

describe("Social Media API (F19 & B19)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAvailableAccounts", () => {
    it("returns available social media accounts", async () => {
      const accounts = await getAvailableAccounts();
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts[0]).toHaveProperty("handle");
      expect(accounts[0]).toHaveProperty("followers_count");
      expect(accounts[0]).toHaveProperty("price");
    });

    it("filters accounts by platform", async () => {
      const igAccounts = await getAvailableAccounts({ platform: "instagram" });
      expect(igAccounts.every((a) => a.platform === "instagram")).toBe(true);
    });

    it("filters accounts by search query", async () => {
      const results = await getAvailableAccounts({ search: "techpulse" });
      expect(results.length).toBe(1);
      expect(results[0].handle).toBe("techpulse_hub");
    });
  });

  describe("buySocialAccount", () => {
    it("creates an order record with completed status and masked credentials", async () => {
      const order = await buySocialAccount({
        product_id: "acc_ig_01",
        idempotency_key: "idem_key_123",
      });

      expect(order).toBeDefined();
      expect(order.category).toBe("social");
      expect(order.reference).toMatch(/^SOC-/);
      expect(order.status).toBe("completed");
      expect(order.credentials?.login_password).toBe("••••••••••••");
    });
  });

  describe("getBoostServices", () => {
    it("returns all boost services when no platform filter is given", async () => {
      const services = await getBoostServices();
      expect(services.length).toBe(MOCK_BOOST_SERVICES.length);
    });

    it("filters boost services by platform", async () => {
      const tiktokServices = await getBoostServices("tiktok");
      expect(tiktokServices.every((s) => s.platform === "tiktok")).toBe(true);
      expect(tiktokServices.length).toBeGreaterThan(0);
    });
  });

  describe("createSocialBoostOrder", () => {
    it("creates a boost order with correct price calculation", async () => {
      const srv = MOCK_BOOST_SERVICES[0];
      const quantity = 2000;
      const expectedCost = Math.round((quantity / 1000) * srv.rate_per_thousand);

      const order = await createSocialBoostOrder({
        service_id: srv.id,
        platform: srv.platform,
        target_link: "https://instagram.com/myaccount",
        quantity,
        idempotency_key: "boost_idem_456",
      });

      expect(order.reference).toMatch(/^BST-/);
      expect(order.amount).toBe(expectedCost);
      expect(order.status).toBe("processing");
      expect(order.beneficiary).toBe("https://instagram.com/myaccount");
    });
  });

  describe("revealSocialCredentials", () => {
    it("returns unmasked credentials and an audit log ID", async () => {
      const revealed = await revealSocialCredentials("ord_soc_999");
      expect(revealed.order_id).toBe("ord_soc_999");
      expect(revealed.password).not.toBe("••••••••••••");
      expect(revealed.audit_id).toMatch(/^aud_rev_/);
      expect(revealed.revealed_at).toBeDefined();
    });
  });
});
