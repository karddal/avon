import { describe, expect, it } from "vitest";

import { initials } from "./unit_utils";

describe("initials", () => {
  it("uses the first and last words of a full name", () => {
    expect(initials("Ada King Lovelace")).toBe("AL");
  });

  it("handles single names", () => {
    expect(initials("Plato")).toBe("P");
  });

  it("trims surrounding whitespace", () => {
    expect(initials("  grace hopper  ")).toBe("GH");
  });
});
