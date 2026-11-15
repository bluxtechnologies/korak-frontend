import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { ThemeProvider, useTheme } from "./theme-provider";

function TestConsumer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("system")}>Set System</button>
    </div>
  );
}

describe("ThemeProvider & useTheme (React 19 native)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("renders children without throwing or logging script tag warnings", () => {
    const errorSpy = vi.spyOn(console, "error");

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("system");
    const scriptWarning = errorSpy.mock.calls.some((args) =>
      args.some((arg) => typeof arg === "string" && arg.includes("Encountered a script tag"))
    );
    expect(scriptWarning).toBe(false);
    errorSpy.mockRestore();
  });

  it("switches theme and updates documentElement and localStorage", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);

    await user.click(screen.getByText("Set Dark"));

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    await user.click(screen.getByText("Set Light"));

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("respects forcedTheme when provided", () => {
    render(
      <ThemeProvider forcedTheme="dark">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
