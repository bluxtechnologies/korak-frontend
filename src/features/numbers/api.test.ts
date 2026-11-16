import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  COUNTRIES,
  PLATFORMS,
  orderOtpNumber,
  checkOtpStatus,
  cancelOtpOrder,
  getRentalNumbers,
  rentNumber,
  MOCK_ACTIVE_OTP_ORDER,
  MOCK_RENTAL_RECORDS,
} from "./api";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Numbers & OTP API service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports valid countries and platforms lists", () => {
    expect(COUNTRIES.length).toBeGreaterThan(0);
    expect(PLATFORMS.length).toBeGreaterThan(0);

    const us = COUNTRIES.find((c) => c.code === "US");
    expect(us).toBeDefined();
    expect(us?.dial_code).toBe("+1");

    const whatsapp = PLATFORMS.find((p) => p.id === "whatsapp");
    expect(whatsapp).toBeDefined();
    expect(whatsapp?.price).toBeGreaterThan(0);
  });

  it("orders a temporary OTP number", async () => {
    const order = await orderOtpNumber({
      country_id: "us",
      platform_id: "whatsapp",
    });

    expect(order).toBeDefined();
    expect(order.mode).toBe("otp");
    expect(order.country.id).toBe("us");
    expect(order.platform.id).toBe("whatsapp");
    expect(order.phone_number).toContain("+1");
    expect(order.status).toBe("waiting");
  });

  it("checks status of active OTP order", async () => {
    const status = await checkOtpStatus("act_otp_01");
    expect(status).toBeDefined();
    expect(status.id).toBe(MOCK_ACTIVE_OTP_ORDER.id);
  });

  it("cancels and refunds an OTP order", async () => {
    const result = await cancelOtpOrder("act_otp_01");
    expect(result.success).toBe(true);
    expect(result.refunded_amount).toBeGreaterThan(0);
  });

  it("retrieves active rental numbers", async () => {
    const rentals = await getRentalNumbers();
    expect(rentals).toBeDefined();
    expect(rentals.length).toBe(MOCK_RENTAL_RECORDS.length);
  });

  it("orders a long-term rental number", async () => {
    const rental = await rentNumber({
      country_id: "gb",
      platform_id: "telegram",
      rental_days: 7,
      auto_renew: true,
    });

    expect(rental).toBeDefined();
    expect(rental.country.id).toBe("gb");
    expect(rental.rental_days).toBe(7);
    expect(rental.auto_renew).toBe(true);
    expect(rental.phone_number).toContain("+44");
  });
});
