import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const existsSync = vi.fn();

vi.mock("node:fs", () => ({
  existsSync,
}));

describe("server-runtime", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    existsSync.mockReset();
    process.env = { ...originalEnv };
    delete process.env.APP_ENV;
    delete process.env.BA_DATABASE_URL;
    delete process.env.SQLITE_DB_PATH;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("normalizes supported app environment aliases", async () => {
    const { getAppEnv, isTestAppEnv } = await import("./server-runtime");

    process.env.APP_ENV = "e2e";
    expect(getAppEnv()).toBe("test");
    expect(isTestAppEnv()).toBe(true);

    process.env.APP_ENV = "prod";
    expect(getAppEnv()).toBe("production");
  });

  it("defaults to production when only the external database is configured", async () => {
    const { getAppEnv, shouldUseExternalDatabase } = await import(
      "./server-runtime"
    );

    process.env.BA_DATABASE_URL = "postgres://example";

    expect(getAppEnv()).toBe("production");
    expect(shouldUseExternalDatabase()).toBe(true);
  });

  it("falls back to development for unknown app environments", async () => {
    const { getAppEnv } = await import("./server-runtime");

    process.env.APP_ENV = "preview";

    expect(getAppEnv()).toBe("development");
  });

  it("uses an explicit sqlite path before probing candidates", async () => {
    const { getSqliteDbPath } = await import("./server-runtime");

    process.env.SQLITE_DB_PATH = "/tmp/custom.sqlite";

    expect(getSqliteDbPath()).toBe("/tmp/custom.sqlite");
    expect(existsSync).not.toHaveBeenCalled();
  });

  it("returns the first existing sqlite candidate", async () => {
    const { getSqliteDbPath } = await import("./server-runtime");

    existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true);

    expect(getSqliteDbPath()).toMatch(/sqlite\.db$/);
    expect(existsSync).toHaveBeenCalledTimes(2);
  });

  it("falls back to the first sqlite candidate when none exist", async () => {
    const { getSqliteDbPath } = await import("./server-runtime");

    existsSync.mockReturnValue(false);

    expect(getSqliteDbPath()).toMatch(/sqlite\.db$/);
    expect(existsSync).toHaveBeenCalledTimes(4);
  });
});
