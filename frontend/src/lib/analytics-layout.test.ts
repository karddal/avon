import { describe, expect, it } from "vitest";

import {
  availableAnalyticsModules,
  defaultAnalyticsLayout,
  isValidGridItem,
  parseAnalyticsLayout,
} from "./analytics-layout";

describe("analytics-layout", () => {
  it("exposes the default modules as available modules", () => {
    expect(availableAnalyticsModules).toEqual(
      expect.arrayContaining(
        defaultAnalyticsLayout.map((item) => item.moduleKey),
      ),
    );
  });

  it("parses valid serialized layouts", () => {
    expect(
      parseAnalyticsLayout(JSON.stringify(defaultAnalyticsLayout)),
    ).toEqual(defaultAnalyticsLayout);
  });

  it("rejects malformed, non-array, and partially invalid layouts", () => {
    expect(parseAnalyticsLayout(null)).toBeNull();
    expect(parseAnalyticsLayout("{")).toBeNull();
    expect(
      parseAnalyticsLayout(JSON.stringify({ id: "not-an-array" })),
    ).toBeNull();
    expect(
      parseAnalyticsLayout(
        JSON.stringify([
          defaultAnalyticsLayout[0],
          { ...defaultAnalyticsLayout[1], moduleKey: "missing-module" },
        ]),
      ),
    ).toBeNull();
  });

  it("validates grid item shape", () => {
    expect(isValidGridItem(defaultAnalyticsLayout[0])).toBe(true);
    expect(isValidGridItem(undefined)).toBe(false);
    expect(isValidGridItem({ ...defaultAnalyticsLayout[0], x: "0" })).toBe(
      false,
    );
  });
});
