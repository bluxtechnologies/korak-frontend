import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VpnLogsPage, { metadata } from "./page";

vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

describe("VpnLogsPage (Phase 4)", () => {
  it("defines correct page metadata", () => {
    expect(metadata.title).toBe("VPN Session Logs & Audit | Korak Digitals");
    expect(metadata.description).toContain("Review connection sessions");
  });

  it("renders VPN session logs view", async () => {
    const el = await VpnLogsPage();
    render(el);

    expect(screen.getByRole("heading", { level: 1, name: /Dedicated VPN Service/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export Audit Logs/i })).toBeInTheDocument();
  });
});
