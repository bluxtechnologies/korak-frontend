import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VpnPage, { metadata } from "./page";

vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

describe("VpnPage (Phase 4)", () => {
  it("defines correct page metadata", () => {
    expect(metadata.title).toBe("Secure Dedicated VPN | Korak Digitals");
    expect(metadata.description).toContain("10 Gbps WireGuard & OpenVPN tunnels");
  });

  it("renders VPN page container and title", async () => {
    const el = await VpnPage();
    render(el);

    expect(screen.getByRole("heading", { level: 1, name: /Dedicated VPN Service/i })).toBeInTheDocument();
    expect(screen.getByText(/London Dedicated Node #1/i)).toBeInTheDocument();
  });
});
