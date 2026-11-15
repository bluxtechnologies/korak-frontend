import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthHeroShowcase } from "./AuthHeroShowcase";

describe("AuthHeroShowcase Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders Korak Digitals branding and initial telecom feature slide", () => {
    render(<AuthHeroShowcase />);

    expect(screen.getByText("Korak Digitals")).toBeInTheDocument();
    expect(screen.getByText(/automated airtime & high-speed data/i)).toBeInTheDocument();
    expect(screen.getByText(/instant telecom/i)).toBeInTheDocument();
  });

  it("switches slides when clicking pagination buttons", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<AuthHeroShowcase />);

    const paginationButtons = screen.getAllByRole("button", { name: /go to slide/i });
    expect(paginationButtons).toHaveLength(3);

    // Click slide 2 (VPN)
    await user.click(paginationButtons[1]);
    expect(screen.getByText(/zero-log security/i)).toBeInTheDocument();
    expect(screen.getByText(/high-performance encrypted vpn/i)).toBeInTheDocument();

    // Click slide 3 (Social)
    await user.click(paginationButtons[2]);
    expect(screen.getByText(/growth marketplace/i)).toBeInTheDocument();
    expect(screen.getByText(/boost & expand your social reach/i)).toBeInTheDocument();
  });

  it("auto-rotates slides on interval", () => {
    render(<AuthHeroShowcase />);

    expect(screen.getByText(/instant telecom/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/zero-log security/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/growth marketplace/i)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
