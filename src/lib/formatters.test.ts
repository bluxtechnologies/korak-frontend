import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatNaira, maskCurrency } from "./formatters";

describe("formatters", () => {
  describe("formatCurrency", () => {
    it("formats standard NGN minor units correctly", () => {
      expect(formatCurrency(4525000, "NGN")).toBe("₦45,250.00");
      expect(formatCurrency(100, "NGN")).toBe("₦1.00");
      expect(formatCurrency(50, "NGN")).toBe("₦0.50");
      expect(formatCurrency(0, "NGN")).toBe("₦0.00");
    });

    it("formats negative amounts with minus sign prefix", () => {
      expect(formatCurrency(-120000, "NGN")).toBe("-₦1,200.00");
      expect(formatCurrency(-50, "NGN")).toBe("-₦0.50");
    });

    it("supports other currencies with standard symbols or fallbacks", () => {
      expect(formatCurrency(150000, "USD")).toBe("$1,500.00");
      expect(formatCurrency(250000, "EUR")).toBe("€2,500.00");
      expect(formatCurrency(300000, "GBP")).toBe("£3,000.00");
      expect(formatCurrency(100000, "CAD")).toBe("CAD 1,000.00");
    });
  });

  describe("formatNaira", () => {
    it("formats major Naira units into currency string", () => {
      expect(formatNaira(3500)).toBe("₦3,500.00");
      expect(formatNaira(0)).toBe("₦0.00");
    });
  });

  describe("maskCurrency", () => {
    it("returns masked currency placeholder", () => {
      expect(maskCurrency("NGN")).toBe("₦••••••");
      expect(maskCurrency("USD")).toBe("$••••••");
    });
  });

  describe("formatDate", () => {
    it("formats valid ISO dates", () => {
      const formatted = formatDate("2026-11-14T10:30:00Z");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("Nov");
    });

    it("returns dash for invalid date input", () => {
      expect(formatDate("invalid-date")).toBe("—");
    });
  });
});
