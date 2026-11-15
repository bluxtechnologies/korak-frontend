import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AppPageLoader } from "./AppPageLoader";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("AppPageLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPathname = "/";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders on initial mount with the brand page loader and Korak Digitals wordmark", () => {
    render(<AppPageLoader initialDurationMs={300} />);
    const loader = screen.getByTestId("app-page-loader");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveTextContent(/korak digitals/i);
  });

  it("fades out and unmounts after initialDurationMs has elapsed", () => {
    render(<AppPageLoader initialDurationMs={300} />);
    expect(screen.getByTestId("app-page-loader")).toBeInTheDocument();

    // Advance through initial duration and fade transition
    act(() => {
      vi.advanceTimersByTime(350); // triggers fading
    });

    act(() => {
      vi.advanceTimersByTime(350); // triggers unmount
    });

    expect(screen.queryByTestId("app-page-loader")).not.toBeInTheDocument();
  });

  it("re-displays the loader when the route pathname changes", () => {
    const { rerender } = render(
      <AppPageLoader initialDurationMs={100} transitionDurationMs={100} />
    );

    // Initial mount unmounts
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(screen.queryByTestId("app-page-loader")).not.toBeInTheDocument();

    // Change pathname
    mockPathname = "/login";
    rerender(
      <AppPageLoader initialDurationMs={100} transitionDurationMs={100} />
    );

    // Loader should be visible again
    expect(screen.getByTestId("app-page-loader")).toBeInTheDocument();

    // And then unmounts again after transition duration
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(screen.queryByTestId("app-page-loader")).not.toBeInTheDocument();
  });
});
