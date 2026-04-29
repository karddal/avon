import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("health route", () => {
  it("returns OK", async () => {
    const response = GET();

    await expect(response.text()).resolves.toBe("OK");
    expect(response.status).toBe(200);
  });
});
