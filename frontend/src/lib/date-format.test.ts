import { describe, expect, it } from "vitest";

import {
  formatIsoDate,
  formatIsoDateTime,
  formatIsoShortDate,
  formatIsoTime,
} from "./date-format";

describe("date-format", () => {
  it("formats ISO dates without applying local timezone offsets", () => {
    expect(formatIsoDate("2026-04-29")).toBe("29/04/2026");
    expect(formatIsoShortDate("2026-04-29")).toBe("29 Apr 26");
  });

  it("formats ISO date-times and times", () => {
    const value = "2026-04-29T09:05:30Z";

    expect(formatIsoTime(value)).toBe("09:05");
    expect(formatIsoDateTime(value)).toBe("29 Apr 26, 09:05");
  });

  it("returns invalid or unsupported values unchanged", () => {
    expect(formatIsoDate("not-a-date")).toBe("not-a-date");
    expect(formatIsoShortDate("not-a-date")).toBe("not-a-date");
    expect(formatIsoTime("29/04/2026")).toBe("29/04/2026");
    expect(formatIsoDateTime("29/04/2026")).toBe("29/04/2026");
  });
});
