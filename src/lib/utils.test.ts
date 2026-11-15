import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("combines class names correctly", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes and falsy values", () => {
    expect(cn("base-class", false && "hidden", null, undefined, "active")).toBe(
      "base-class active"
    );
  });

  it("merges conflicting Tailwind utility classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
