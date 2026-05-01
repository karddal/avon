import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  getSession: vi.fn(),
  impersonateUser: vi.fn(),
  stopImpersonating: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: mocks.cookieSet,
  })),
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: mocks,
  },
}));

import { impersonate_managed_user, stop_impersonating } from "./impersonation";

describe("impersonation actions", () => {
  beforeEach(() => {
    mocks.cookieSet.mockReset();
    mocks.getSession.mockReset();
    mocks.impersonateUser.mockReset();
    mocks.stopImpersonating.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  function authCookieHeaders() {
    return new Headers({
      "set-cookie":
        "__Secure-better-auth.session_token=session-token; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax, __Secure-better-auth.admin_session=admin-token; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax",
    });
  }

  it("maps forbidden impersonation failures to a permission error", async () => {
    mocks.getSession.mockResolvedValueOnce({
      session: {},
      user: { id: "admin-id" },
    });
    mocks.impersonateUser.mockRejectedValueOnce({
      statusCode: 403,
      message: "You are not allowed to impersonate users",
    });

    const result = await impersonate_managed_user("student-id");

    expect(result).toEqual({
      success: false,
      code: "not_admin",
      error: "You do not have permission to impersonate users.",
      details: "You are not allowed to impersonate users",
    });
  });

  it("only reports start success when BetterAuth returns an impersonated session", async () => {
    mocks.getSession.mockResolvedValueOnce({
      session: {},
      user: { id: "admin-id" },
    });
    mocks.impersonateUser.mockResolvedValueOnce({
      headers: authCookieHeaders(),
      response: {
        session: { impersonatedBy: "admin-id", token: "student-token" },
        user: { id: "student-id", name: "Student User" },
      },
    });

    const result = await impersonate_managed_user("student-id");

    expect(result).toEqual({
      success: true,
      userId: "student-id",
      userName: "Student User",
    });
    expect(mocks.cookieSet).toHaveBeenCalled();
  });

  it("rejects a start response that does not contain an impersonated session", async () => {
    mocks.getSession.mockResolvedValueOnce({
      session: {},
      user: { id: "admin-id" },
    });
    mocks.impersonateUser.mockResolvedValueOnce({
      headers: authCookieHeaders(),
      response: {
        session: { token: "student-token" },
        user: { id: "student-id", name: "Student User" },
      },
    });

    const result = await impersonate_managed_user("student-id");

    expect(result).toEqual({
      success: false,
      code: "session_not_changed",
      error:
        "The server created a session but the browser did not accept it. Check production cookie settings.",
    });
  });

  it("surfaces a missing admin session when stopping impersonation", async () => {
    mocks.getSession.mockResolvedValueOnce({
      session: { impersonatedBy: "admin-id" },
      user: { id: "student-id" },
    });
    mocks.stopImpersonating.mockRejectedValueOnce(
      new Error("Failed to find admin session"),
    );

    const result = await stop_impersonating();

    expect(result).toEqual({
      success: false,
      code: "restore_failed",
      error: "Could not restore the admin session. Sign out and sign in again.",
      details: "Failed to find admin session",
    });
  });
});
