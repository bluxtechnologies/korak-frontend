import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import RootLayout from "./layout";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({
    variable: "--font-sans",
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("RootLayout (React 19 Clean Rendering)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children without logging React 19 script tag warnings", () => {
    const errorSpy = vi.spyOn(console, "error");

    render(
      <RootLayout>
        <div data-testid="test-child">App Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("test-child")).toBeDefined();
    expect(screen.getByTestId("test-child").textContent).toBe("App Content");

    const scriptTagWarning = errorSpy.mock.calls.some((args) =>
      args.some(
        (arg) =>
          typeof arg === "string" && arg.includes("Encountered a script tag")
      )
    );
    expect(scriptTagWarning).toBe(false);

    errorSpy.mockRestore();
  });
});
