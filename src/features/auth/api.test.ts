import { describe, expect, it } from "vitest";
import { resolveRealName } from "./api";

describe("resolveRealName", () => {
  it("prioritizes full_name over username", () => {
    const user = {
      username: "victoriousking35",
      full_name: "Obaseki Collins",
      name: "victoriousking35",
    };
    expect(resolveRealName(user)).toBe("Obaseki Collins");
  });

  it("combines first_name and last_name when full_name is absent", () => {
    const user = {
      username: "victoriousking35",
      first_name: "Obaseki",
      last_name: "Collins",
      name: "victoriousking35",
    };
    expect(resolveRealName(user)).toBe("Obaseki Collins");
  });

  it("returns first_name if last_name is null/empty", () => {
    const user = {
      username: "victoriousking35",
      first_name: "Obaseki",
      last_name: null,
      name: "victoriousking35",
    };
    expect(resolveRealName(user)).toBe("Obaseki");
  });

  it("returns name if distinct from username", () => {
    const user = {
      username: "victoriousking35",
      name: "Obaseki Collins",
    };
    expect(resolveRealName(user)).toBe("Obaseki Collins");
  });

  it("does not return username if name equals username and fallbackName is given", () => {
    const user = {
      username: "victoriousking35",
      name: "victoriousking35",
    };
    expect(resolveRealName(user, "Valued Customer")).toBe("Valued Customer");
  });

  it("handles null or undefined input gracefully", () => {
    expect(resolveRealName(null)).toBe("");
    expect(resolveRealName(undefined, "there")).toBe("there");
  });
});
