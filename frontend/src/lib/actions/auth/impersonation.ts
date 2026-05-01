"use server";

import { parseSetCookieHeader } from "better-auth/cookies";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";

type ImpersonationErrorCode =
  | "not_admin"
  | "target_not_found"
  | "session_not_changed"
  | "already_impersonating"
  | "not_impersonating"
  | "restore_failed"
  | "unexpected";

type ImpersonationActionResult =
  | {
      success: false;
      code: ImpersonationErrorCode;
      error: string;
      details?: string;
    }
  | {
      success: true;
      userId?: string;
      userName?: string;
    };

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  return typeof record.body === "string"
    ? record.body
    : typeof record.message === "string"
      ? record.message
      : undefined;
}

function getStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const record = error as Record<string, unknown>;
  return typeof record.statusCode === "number"
    ? record.statusCode
    : typeof record.status === "number"
      ? record.status
      : null;
}

function normaliseMessage(message: string) {
  return message.toLowerCase();
}

function mapStartError(error: unknown): {
  code: ImpersonationErrorCode;
  message: string;
} {
  const statusCode = getStatusCode(error);
  const message = normaliseMessage(getErrorMessage(error, ""));

  if (statusCode === 403 || message.includes("not allowed")) {
    return {
      code: "not_admin",
      message: "You do not have permission to impersonate users.",
    };
  }

  if (statusCode === 404 || message.includes("not found")) {
    return {
      code: "target_not_found",
      message: "That user no longer exists.",
    };
  }

  if (message.includes("cannot impersonate admins")) {
    return {
      code: "not_admin",
      message: "Admin users cannot be impersonated.",
    };
  }

  return {
    code: "unexpected",
    message: getErrorMessage(error, "Failed to start impersonation"),
  };
}

function mapStopError(error: unknown): {
  code: ImpersonationErrorCode;
  message: string;
  canTreatAsStopped: boolean;
} {
  const statusCode = getStatusCode(error);
  const message = normaliseMessage(getErrorMessage(error, ""));

  if (
    statusCode === 400 ||
    statusCode === 401 ||
    message.includes("not impersonating")
  ) {
    return {
      code: "not_impersonating",
      message: "You are already back in your own session.",
      canTreatAsStopped: true,
    };
  }

  if (message.includes("failed to find admin session")) {
    return {
      code: "restore_failed",
      message:
        "Could not restore the admin session. Sign out and sign in again.",
      canTreatAsStopped: false,
    };
  }

  return {
    code: "unexpected",
    message: getErrorMessage(error, "Failed to return to admin account"),
    canTreatAsStopped: false,
  };
}

async function readSession() {
  return auth.api
    .getSession({
      headers: await headers(),
    })
    .catch(() => null);
}

function toSameSite(value: unknown) {
  return value === "lax" || value === "strict" || value === "none"
    ? value
    : undefined;
}

async function applyAuthSetCookieHeaders(responseHeaders: Headers | null) {
  const setCookieHeader = responseHeaders?.get("set-cookie");

  if (!setCookieHeader) {
    return false;
  }

  const cookieStore = await cookies();
  const parsedCookies = parseSetCookieHeader(setCookieHeader);

  parsedCookies.forEach((value, name) => {
    const alternateName = getAlternateAuthCookieName(name);

    if (alternateName) {
      cookieStore.set(alternateName, "", {
        maxAge: 0,
        path: value.path ?? "/",
      });
    }

    cookieStore.set(name, decodeURIComponent(value.value), {
      sameSite: toSameSite(value.samesite),
      secure: value.secure,
      maxAge: value["max-age"],
      httpOnly: value.httponly,
      domain: value.domain,
      path: value.path,
      expires: value.expires,
    });
  });

  return parsedCookies.size > 0;
}

function getAlternateAuthCookieName(name: string) {
  if (name.startsWith("__Secure-")) {
    return name.slice("__Secure-".length);
  }

  if (name.startsWith("__Host-")) {
    return name.slice("__Host-".length);
  }

  if (name.startsWith("better-auth.")) {
    return `__Secure-${name}`;
  }

  return null;
}

function getImpersonatedBy(session: unknown) {
  if (typeof session !== "object" || session === null) {
    return null;
  }

  const value = (session as Record<string, unknown>).impersonatedBy;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function logImpersonationFailure(
  action: "start" | "stop",
  context: Record<string, unknown>,
) {
  console.error("Impersonation action failed", {
    action,
    ...context,
  });
}

export async function impersonate_managed_user(
  userId: string,
): Promise<ImpersonationActionResult> {
  const beforeSession = await readSession();
  const beforeImpersonatedBy = beforeSession
    ? getImpersonatedBy(beforeSession.session)
    : null;

  if (beforeImpersonatedBy) {
    return {
      success: false,
      code: "already_impersonating",
      error: "Exit the current impersonation before starting another one.",
    };
  }

  try {
    const result = await auth.api.impersonateUser({
      body: {
        userId,
      },
      headers: await headers(),
      returnHeaders: true,
    });
    const cookiesApplied = await applyAuthSetCookieHeaders(result.headers);
    const resultImpersonatedBy = getImpersonatedBy(result.response.session);

    if (
      result.response.user.id !== userId ||
      !resultImpersonatedBy ||
      !cookiesApplied
    ) {
      logImpersonationFailure("start", {
        reason: "result_session_not_impersonated",
        beforeUserId: beforeSession?.user.id,
        targetUserId: userId,
        resultUserId: result.response.user.id,
        resultImpersonatedBy,
        cookiesApplied,
      });

      return {
        success: false,
        code: "session_not_changed",
        error:
          "The server created a session but the browser did not accept it. Check production cookie settings.",
      };
    }

    return {
      success: true,
      userId: result.response.user.id,
      userName: result.response.user.name,
    };
  } catch (error) {
    const mapped = mapStartError(error);
    logImpersonationFailure("start", {
      code: mapped.code,
      statusCode: getStatusCode(error),
      details: getErrorDetails(error),
      targetUserId: userId,
      currentUserId: beforeSession?.user.id,
    });

    return {
      success: false,
      code: mapped.code,
      error: mapped.message,
      details: getErrorDetails(error),
    };
  }
}

export async function stop_impersonating(): Promise<ImpersonationActionResult> {
  const beforeSession = await readSession();
  const beforeImpersonatedBy = beforeSession
    ? getImpersonatedBy(beforeSession.session)
    : null;

  if (!beforeSession || !beforeImpersonatedBy) {
    return { success: true };
  }

  try {
    const result = await auth.api.stopImpersonating({
      headers: await headers(),
      returnHeaders: true,
    });

    const cookiesApplied = await applyAuthSetCookieHeaders(result.headers);

    if (!cookiesApplied) {
      logImpersonationFailure("stop", {
        reason: "missing_stop_set_cookie_header",
        beforeUserId: beforeSession.user.id,
        beforeImpersonatedBy,
      });

      return {
        success: false,
        code: "restore_failed",
        error:
          "Could not restore the admin session. Sign out and sign in again.",
      };
    }

    return { success: true };
  } catch (error) {
    const mapped = mapStopError(error);

    if (mapped.canTreatAsStopped) {
      return { success: true };
    }

    logImpersonationFailure("stop", {
      code: mapped.code,
      statusCode: getStatusCode(error),
      details: getErrorDetails(error),
      currentUserId: beforeSession.user.id,
      impersonatedBy: beforeImpersonatedBy,
    });

    return {
      success: false,
      code: mapped.code,
      error: mapped.message,
      details: getErrorDetails(error),
    };
  }
}
